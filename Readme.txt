// ParkingSoft API - Estructura básica del proyecto
// Estructura de archivos recomendada:
/*
parkingsoft-api/
├── config/
│   ├── config.js           // Configuraciones generales
│   └── database.js         // Configuración de la base de datos
├── controllers/
│   ├── authController.js   // Control de autenticación
│   ├── parkingController.js // Control de espacios de estacionamiento
│   ├── vehicleController.js // Control de vehículos
│   └── paymentController.js // Control de pagos
├── middlewares/
│   ├── auth.js             // Middleware de autenticación
│   └── errorHandler.js     // Manejo de errores
├── models/
│   ├── User.js             // Modelo de usuario
│   ├── ParkingSpace.js     // Modelo de espacio de estacionamiento
│   ├── Vehicle.js          // Modelo de vehículo
│   ├── ParkingRecord.js    // Modelo de registro de estacionamiento
│   └── Payment.js          // Modelo de pago
├── routes/
│   ├── authRoutes.js       // Rutas de autenticación
│   ├── parkingRoutes.js    // Rutas de estacionamiento
│   ├── vehicleRoutes.js    // Rutas de vehículos
│   └── paymentRoutes.js    // Rutas de pagos
├── utils/
│   ├── logger.js           // Utilidad para logging
│   └── validators.js       // Validaciones
├── app.js                  // Configuración de la aplicación
├── server.js               // Punto de entrada
├── package.json            // Dependencias
└── .env                    // Variables de entorno
*/