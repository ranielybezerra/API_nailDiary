const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validarLogin } = require('../middlewares/validation.middleware');

// POST /api/auth/login
router.post('/login', validarLogin, authController.login);

// GET /api/auth/validate (requer token)
router.get('/validate', authController.validarToken);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;



