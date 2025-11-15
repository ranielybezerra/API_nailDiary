const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class AuthController {
  /**
   * Realiza login do usuário
   */
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      
      const resultado = await authService.login(email, senha);
      
      return successResponse(res, resultado, 'Login realizado com sucesso');
    } catch (error) {
      return errorResponse(res, error.message, 'LOGIN_ERROR', 401);
    }
  }

  /**
   * Valida token e retorna dados do usuário
   */
  async validarToken(req, res) {
    try {
      const usuario = req.usuario;
      
      return successResponse(res, { usuario }, 'Token válido');
    } catch (error) {
      return errorResponse(res, error.message, 'TOKEN_ERROR', 401);
    }
  }

  /**
   * Logout (apenas para documentação - JWT é stateless)
   */
  async logout(req, res) {
    return successResponse(res, null, 'Logout realizado com sucesso');
  }
}

module.exports = new AuthController();







