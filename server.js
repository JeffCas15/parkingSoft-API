// server.js - Punto de entrada
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/database');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Inicializar Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));
app.use('/api/vehicles', require('./routes/vehiculeRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a ParkingSoft API' });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});