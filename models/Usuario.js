/**
 * models/Usuario.js
 * -----------------------------------------------------------------------------
 * Modelo de datos del usuario construido con Mongoose.
 *
 * El esquema define la estructura que tendra cada documento dentro de la
 * coleccion "usuarios" de MongoDB y las validaciones minimas de cada campo.
 */

const mongoose = require('mongoose');

// Definicion del esquema (estructura de los documentos de la coleccion)
const EsquemaUsuario = new mongoose.Schema({
  // Nombre de usuario con el que se realiza el inicio de sesion
  usuario: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: true,      // no se permiten dos usuarios con el mismo nombre
    trim: true,        // elimina espacios al inicio y al final
    lowercase: true,   // se almacena en minusculas para evitar duplicados
    minlength: [4, 'El nombre de usuario debe tener minimo 4 caracteres']
  },

  // Contrasena CIFRADA con bcrypt. Nunca se guarda el texto plano.
  contrasena: {
    type: String,
    required: [true, 'La contrasena es obligatoria']
  },

  // Correo electronico opcional del usuario registrado
  correo: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },

  // Fecha de creacion del registro
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

// Se exporta el modelo para poder utilizarlo desde el repositorio
module.exports = mongoose.model('Usuario', EsquemaUsuario);
