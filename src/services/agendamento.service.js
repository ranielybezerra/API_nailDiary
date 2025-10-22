const agendamentoRepository = require('../repositories/agendamento.repository');
const servicoRepository = require('../repositories/servico.repository');

class AgendamentoService {
  /**
   * Lista todos os agendamentos
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} Lista de agendamentos
   */
  async listarAgendamentos(filters = {}) {
    return await agendamentoRepository.findAll(filters);
  }

  /**
   * Obtém um agendamento por ID
   * @param {string} id - ID do agendamento
   * @returns {Promise<Object>} Agendamento encontrado
   */
  async obterAgendamento(id) {
    const agendamento = await agendamentoRepository.findById(id);
    
    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    return agendamento;
  }

  /**
   * Cria um novo agendamento
   * @param {Object} agendamentoData - Dados do agendamento
   * @returns {Promise<Object>} Agendamento criado
   */
  async criarAgendamento(agendamentoData) {
    // Validar dados obrigatórios
    this.validarDadosAgendamento(agendamentoData);

    // Verificar se o serviço existe e está ativo
    const servico = await servicoRepository.findById(agendamentoData.servicoId);
    
    if (!servico) {
      throw new Error('Serviço não encontrado');
    }

    if (!servico.ativo) {
      throw new Error('Serviço não está disponível');
    }

    // Verificar disponibilidade do horário
    await this.verificarDisponibilidade(
      agendamentoData.dataHora,
      servico.duracao
    );

    return await agendamentoRepository.create(agendamentoData);
  }

  /**
   * Atualiza um agendamento
   * @param {string} id - ID do agendamento
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Agendamento atualizado
   */
  async atualizarAgendamento(id, updateData) {
    // Verificar se o agendamento existe
    const agendamentoExistente = await this.obterAgendamento(id);

    // Validar dados se fornecidos
    if (updateData.dataHora || updateData.servicoId) {
      this.validarDadosAgendamento(updateData);
    }

    // Verificar disponibilidade se estiver alterando data/hora
    if (updateData.dataHora || updateData.servicoId) {
      const servicoId = updateData.servicoId || agendamentoExistente.servicoId;
      const dataHora = updateData.dataHora || agendamentoExistente.dataHora;
      
      const servico = await servicoRepository.findById(servicoId);
      if (!servico || !servico.ativo) {
        throw new Error('Serviço não está disponível');
      }

      await this.verificarDisponibilidade(dataHora, servico.duracao, id);
    }

    return await agendamentoRepository.update(id, updateData);
  }

  /**
   * Confirma um agendamento
   * @param {string} id - ID do agendamento
   * @returns {Promise<Object>} Agendamento confirmado
   */
  async confirmarAgendamento(id) {
    const agendamento = await this.obterAgendamento(id);
    
    if (agendamento.status !== 'PENDENTE') {
      throw new Error('Apenas agendamentos pendentes podem ser confirmados');
    }

    return await agendamentoRepository.updateStatus(id, 'CONFIRMADO');
  }

  /**
   * Cancela um agendamento
   * @param {string} id - ID do agendamento
   * @returns {Promise<Object>} Agendamento cancelado
   */
  async cancelarAgendamento(id) {
    const agendamento = await this.obterAgendamento(id);
    
    if (agendamento.status === 'CANCELADO') {
      throw new Error('Agendamento já está cancelado');
    }

    if (agendamento.status === 'CONCLUIDO') {
      throw new Error('Não é possível cancelar um agendamento concluído');
    }

    return await agendamentoRepository.updateStatus(id, 'CANCELADO');
  }

  /**
   * Verifica disponibilidade de horário
   * @param {Date|string} dataHora - Data e hora do agendamento
   * @param {number} duracao - Duração em minutos
   * @param {string} excludeId - ID do agendamento a excluir (para edição)
   * @returns {Promise<void>}
   */
  async verificarDisponibilidade(dataHora, duracao, excludeId = null) {
    // Converter para Date se for string
    const data = new Date(dataHora);
    
    // Verificar se a data é válida
    if (isNaN(data.getTime())) {
      throw new Error('Data e hora inválidas');
    }

    // Verificar se a data não é no passado
    const agora = new Date();
    if (data <= agora) {
      throw new Error('Não é possível agendar para uma data no passado');
    }

    // Verificar se não é domingo (0) ou segunda (1)
    const diaSemana = data.getDay();
    if (diaSemana === 0 || diaSemana === 1) {
      throw new Error('Não é possível agendar aos domingos e segundas-feiras');
    }

    // Verificar horário de funcionamento (8h às 18h)
    const hora = data.getHours();
    if (hora < 8 || hora >= 18) {
      throw new Error('Horário de funcionamento: 8h às 18h');
    }

    // Verificar conflitos com outros agendamentos
    const conflitos = await agendamentoRepository.verificarConflitos(
      data,
      duracao,
      excludeId
    );

    if (conflitos.length > 0) {
      throw new Error('Horário não disponível. Já existe um agendamento neste período');
    }
  }

  /**
   * Valida dados do agendamento
   * @param {Object} agendamentoData - Dados do agendamento
   */
  validarDadosAgendamento(agendamentoData) {
    if (!agendamentoData.clienteNome || agendamentoData.clienteNome.trim().length < 2) {
      throw new Error('Nome do cliente é obrigatório e deve ter pelo menos 2 caracteres');
    }

    if (!agendamentoData.clienteEmail || !this.validarEmail(agendamentoData.clienteEmail)) {
      throw new Error('Email válido é obrigatório');
    }

    if (!agendamentoData.clienteTelefone || agendamentoData.clienteTelefone.trim().length < 10) {
      throw new Error('Telefone válido é obrigatório');
    }

    if (!agendamentoData.dataHora) {
      throw new Error('Data e hora são obrigatórias');
    }

    if (!agendamentoData.servicoId) {
      throw new Error('Serviço é obrigatório');
    }
  }

  /**
   * Valida formato de email
   * @param {string} email - Email para validar
   * @returns {boolean} True se o email é válido
   */
  validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = new AgendamentoService();
