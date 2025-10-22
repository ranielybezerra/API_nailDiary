const prisma = require('../config/database');

class DicaRepository {
  /**
   * Lista todas as dicas
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} Lista de dicas
   */
  async findAll(filters = {}) {
    const where = {};
    
    if (filters.titulo) {
      where.titulo = {
        contains: filters.titulo,
        mode: 'insensitive',
      };
    }

    return await prisma.dica.findMany({
      where,
      orderBy: {
        dataPublicacao: 'desc',
      },
    });
  }

  /**
   * Busca dica por ID
   * @param {string} id - ID da dica
   * @returns {Promise<Object|null>} Dica encontrada ou null
   */
  async findById(id) {
    return await prisma.dica.findUnique({
      where: { id },
    });
  }

  /**
   * Cria uma nova dica
   * @param {Object} dicaData - Dados da dica
   * @returns {Promise<Object>} Dica criada
   */
  async create(dicaData) {
    return await prisma.dica.create({
      data: dicaData,
    });
  }

  /**
   * Atualiza uma dica
   * @param {string} id - ID da dica
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Dica atualizada
   */
  async update(id, updateData) {
    return await prisma.dica.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Remove uma dica
   * @param {string} id - ID da dica
   * @returns {Promise<Object>} Dica removida
   */
  async delete(id) {
    return await prisma.dica.delete({
      where: { id },
    });
  }

  /**
   * Busca dicas por título (busca parcial)
   * @param {string} titulo - Título para buscar
   * @returns {Promise<Array>} Lista de dicas encontradas
   */
  async findByTitulo(titulo) {
    return await prisma.dica.findMany({
      where: {
        titulo: {
          contains: titulo,
          mode: 'insensitive',
        },
      },
      orderBy: {
        dataPublicacao: 'desc',
      },
    });
  }
}

module.exports = new DicaRepository();

