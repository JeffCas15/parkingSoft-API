// middlewares/auth.js - Middleware de Autenticación
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user');

// Proteger rutas
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Verificar si hay token en los headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extraer token del header
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar si el token existe
  if (!token) {
    res.status(401);
    throw new Error('No autorizado para acceder a esta ruta');
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar usuario al request
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    res.status(401);
    throw new Error('No autorizado para acceder a esta ruta');
  }
});

// Autorizar por rol
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Rol ${req.user.role} no autorizado para acceder a esta ruta`);
    }
    next();
  };
};

module.exports = { protect, authorize };