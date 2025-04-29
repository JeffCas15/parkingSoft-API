// models/Payment.js - Modelo de Pago
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  parkingRecord: {
    type: mongoose.Schema.ObjectId,
    ref: 'ParkingRecord',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Por favor ingrese un monto de pago'],
    min: [0, 'El monto no puede ser negativo']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'app'],
    required: [true, 'Por favor seleccione un método de pago']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  transactionId: {
    type: String,
    default: null
  },
  receiptNumber: {
    type: String,
    unique: true,
    required: true
  },
  processedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  // Para anulaciones
  voidStatus: {
    type: Boolean,
    default: false
  },
  voidDate: {
    type: Date,
    default: null
  },
  voidReason: {
    type: String,
    default: null
  },
  voidBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Método para generar número de recibo
PaymentSchema.statics.generateReceiptNumber = function() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RC-${dateStr}-${randomStr}`;
};

// Virtual para determinar si el pago está activo o anulado
PaymentSchema.virtual('status').get(function() {
  return this.voidStatus ? 'anulado' : 'activo';
});

module.exports = mongoose.model('Payment', PaymentSchema);