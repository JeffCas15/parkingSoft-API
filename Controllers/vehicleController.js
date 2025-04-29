// Controlador de Vehículos
const Vehicle = require('../models/Vehicle');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');

// @desc    Obtener todos los vehículos
// @route   GET /api/vehicles
// @access  Private
const getVehicles = asyncHandler(async (req, res) => {
  // Si el usuario es admin, puede ver todos los vehículos
  // Si es usuario normal, solo ve sus propios vehículos
  let query = {};
  
  if (req.user.role !== 'admin') {
    query.owner = req.user._id;
  }
  
  const vehicles = await Vehicle.find(query).populate('owner', 'name email');
  res.json(vehicles);
});

// @desc    Obtener un vehículo por ID
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name email');
  
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehículo no encontrado');
  }
  
  // Verificar propiedad del vehículo (solo admin puede ver cualquier vehículo)
  if (req.user.role !== 'admin' && vehicle.owner && vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('No autorizado para ver este vehículo');
  }
  
  res.json(vehicle);
});

// @desc    Crear un nuevo vehículo
// @route   POST /api/vehicles
// @access  Private
const createVehicle = asyncHandler(async (req, res) => {
  const { licensePlate, type, brand, model, color } = req.body;
  
  // Verificar si ya existe un vehículo con esa placa
  const vehicleExists = await Vehicle.findOne({ licensePlate });
  
  if (vehicleExists) {
    res.status(400);
    throw new Error('Ya existe un vehículo con esa placa');
  }
  
  // Crear el vehículo
  const vehicle = await Vehicle.create({
    licensePlate,
    type: type || 'carro',
    brand,
    model,
    color,
    owner: req.user._id  // Asignar propietario automáticamente
  });
  
  res.status(201).json(vehicle);
});

// @desc    Actualizar un vehículo
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = asyncHandler(async (req, res) => {
  let vehicle = await Vehicle.findById(req.params.id);
  
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehículo no encontrado');
  }
  
  // Verificar propiedad del vehículo (solo admin o propietario puede actualizar)
  if (req.user.role !== 'admin' && vehicle.owner && vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('No autorizado para actualizar este vehículo');
  }
  
  // No permitir cambiar la placa si ya existe otro vehículo con esa placa
  if (req.body.licensePlate && req.body.licensePlate !== vehicle.licensePlate) {
    const plateExists = await Vehicle.findOne({ licensePlate: req.body.licensePlate });
    if (plateExists) {
      res.status(400);
      throw new Error('Ya existe un vehículo con esa placa');
    }
  }
  
  // Actualizar vehículo
  vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.json(vehicle);
});

// @desc    Eliminar un vehículo
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  
  if (!vehicle) {
    res.status(404);
    throw new Error('Vehículo no encontrado');
  }
  
  // Verificar propiedad del vehículo (solo admin o propietario puede eliminar)
  if (req.user.role !== 'admin' && vehicle.owner && vehicle.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('No autorizado para eliminar este vehículo');
  }
  
  await vehicle.deleteOne();
  
  res.json({ message: 'Vehículo eliminado' });
});

// @desc    Buscar vehículos por placa
// @route   GET /api/vehicles/search/:licensePlate
// @access  Private
const searchVehicleByPlate = asyncHandler(async (req, res) => {
  const licensePlate = req.params.licensePlate;
  
  // Búsqueda insensible a mayúsculas/minúsculas y parcial
  const vehicles = await Vehicle.find({
    licensePlate: { $regex: licensePlate, $options: 'i' }
  }).populate('owner', 'name email');
  
  res.json(vehicles);
});

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  searchVehicleByPlate
};