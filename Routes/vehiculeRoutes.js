// routes/vehicleRoutes.js - Rutas de Vehículos
const express = require('express');
const { 
  getVehicles, 
  getVehicleById, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle,
  searchVehicleByPlate
} = require('../Controllers/vehicleController');
const { protect, authorize } = require('../middlewares/auth');
const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Ruta para buscar vehículos por placa
router.get('/search/:licensePlate', searchVehicleByPlate);

// Rutas CRUD básicas
router.route('/')
  .get(getVehicles)
  .post(createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .put(updateVehicle)
  .delete(deleteVehicle);

module.exports = router;