// routes/paymentRoutes.js - Rutas de Pagos
const express = require('express');
const { 
  getPayments, 
  getPaymentById, 
  createPayment, 
  voidPayment,
  getDailyPaymentsReport
} = require('../Controllers/paymentController');
const { protect, authorize } = require('../middlewares/auth');
const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas para reportes (solo admin)
router.get('/reports/daily', authorize('admin'), getDailyPaymentsReport);

// Rutas CRUD básicas
router.route('/')
  .get(authorize('admin'), getPayments)
  .post(createPayment);

router.route('/:id')
  .get(getPaymentById);

// Ruta para anular un pago (solo admin)
router.post('/:id/void', authorize('admin'), voidPayment);

module.exports = router;