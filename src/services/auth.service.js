const usuarioRepository = require('../repositories/usuario.repository');
const { compararSenha } = require('../utils/hash.util');
const { gerarToken } = require('../utils/jwt.util');

class AuthService {
  /**
   * Realiza login do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário e token
   */
  async login(email, senha) {
    // Buscar usuário por email
    const usuario = await usuarioRepository.findByEmail(email);
    
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const senhaValida = await compararSenha(senha, usuario.senha);
    
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token JWT
    const token = gerarToken({
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
    });

    // Retornar dados do usuário (sem senha) e token
    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
      token,
    };
  }

  /**
   * Valida token JWT
   * @param {string} token - Token JWT
   * @returns {Promise<Object>} Dados do usuário do token
   */
  async validarToken(token) {
    try {
      const { verificarToken } = require('../utils/jwt.util');
      const payload = verificarToken(token);
      
      // Buscar usuário para verificar se ainda existe
      const usuario = await usuarioRepository.findById(payload.id);
      
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      return {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
      };
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Verifica se o usuário é admin
   * @param {Object} usuario - Dados do usuário
   * @returns {boolean} True se for admin
   */
  isAdmin(usuario) {
    return usuario.role === 'ADMIN';
  }
}

module.exports = new AuthService();



