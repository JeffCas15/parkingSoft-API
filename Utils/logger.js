// utils/logger.js - Utilidad para logging
const fs = require('fs');
const path = require('path');

// Asegurarse de que exista el directorio de logs
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Definir niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Configuración del logger
const config = {
  level: process.env.LOG_LEVEL || 'info',
  logToFile: process.env.LOG_TO_FILE === 'true' || false,
  logToConsole: process.env.LOG_TO_CONSOLE !== 'false',
  dateFormat: () => new Date().toISOString()
};

// Función para escribir al archivo de log
const writeToFile = (message) => {
  const date = new Date();
  const logFileName = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.log`;
  const logFilePath = path.join(logDir, logFileName);
  
  fs.appendFile(logFilePath, message + '\n', (err) => {
    if (err) {
      console.error('Error escribiendo al archivo de log:', err);
    }
  });
};

// Función para formatear el mensaje de log
const formatMessage = (level, message, meta = {}) => {
  const timestamp = config.dateFormat();
  const formattedMeta = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedMeta}`;
};

// Función principal de logging
const log = (level, message, meta = {}) => {
  if (levels[level] <= levels[config.level]) {
    const formattedMessage = formatMessage(level, message, meta);
    
    if (config.logToConsole) {
      if (level === 'error') {
        console.error(formattedMessage);
      } else if (level === 'warn') {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
    
    if (config.logToFile) {
      writeToFile(formattedMessage);
    }
  }
};

// Métodos de conveniencia para cada nivel
const logger = {
  error: (message, meta = {}) => log('error', message, meta),
  warn: (message, meta = {}) => log('warn', message, meta),
  info: (message, meta = {}) => log('info', message, meta),
  debug: (message, meta = {}) => log('debug', message, meta),
  
  // Métodos para logging de eventos específicos
  logApiRequest: (req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userId: req.user ? req.user._id : 'unauthenticated'
    });
    next();
  },
  
  logError: (err, req = {}) => {
    logger.error(`${err.message || 'Error interno del servidor'}`, {
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      userId: req.user ? req.user._id : 'unauthenticated'
    });
  },
  
  // Método para configurar el logger
  configure: (options) => {
    Object.assign(config, options);
    logger.info('Logger configurado', config);
  }
};

module.exports = logger;