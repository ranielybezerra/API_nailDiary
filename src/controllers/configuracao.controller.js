const configuracaoService = require('../services/configuracao.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class ConfiguracaoController {
  /**
   * Obtém configuração de disponibilidade
   */
  async obterDisponibilidade(req, res) {
    try {
      const config = await configuracaoService.obterConfiguracaoDisponibilidade();
      return successResponse(res, config, 'Configuração de disponibilidade obtida com sucesso');
    } catch (error) {
      return errorResponse(res, error.message, 'GET_ERROR', 500);
    }
  }

  /**
   * Salva configuração de disponibilidade
   */
  async salvarDisponibilidade(req, res) {
    try {
      const dados = req.body;
      const config = await configuracaoService.salvarConfiguracaoDisponibilidade(dados);
      return successResponse(res, config, 'Configuração de disponibilidade salva com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('inválido') || error.message.includes('deve') ? 400 : 500;
      return errorResponse(res, error.message, 'SAVE_ERROR', statusCode);
    }
  }

  /**
   * Lista todas as configurações
   */
  async listar(req, res) {
    try {
      const configuracoes = await configuracaoService.listarConfiguracoes();
      return successResponse(res, configuracoes, 'Configurações listadas com sucesso');
    } catch (error) {
      return errorResponse(res, error.message, 'LIST_ERROR', 500);
    }
  }
}

module.exports = new ConfiguracaoController();


