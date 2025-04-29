//Controlador de Autenticación
const User = require('../models/user');
const asyncHandler = require('express-async-handler');

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Verificar si el usuario ya existe
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Usuario ya existe');
  }

  // Crear usuario
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: user.getSignedJwtToken()
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validar email y password
  if (!email || !password) {
    res.status(400);
    throw new Error('Por favor proporcione email y contraseña');
  }

  // Verificar usuario
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }

  // Verificar si la contraseña coincide
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }

  // Crear token
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: user.getSignedJwtToken()
  });
});

module.exports = {
  registerUser,
  loginUser
};