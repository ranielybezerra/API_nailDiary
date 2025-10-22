const { verificarToken, extrairToken } = require('../utils/jwt.util');
const authService = require('../services/auth.service');

/**
 * Middleware para verificar token JWT
 */
const verificarTokenMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extrairToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso necessário',
        code: 'TOKEN_REQUIRED',
      });
    }

    const usuario = await authService.validarToken(token);
    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN',
    });
  }
};

/**
 * Middleware para verificar se o usuário é admin
 */
const verificarAdminMiddleware = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      error: 'Usuário não autenticado',
      code: 'UNAUTHENTICATED',
    });
  }

  if (!authService.isAdmin(req.usuario)) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas administradores',
      code: 'ACCESS_DENIED',
    });
  }

  next();
};

/**
 * Middleware opcional para verificar token (não falha se não houver token)
 */
const verificarTokenOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extrairToken(authHeader);

    if (token) {
      const usuario = await authService.validarToken(token);
      req.usuario = usuario;
    }
  } catch (error) {
    // Ignora erros de token no middleware opcional
  }

  next();
};

module.exports = {
  verificarToken: verificarTokenMiddleware,
  verificarAdmin: verificarAdminMiddleware,
  verificarTokenOpcional,
};



