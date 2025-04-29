// utils/validators.js - Utilidades para validación
const mongoose = require('mongoose');

/**
 * Validador de email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido, false si no
 */
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email)};
/**
 * Validar formato de teléfono
 * @param {string} phone - Número telefónico a validar
 * @returns {boolean} - True si es válido, false si no
 */
const isValidPhone = (phone) => {
  // Eliminar caracteres no numéricos excepto + al inicio
  const cleanPhone = phone.replace(/(?!^\+)\D/g, '');
  
  // Verificar formato básico (puede adaptarse según país)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Validar formato de tiempo HH:MM
 * @param {string} time - Cadena de tiempo a validar
 * @returns {boolean} - True si es válido, false si no
 */
const isValidTime = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

module.exports = {
  isValidEmail,
  isValidLicensePlate,
  isValidMongoId,
  isValidCreditCard,
  validatePassword,
  sanitizeInput,
  isValidDate,
  isValidNumber,
  isValidPhone,
  isValidTime
};

/**
 * Validador de placa de vehículo
 * @param {string} licensePlate - Placa a validar
 * @returns {boolean} - True si es válido, false si no
 */
const isValidLicensePlate = (licensePlate) => {
  // Formato básico para placas (alfanumérico de 3-10 caracteres)
  // Este formato puede ajustarse según los requerimientos específicos de cada país
  const plateRegex = /^[A-Za-z0-9-]{3,10}$/;
  return plateRegex.test(licensePlate);
};

/**
 * Verificar si un ID de MongoDB es válido
 * @param {string} id - ID a validar
 * @returns {boolean} - True si es válido, false si no
 */
const isValidMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validador de número de tarjeta de crédito
 * @param {string} cardNumber - Número de tarjeta a validar
 * @returns {boolean} - True si es válido, false si no
 */
const isValidCreditCard = (cardNumber) => {
  // Eliminar espacios y guiones
  cardNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Verificar que solo contenga dígitos y longitud adecuada (13-19 dígitos)
  if (!/^\d{13,19}$/.test(cardNumber)) {
    return false;
  }
  
  // Algoritmo de Luhn (validación de checksum)
  let sum = 0;
  let double = false;
  
  // Iterate from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));
    
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    double = !double;
  }
  
  return sum % 10 === 0;
};

/**
 * Validador de contraseña segura
 * @param {string} password - Contraseña a validar
 * @returns {object} - Objeto con resultado de validación
 */
const validatePassword = (password) => {
  const result = {
    isValid: false,
    errors: []
  };
  
  // Verificar longitud
  if (password.length < 8) {
    result.errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  // Verificar al menos una mayúscula
  if (!/[A-Z]/.test(password)) {
    result.errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  
  // Verificar al menos un número
  if (!/\d/.test(password)) {
    result.errors.push('La contraseña debe contener al menos un número');
  }
  
  // Verificar al menos un carácter especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.errors.push('La contraseña debe contener al menos un carácter especial');
  }
  
  // Si no hay errores, la contraseña es válida
  result.isValid = result.errors.length === 0;
  
  return result;
};

/**
 * Sanear entrada para prevenir inyecciones
 * @param {string} input - Texto a sanear
 * @returns {string} - Texto saneado
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Eliminar caracteres potencialmente peligrosos
  return input
    .replace(/<[^>]*>/g, '') // Eliminar etiquetas HTML
    .replace(/[^\w\s.,?!@:;()\-]/g, '') // Permitir caracteres seguros
    .trim();
};

/**
 * Validar fechas
 * @param {string|Date} date - Fecha a validar
 * @param {Object} options - Opciones de validación
 * @returns {boolean} - True si es válida, false si no
 */
const isValidDate = (date, options = {}) => {
  // Convertir a objeto Date si es string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar si es una fecha válida
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return false;
  }
  
  // Verificar fecha mínima
  if (options.minDate && dateObj < new Date(options.minDate)) {
    return false;
  }
  
  // Verificar fecha máxima
  if (options.maxDate && dateObj > new Date(options.maxDate)) {
    return false;
  }
  
  return true;
};

/**
 * Validar que sea un número (entero o decimal)
 * @param {any} value - Valor a validar
 * @param {Object} options - Opciones de validación
 * @returns {boolean} - True si es válido, false si no
 */
const isValidNumber = (value, options = {}) => {
  // Convertir a número si es string
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verificar que sea un número
  if (isNaN(num) || typeof num !== 'number') {
    return false;
  }
  
  // Verificar valor mínimo
  if (options.min !== undefined && num < options.min) {
    return false;
  }
  
  // Verificar valor máximo
  if (options.max !== undefined && num > options.max) {
    return false;
  }
  
  // Verificar si es entero cuando se requiere
  if (options.integer && !Number.isInteger(num)) {
    return false;
  }
  
  return true;
};