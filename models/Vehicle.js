
// models/Vehicle.js - Modelo de Vehículo
const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  licensePlate: {
    type: String,
    required: [true, 'Por favor ingrese una placa'],
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['carro', 'moto', 'camion'],
    default: 'car'
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);