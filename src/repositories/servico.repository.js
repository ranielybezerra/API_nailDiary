const prisma = require('../config/database');

class ServicoRepository {
  /**
   * Lista todos os serviços (ativos por padrão)
   * @param {boolean} apenasAtivos - Se deve filtrar apenas serviços ativos
   * @returns {Promise<Array>} Lista de serviços
   */
  async findAll(apenasAtivos = true) {
    const where = apenasAtivos ? { ativo: true } : {};
    
    return await prisma.servico.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca serviço por ID
   * @param {string} id - ID do serviço
   * @returns {Promise<Object|null>} Serviço encontrado ou null
   */
  async findById(id) {
    return await prisma.servico.findUnique({
      where: { id },
    });
  }

  /**
   * Cria um novo serviço
   * @param {Object} servicoData - Dados do serviço
   * @returns {Promise<Object>} Serviço criado
   */
  async create(servicoData) {
    return await prisma.servico.create({
      data: servicoData,
    });
  }

  /**
   * Atualiza um serviço
   * @param {string} id - ID do serviço
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Serviço atualizado
   */
  async update(id, updateData) {
    return await prisma.servico.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Inativa um serviço (soft delete)
   * @param {string} id - ID do serviço
   * @returns {Promise<Object>} Serviço inativado
   */
  async inativar(id) {
    return await prisma.servico.update({
      where: { id },
      data: { ativo: false },
    });
  }

  /**
   * Ativa um serviço
   * @param {string} id - ID do serviço
   * @returns {Promise<Object>} Serviço ativado
   */
  async ativar(id) {
    return await prisma.servico.update({
      where: { id },
      data: { ativo: true },
    });
  }

  /**
   * Remove um serviço permanentemente
   * @param {string} id - ID do serviço
   * @returns {Promise<Object>} Serviço removido
   */
  async delete(id) {
    return await prisma.servico.delete({
      where: { id },
    });
  }
}

module.exports = new ServicoRepository();

