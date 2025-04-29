// middlewares/errorHandler.js - Manejador de Errores
const errorHandler = (err, req, res, next) => {
    // Copiar objeto de error
    let error = { ...err };
  
    error.message = err.message;
  
    // Log para desarrollador
    console.log(err.stack);
  
    // Mongoose: ID inválido
    if (err.name === 'CastError') {
      const message = `Recurso no encontrado`;
      error = new Error(message);
      error.statusCode = 404;
    }
  
    // Mongoose: Duplicado clave
    if (err.code === 11000) {
      const message = `Valor duplicado para el campo`;
      error = new Error(message);
      error.statusCode = 400;
    }
  
    // Mongoose: Error de validación
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      error = new Error(message);
      error.statusCode = 400;
    }
  
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Error del servidor'
    });
  };
  
  module.exports = errorHandler;