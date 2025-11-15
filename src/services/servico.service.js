const servicoRepository = require('../repositories/servico.repository');

class ServicoService {
  /**
   * Lista todos os serviços
   * @param {boolean} apenasAtivos - Se deve filtrar apenas serviços ativos
   * @returns {Promise<Array>} Lista de serviços
   */
  async listarServicos(apenasAtivos = true) {
    return await servicoRepository.findAll(apenasAtivos);
  }

  /**
   * Obtém um serviço por ID
   * @param {string} id - ID do serviço
   * @returns {Promise<Object>} Serviço encontrado
   */
  async obterServico(id) {
    const servico = await servicoRepository.findById(id);
    
    if (!servico) {
      throw new Error('Serviço não encontrado');
    }

    return servico;
  }

  /**
   * Cria um novo serviço
   * @param {Object} servicoData - Dados do serviço
   * @returns {Promise<Object>} Serviço criado
   */
  async criarServico(servicoData) {
    // Validar dados obrigatórios
    this.validarDadosServico(servicoData);

    // Verificar se já existe serviço com o mesmo nome
    const servicosExistentes = await servicoRepository.findAll(false);
    const servicoExistente = servicosExistentes.find(
      s => s.nome.toLowerCase() === servicoData.nome.toLowerCase()
    );

    if (servicoExistente) {
      throw new Error('Já existe um serviço com este nome');
    }

    return await servicoRepository.create(servicoData);
  }

  /**
   * Atualiza um serviço
   * @param {string} id - ID do serviço
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Serviço atualizado
   */
  async atualizarServico(id, updateData) {
    // Verificar se o serviço existe
    await this.obterServico(id);

    // Validar dados se fornecidos
    if (updateData.nome || updateData.duracao || updateData.preco) {
      this.validarDadosServico(updateData);
    }

    // Verificar nome duplicado se estiver sendo alterado
    if (updateData.nome) {
      const servicosExistentes = await servicoRepository.findAll(false);
      const servicoExistente = servicosExistentes.find(
        s => s.id !== id && s.nome.toLowerCase() === updateData.nome.toLowerCase()
      );

      if (servicoExistente) {
        throw new Error('Já existe um serviço com este nome');
      }
    }

    return await servicoRepository.update(id, updateData);
  }

  /**
   * Inativa um serviço
   * @param {string} id - ID do serviço
   * @returns {Promise<Object>} Serviço inativado
   */
  async inativarServico(id) {
    await this.obterServico(id);
    return await servicoRepository.inativar(id);
  }

  /**
   * Ativa um serviço
   * @param {string} id - ID do serviço
   * @returns {Promise<Object>} Serviço ativado
   */
  async ativarServico(id) {
    await this.obterServico(id);
    return await servicoRepository.ativar(id);
  }

  /**
   * Remove um serviço permanentemente
   * @param {string} id - ID do serviço
   * @returns {Promise<Object>} Serviço removido
   */
  async excluirServico(id) {
    await this.obterServico(id);
    
    // Verificar se há agendamentos associados
    const quantidadeAgendamentos = await servicoRepository.contarAgendamentos(id);
    
    if (quantidadeAgendamentos > 0) {
      throw new Error(
        `Não é possível excluir este serviço pois ele possui ${quantidadeAgendamentos} agendamento(s) associado(s). ` +
        `Use a opção de inativar serviço em vez de excluir.`
      );
    }
    
    return await servicoRepository.delete(id);
  }

  /**
   * Valida dados do serviço
   * @param {Object} servicoData - Dados do serviço
   */
  validarDadosServico(servicoData) {
    if (!servicoData.nome || servicoData.nome.trim().length < 2) {
      throw new Error('Nome do serviço deve ter pelo menos 2 caracteres');
    }

    if (servicoData.duracao && (servicoData.duracao < 15 || servicoData.duracao > 480)) {
      throw new Error('Duração deve estar entre 15 e 480 minutos');
    }

    if (servicoData.preco && (servicoData.preco < 0 || servicoData.preco > 10000)) {
      throw new Error('Preço deve estar entre R$ 0,00 e R$ 10.000,00');
    }
  }
}

module.exports = new ServicoService();







