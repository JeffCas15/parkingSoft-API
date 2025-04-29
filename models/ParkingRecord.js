// models/ParkingRecord.js - Modelo de Registro de Estacionamiento
const mongoose = require('mongoose');

const ParkingRecordSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  parkingSpace: {
    type: mongoose.Schema.ObjectId,
    ref: 'ParkingSpace',
    required: true
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,  // Duración en minutos
    default: 0
  },
  amount: {
    type: Number,  // Monto a pagar
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'waived'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'app', 'none'],
    default: 'none'
  },
  receiptNumber: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('ParkingRecord', ParkingRecordSchema);