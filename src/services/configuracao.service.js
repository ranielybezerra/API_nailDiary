const configuracaoRepository = require('../repositories/configuracao.repository');

class ConfiguracaoService {
  /**
   * Obtém configuração de disponibilidade
   * @returns {Promise<Object>} Configurações de disponibilidade
   */
  async obterConfiguracaoDisponibilidade() {
    const config = await configuracaoRepository.findByChave('disponibilidade');
    
    if (!config) {
      // Retornar valores padrão
      return {
        diasDisponiveis: [2, 3, 4, 5, 6], // Terça a Sábado
        horarioInicio: 8,
        horarioFim: 18,
      };
    }

    return JSON.parse(config.valor);
  }

  /**
   * Salva configuração de disponibilidade
   * @param {Object} dados - Dados de disponibilidade
   * @returns {Promise<Object>} Configuração salva
   */
  async salvarConfiguracaoDisponibilidade(dados) {
    // Validar dados
    this.validarConfiguracaoDisponibilidade(dados);

    const valor = JSON.stringify(dados);
    const descricao = 'Configuração de dias e horários disponíveis para agendamentos';

    return await configuracaoRepository.upsert('disponibilidade', valor, descricao);
  }

  /**
   * Lista todas as configurações
   * @returns {Promise<Array>} Lista de configurações
   */
  async listarConfiguracoes() {
    return await configuracaoRepository.findAll();
  }

  /**
   * Obtém uma configuração por chave
   * @param {string} chave - Chave da configuração
   * @returns {Promise<Object>} Configuração
   */
  async obterConfiguracao(chave) {
    const config = await configuracaoRepository.findByChave(chave);
    
    if (!config) {
      throw new Error('Configuração não encontrada');
    }

    // Tentar fazer parse do JSON, se falhar retorna como string
    try {
      return {
        ...config,
        valorParsed: JSON.parse(config.valor),
      };
    } catch {
      return config;
    }
  }

  /**
   * Valida configuração de disponibilidade
   * @param {Object} dados - Dados para validar
   */
  validarConfiguracaoDisponibilidade(dados) {
    if (!dados.diasDisponiveis || !Array.isArray(dados.diasDisponiveis)) {
      throw new Error('diasDisponiveis deve ser um array');
    }

    // Validar dias (0 = domingo, 6 = sábado)
    const diasValidos = [0, 1, 2, 3, 4, 5, 6];
    for (const dia of dados.diasDisponiveis) {
      if (!diasValidos.includes(dia)) {
        throw new Error(`Dia inválido: ${dia}. Deve ser um número de 0 (domingo) a 6 (sábado)`);
      }
    }

    if (dados.diasDisponiveis.length === 0) {
      throw new Error('Deve haver pelo menos um dia disponível');
    }

    if (typeof dados.horarioInicio !== 'number' || dados.horarioInicio < 0 || dados.horarioInicio > 23) {
      throw new Error('horarioInicio deve ser um número entre 0 e 23');
    }

    if (typeof dados.horarioFim !== 'number' || dados.horarioFim < 0 || dados.horarioFim > 23) {
      throw new Error('horarioFim deve ser um número entre 0 e 23');
    }

    if (dados.horarioInicio >= dados.horarioFim) {
      throw new Error('horarioInicio deve ser menor que horarioFim');
    }
  }
}

module.exports = new ConfiguracaoService();


