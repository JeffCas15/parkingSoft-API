// models/ParkingSpace.js - Modelo de Espacio de Estacionamiento
const mongoose = require('mongoose');

const ParkingSpaceSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Por favor ingrese un número de espacio'],
    unique: true,
    trim: true
  },
  floor: {
    type: String,
    required: [true, 'Por favor ingrese un piso'],
    trim: true
  },
  type: {
    type: String,
    enum: ['standard', 'handicapped', 'reserved', 'electric'],
    default: 'standard'
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
  },
  currentVehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  hourlyRate: {
    type: Number,
    required: true,
    default: 5.00
  }
});

module.exports = mongoose.model('ParkingSpace', ParkingSpaceSchema);