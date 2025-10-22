const prisma = require('../config/database');

class AgendamentoRepository {
  /**
   * Lista todos os agendamentos
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} Lista de agendamentos
   */
  async findAll(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.dataInicio && filters.dataFim) {
      where.dataHora = {
        gte: filters.dataInicio,
        lte: filters.dataFim,
      };
    }

    return await prisma.agendamento.findMany({
      where,
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
      orderBy: {
        dataHora: 'asc',
      },
    });
  }

  /**
   * Busca agendamento por ID
   * @param {string} id - ID do agendamento
   * @returns {Promise<Object|null>} Agendamento encontrado ou null
   */
  async findById(id) {
    return await prisma.agendamento.findUnique({
      where: { id },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Cria um novo agendamento
   * @param {Object} agendamentoData - Dados do agendamento
   * @returns {Promise<Object>} Agendamento criado
   */
  async create(agendamentoData) {
    return await prisma.agendamento.create({
      data: agendamentoData,
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Atualiza um agendamento
   * @param {string} id - ID do agendamento
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Agendamento atualizado
   */
  async update(id, updateData) {
    return await prisma.agendamento.update({
      where: { id },
      data: updateData,
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Atualiza status do agendamento
   * @param {string} id - ID do agendamento
   * @param {string} status - Novo status
   * @returns {Promise<Object>} Agendamento atualizado
   */
  async updateStatus(id, status) {
    return await prisma.agendamento.update({
      where: { id },
      data: { status },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Verifica conflitos de horário
   * @param {Date} dataHora - Data e hora do agendamento
   * @param {number} duracao - Duração em minutos
   * @param {string} excludeId - ID do agendamento a excluir (para edição)
   * @returns {Promise<Array>} Agendamentos conflitantes
   */
  async verificarConflitos(dataHora, duracao, excludeId = null) {
    const inicio = new Date(dataHora);
    const fim = new Date(dataHora.getTime() + duracao * 60000);

    const where = {
      status: {
        in: ['PENDENTE', 'CONFIRMADO'],
      },
      OR: [
        {
          AND: [
            { dataHora: { gte: inicio } },
            { dataHora: { lt: fim } },
          ],
        },
        {
          AND: [
            { dataHora: { lte: inicio } },
            {
              dataHora: {
                gte: new Date(inicio.getTime() - 120 * 60000), // 2 horas antes
              },
            },
          ],
        },
      ],
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    return await prisma.agendamento.findMany({
      where,
      include: {
        servico: {
          select: {
            nome: true,
            duracao: true,
          },
        },
      },
    });
  }

  /**
   * Remove um agendamento
   * @param {string} id - ID do agendamento
   * @returns {Promise<Object>} Agendamento removido
   */
  async delete(id) {
    return await prisma.agendamento.delete({
      where: { id },
    });
  }
}

module.exports = new AgendamentoRepository();

