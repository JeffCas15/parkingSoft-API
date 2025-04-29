// Controlador de Estacionamiento
const ParkingSpace = require('../models/parkingSpace');
const ParkingRecord = require('../models/ParkingRecord');
const Vehicle = require('../models/Vehicle');
const asyncHandler = require('express-async-handler');

// @desc    Obtener todos los espacios de estacionamiento
// @route   GET /api/parking/spaces
// @access  Private
const getParkingSpaces = asyncHandler(async (req, res) => {
  const spaces = await ParkingSpace.find().populate('currentVehicle');
  res.json(spaces);
});

// @desc    Crear espacio de estacionamiento
// @route   POST /api/parking/spaces
// @access  Private/Admin
const createParkingSpace = asyncHandler(async (req, res) => {
  const { number, floor, type, hourlyRate } = req.body;

  const spaceExists = await ParkingSpace.findOne({ number });

  if (spaceExists) {
    res.status(400);
    throw new Error('El espacio de estacionamiento ya existe');
  }

  const space = await ParkingSpace.create({
    number,
    floor,
    type,
    hourlyRate
  });

  res.status(201).json(space);
});

// @desc    Registrar entrada de vehículo
// @route   POST /api/parking/entry
// @access  Private
const registerVehicleEntry = asyncHandler(async (req, res) => {
  const { licensePlate, parkingSpaceId, vehicleType, brand, model, color } = req.body;

  // Verificar si el espacio está disponible
  const parkingSpace = await ParkingSpace.findById(parkingSpaceId);

  if (!parkingSpace) {
    res.status(404);
    throw new Error('Espacio de estacionamiento no encontrado');
  }

  if (parkingSpace.status !== 'available') {
    res.status(400);
    throw new Error('El espacio de estacionamiento no está disponible');
  }

  // Buscar o crear el vehículo
  let vehicle = await Vehicle.findOne({ licensePlate });

  if (!vehicle) {
    vehicle = await Vehicle.create({
      licensePlate,
      type: vehicleType || 'car',
      brand,
      model,
      color
    });
  }

  // Crear registro de estacionamiento
  const parkingRecord = await ParkingRecord.create({
    vehicle: vehicle._id,
    parkingSpace: parkingSpace._id
  });

  // Actualizar estado del espacio
  parkingSpace.status = 'occupied';
  parkingSpace.currentVehicle = vehicle._id;
  await parkingSpace.save();

  res.status(201).json({
    message: 'Entrada registrada exitosamente',
    parkingRecord,
    vehicle,
    parkingSpace
  });
});

// @desc    Registrar salida de vehículo
// @route   POST /api/parking/exit
// @access  Private
const registerVehicleExit = asyncHandler(async (req, res) => {
  const { parkingRecordId, paymentMethod } = req.body;

  // Buscar registro de estacionamiento
  const parkingRecord = await ParkingRecord.findById(parkingRecordId)
    .populate('parkingSpace')
    .populate('vehicle');

  if (!parkingRecord) {
    res.status(404);
    throw new Error('Registro de estacionamiento no encontrado');
  }

  if (parkingRecord.exitTime) {
    res.status(400);
    throw new Error('El vehículo ya ha salido');
  }

  // Registrar salida
  parkingRecord.exitTime = new Date();
  
  // Calcular duración en minutos
  const entryTime = new Date(parkingRecord.entryTime);
  const exitTime = new Date(parkingRecord.exitTime);
  const durationMs = exitTime - entryTime;
  const durationMinutes = Math.ceil(durationMs / (1000 * 60));
  parkingRecord.duration = durationMinutes;
  
  // Calcular monto a pagar (tarifa por hora)
  const hourlyRate = parkingRecord.parkingSpace.hourlyRate || 5;
  const durationHours = durationMinutes / 60;
  parkingRecord.amount = parseFloat((Math.ceil(durationHours) * hourlyRate).toFixed(2));
  
  // Actualizar estado de pago
  if (paymentMethod) {
    parkingRecord.paymentStatus = 'paid';
    parkingRecord.paymentMethod = paymentMethod;
    parkingRecord.receiptNumber = `R-${Date.now()}`;
  }
  
  await parkingRecord.save();
  
  // Liberar espacio de estacionamiento
  const parkingSpace = await ParkingSpace.findById(parkingRecord.parkingSpace);
  parkingSpace.status = 'available';
  parkingSpace.currentVehicle = null;
  await parkingSpace.save();
  
  res.json({
    message: 'Salida registrada exitosamente',
    parkingRecord
  });
});

module.exports = {
  getParkingSpaces,
  createParkingSpace,
  registerVehicleEntry,
  registerVehicleExit
};