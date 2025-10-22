const prisma = require('../config/database');

class UsuarioRepository {
  /**
   * Busca usuário por email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  async findByEmail(email) {
    return await prisma.usuario.findUnique({
      where: { email },
    });
  }

  /**
   * Busca usuário por ID
   * @param {string} id - ID do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  async findById(id) {
    return await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Cria um novo usuário
   * @param {Object} usuarioData - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
  async create(usuarioData) {
    return await prisma.usuario.create({
      data: usuarioData,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Lista todos os usuários
   * @returns {Promise<Array>} Lista de usuários
   */
  async findAll() {
    return await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Atualiza um usuário
   * @param {string} id - ID do usuário
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Usuário atualizado
   */
  async update(id, updateData) {
    return await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Remove um usuário
   * @param {string} id - ID do usuário
   * @returns {Promise<Object>} Usuário removido
   */
  async delete(id) {
    return await prisma.usuario.delete({
      where: { id },
    });
  }
}

module.exports = new UsuarioRepository();

