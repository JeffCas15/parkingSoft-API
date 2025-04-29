// Controlador de Pagos
const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');
const asyncHandler = require('express-async-handler');

// @desc    Obtener todos los pagos
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = asyncHandler(async (req, res) => {
  // Filtros opcionales por fecha
  const { startDate, endDate } = req.query;
  let query = {};
  
  if (startDate && endDate) {
    query.paymentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (startDate) {
    query.paymentDate = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.paymentDate = { $lte: new Date(endDate) };
  }
  
  const payments = await Payment.find(query)
    .populate({
      path: 'parkingRecord',
      populate: [
        { path: 'vehicle', select: 'licensePlate type brand model' },
        { path: 'parkingSpace', select: 'number floor' }
      ]
    });
  
  res.json(payments);
});

// @desc    Obtener un pago por ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate({
      path: 'parkingRecord',
      populate: [
        { path: 'vehicle', select: 'licensePlate type brand model' },
        { path: 'parkingSpace', select: 'number floor' }
      ]
    });
  
  if (!payment) {
    res.status(404);
    throw new Error('Pago no encontrado');
  }
  
  res.json(payment);
});

// @desc    Crear un nuevo pago
// @route   POST /api/payments
// @access  Private
const createPayment = asyncHandler(async (req, res) => {
  const { 
    parkingRecordId, 
    amount, 
    paymentMethod,
    transactionId
  } = req.body;
  
  // Verificar si existe el registro de estacionamiento
  const parkingRecord = await ParkingRecord.findById(parkingRecordId);
  
  if (!parkingRecord) {
    res.status(404);
    throw new Error('Registro de estacionamiento no encontrado');
  }
  
  // Verificar si ya está pagado
  if (parkingRecord.paymentStatus === 'paid') {
    res.status(400);
    throw new Error('Este registro ya ha sido pagado');
  }
  
  // Verificar que el monto coincida con el calculado
  if (amount !== parkingRecord.amount) {
    res.status(400);
    throw new Error('El monto de pago no coincide con el calculado');
  }
  
  // Crear el pago
  const payment = await Payment.create({
    parkingRecord: parkingRecordId,
    amount,
    paymentMethod,
    transactionId,
    paymentDate: new Date(),
    receiptNumber: `PAY-${Date.now()}`,
    processedBy: req.user._id
  });
  
  // Actualizar el estado de pago en el registro de estacionamiento
  parkingRecord.paymentStatus = 'paid';
  parkingRecord.paymentMethod = paymentMethod;
  parkingRecord.receiptNumber = payment.receiptNumber;
  
  await parkingRecord.save();
  
  res.status(201).json(payment);
});

// @desc    Anular un pago
// @route   POST /api/payments/:id/void
// @access  Private/Admin
const voidPayment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  if (!reason) {
    res.status(400);
    throw new Error('Debe proporcionar un motivo para anular el pago');
  }
  
  const payment = await Payment.findById(req.params.id);
  
  if (!payment) {
    res.status(404);
    throw new Error('Pago no encontrado');
  }
  
  if (payment.voidStatus) {
    res.status(400);
    throw new Error('Este pago ya ha sido anulado');
  }
  
  // Anular el pago
  payment.voidStatus = true;
  payment.voidDate = new Date();
  payment.voidReason = reason;
  payment.voidBy = req.user._id;
  
  await payment.save();
  
  // Actualizar el registro de estacionamiento
  const parkingRecord = await ParkingRecord.findById(payment.parkingRecord);
  
  if (parkingRecord) {
    parkingRecord.paymentStatus = 'pending';
    parkingRecord.paymentMethod = 'none';
    parkingRecord.receiptNumber = null;
    await parkingRecord.save();
  }
  
  res.json({
    message: 'Pago anulado exitosamente',
    payment
  });
});

// @desc    Generar reporte de pagos diarios
// @route   GET /api/payments/reports/daily
// @access  Private/Admin
const getDailyPaymentsReport = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const reportDate = date ? new Date(date) : new Date();
  
  // Establecer inicio y fin del día
  const startOfDay = new Date(reportDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(reportDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Buscar pagos del día
  const payments = await Payment.find({
    paymentDate: { $gte: startOfDay, $lte: endOfDay },
    voidStatus: { $ne: true }
  }).populate({
    path: 'parkingRecord',
    populate: [
      { path: 'vehicle', select: 'licensePlate type' },
      { path: 'parkingSpace', select: 'number floor' }
    ]
  });
  
  // Calcular totales por método de pago
  const totalByCash = payments
    .filter(p => p.paymentMethod === 'cash')
    .reduce((sum, p) => sum + p.amount, 0);
    
  const totalByCard = payments
    .filter(p => p.paymentMethod === 'card')
    .reduce((sum, p) => sum + p.amount, 0);
    
  const totalByApp = payments
    .filter(p => p.paymentMethod === 'app')
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Generar reporte
  const report = {
    date: reportDate,
    totalTransactions: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paymentMethods: {
      cash: {
        count: payments.filter(p => p.paymentMethod === 'cash').length,
        amount: totalByCash
      },
      card: {
        count: payments.filter(p => p.paymentMethod === 'card').length,
        amount: totalByCard
      },
      app: {
        count: payments.filter(p => p.paymentMethod === 'app').length,
        amount: totalByApp
      }
    },
    payments
  };
  
  res.json(report);
});

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  voidPayment,
  getDailyPaymentsReport
};