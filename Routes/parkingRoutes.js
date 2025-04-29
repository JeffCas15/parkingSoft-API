// routes/parkingRoutes.js - Rutas de Estacionamiento
const express = require('express');
const { 
  getParkingSpaces, 
  createParkingSpace,
  registerVehicleEntry,
  registerVehicleExit
} = require('../Controllers/parkingController');
const { protect, authorize } = require('../middlewares/auth');
const router = express.Router();

router.route('/spaces')
  .get(protect, getParkingSpaces)
  .post(protect, authorize('admin'), createParkingSpace);

router.post('/entry', protect, registerVehicleEntry);
router.post('/exit', protect, registerVehicleExit);

module.exports = router;