const prisma = require('../config/database');

class ConfiguracaoRepository {
  /**
   * Busca configuração por chave
   * @param {string} chave - Chave da configuração
   * @returns {Promise<Object|null>} Configuração encontrada ou null
   */
  async findByChave(chave) {
    return await prisma.configuracao.findUnique({
      where: { chave },
    });
  }

  /**
   * Lista todas as configurações
   * @returns {Promise<Array>} Lista de configurações
   */
  async findAll() {
    return await prisma.configuracao.findMany({
      orderBy: { chave: 'asc' },
    });
  }

  /**
   * Cria ou atualiza uma configuração (upsert)
   * @param {string} chave - Chave da configuração
   * @param {string} valor - Valor da configuração (JSON string)
   * @param {string} descricao - Descrição opcional
   * @returns {Promise<Object>} Configuração criada/atualizada
   */
  async upsert(chave, valor, descricao = null) {
    return await prisma.configuracao.upsert({
      where: { chave },
      update: { valor, descricao, updatedAt: new Date() },
      create: { chave, valor, descricao },
    });
  }

  /**
   * Atualiza uma configuração
   * @param {string} chave - Chave da configuração
   * @param {string} valor - Novo valor
   * @param {string} descricao - Nova descrição
   * @returns {Promise<Object>} Configuração atualizada
   */
  async update(chave, valor, descricao = null) {
    return await prisma.configuracao.update({
      where: { chave },
      data: { valor, descricao, updatedAt: new Date() },
    });
  }
}

module.exports = new ConfiguracaoRepository();


