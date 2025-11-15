const agendamentoRepository = require('../repositories/agendamento.repository');
const servicoRepository = require('../repositories/servico.repository');
const configuracaoService = require('./configuracao.service');

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

    // Gerar token e PIN únicos para verificação
    const { gerarToken, gerarPIN } = require('../utils/verificacao.util');
    const tokenVerificacao = gerarToken();
    const pinVerificacao = gerarPIN();

    // Adicionar token e PIN aos dados do agendamento
    const dadosComVerificacao = {
      ...agendamentoData,
      tokenVerificacao,
      pinVerificacao,
    };

    return await agendamentoRepository.create(dadosComVerificacao);
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
   * Atualiza o status de um agendamento
   * @param {string} id - ID do agendamento
   * @param {string} status - Novo status (PENDENTE, CONFIRMADO, CANCELADO, CONCLUIDO)
   * @returns {Promise<Object>} Agendamento atualizado
   */
  async atualizarStatusAgendamento(id, status) {
    // Verificar se o agendamento existe
    await this.obterAgendamento(id);

    // Validar status
    const statusValidos = ['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO'];
    if (!statusValidos.includes(status)) {
      throw new Error(`Status inválido. Deve ser um dos: ${statusValidos.join(', ')}`);
    }

    // Se o status for CONCLUIDO, arquivar automaticamente
    if (status === 'CONCLUIDO') {
      return await agendamentoRepository.updateStatusEArquivar(id, status);
    }

    return await agendamentoRepository.updateStatus(id, status);
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

    // Obter configurações de disponibilidade
    const config = await configuracaoService.obterConfiguracaoDisponibilidade();
    
    // Verificar se o dia da semana está disponível
    const diaSemana = data.getDay();
    if (!config.diasDisponiveis.includes(diaSemana)) {
      const nomesDias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const diasDisponiveisNomes = config.diasDisponiveis.map(d => nomesDias[d]).join(', ');
      throw new Error(`Não é possível agendar neste dia. Dias disponíveis: ${diasDisponiveisNomes}`);
    }

    // Verificar horário de funcionamento
    const hora = data.getHours();
    if (hora < config.horarioInicio || hora >= config.horarioFim) {
      throw new Error(`Horário de funcionamento: ${config.horarioInicio}h às ${config.horarioFim}h`);
    }

    // Verificar conflitos com outros agendamentos
    // Como é um único trabalhador, qualquer agendamento conflita com outro
    // independente do serviço - o que importa é o horário
    const conflitos = await agendamentoRepository.verificarConflitos(
      data,
      duracao,
      excludeId
    );

    if (conflitos.length > 0) {
      throw new Error('Horário não disponível. Já existe um agendamento neste horário');
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
   * Busca horários ocupados em uma data
   * @param {Date|string} data - Data para verificar
   * @returns {Promise<Array>} Array de horários ocupados
   */
  async buscarHorariosOcupados(data) {
    return await agendamentoRepository.buscarHorariosOcupados(data);
  }

  /**
   * Busca agendamento por token de verificação
   * @param {string} token - Token de verificação
   * @returns {Promise<Object>} Agendamento encontrado
   */
  async verificarPorToken(token) {
    const agendamento = await agendamentoRepository.findByToken(token);
    
    if (!agendamento) {
      throw new Error('Agendamento não encontrado com este token');
    }
    
    return agendamento;
  }

  /**
   * Busca agendamento por PIN de verificação
   * @param {string} pin - PIN de verificação
   * @returns {Promise<Object>} Agendamento encontrado
   */
  async verificarPorPIN(pin) {
    const agendamento = await agendamentoRepository.findByPIN(pin);
    
    if (!agendamento) {
      throw new Error('Agendamento não encontrado com este PIN');
    }
    
    return agendamento;
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

  /**
   * Obtém estatísticas de agendamentos
   * @param {Object} filters - Filtros de data (dataInicio, dataFim)
   * @returns {Promise<Object>} Estatísticas agregadas
   */
  async obterEstatisticas(filters = {}) {
    return await agendamentoRepository.obterEstatisticas(filters);
  }

  /**
   * Lista agendamentos arquivados
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} Lista de agendamentos arquivados
   */
  async listarArquivados(filters = {}) {
    return await agendamentoRepository.findArquivados(filters);
  }

  /**
   * Desarquiva um agendamento
   * @param {string} id - ID do agendamento
   * @returns {Promise<Object>} Agendamento desarquivado
   */
  async desarquivar(id) {
    const agendamento = await this.obterAgendamento(id);
    
    if (!agendamento.arquivado) {
      throw new Error('Agendamento não está arquivado');
    }

    return await agendamentoRepository.desarquivar(id);
  }

  /**
   * Exclui um agendamento permanentemente
   * @param {string} id - ID do agendamento
   * @returns {Promise<void>}
   */
  async excluirAgendamento(id) {
    const agendamento = await this.obterAgendamento(id);
    
    // Apenas agendamentos cancelados podem ser excluídos
    if (agendamento.status !== 'CANCELADO') {
      throw new Error('Apenas agendamentos cancelados podem ser excluídos');
    }

    return await agendamentoRepository.delete(id);
  }
}

module.exports = new AgendamentoService();
