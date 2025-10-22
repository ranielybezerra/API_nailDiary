const servicoService = require('../services/servico.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class ServicoController {
  /**
   * Lista todos os serviços
   */
  async listar(req, res) {
    try {
      const { apenasAtivos = 'true' } = req.query;
      const apenasAtivosBool = apenasAtivos === 'true';
      
      const servicos = await servicoService.listarServicos(apenasAtivosBool);
      
      return successResponse(res, servicos, 'Serviços listados com sucesso');
    } catch (error) {
      return errorResponse(res, error.message, 'LIST_ERROR', 500);
    }
  }

  /**
   * Obtém um serviço por ID
   */
  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      
      const servico = await servicoService.obterServico(id);
      
      return successResponse(res, servico, 'Serviço encontrado');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'NOT_FOUND', statusCode);
    }
  }

  /**
   * Cria um novo serviço (admin)
   */
  async criar(req, res) {
    try {
      const servicoData = req.body;
      
      const servico = await servicoService.criarServico(servicoData);
      
      return successResponse(res, servico, 'Serviço criado com sucesso', 201);
    } catch (error) {
      const statusCode = error.message.includes('já existe') ? 409 : 400;
      return errorResponse(res, error.message, 'CREATE_ERROR', statusCode);
    }
  }

  /**
   * Atualiza um serviço (admin)
   */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const servico = await servicoService.atualizarServico(id, updateData);
      
      return successResponse(res, servico, 'Serviço atualizado com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 
                        error.message.includes('já existe') ? 409 : 400;
      return errorResponse(res, error.message, 'UPDATE_ERROR', statusCode);
    }
  }

  /**
   * Inativa um serviço (admin)
   */
  async inativar(req, res) {
    try {
      const { id } = req.params;
      
      const servico = await servicoService.inativarServico(id);
      
      return successResponse(res, servico, 'Serviço inativado com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'UPDATE_ERROR', statusCode);
    }
  }

  /**
   * Ativa um serviço (admin)
   */
  async ativar(req, res) {
    try {
      const { id } = req.params;
      
      const servico = await servicoService.ativarServico(id);
      
      return successResponse(res, servico, 'Serviço ativado com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'UPDATE_ERROR', statusCode);
    }
  }

  /**
   * Exclui um serviço permanentemente (admin)
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;
      
      await servicoService.excluirServico(id);
      
      return successResponse(res, null, 'Serviço excluído com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'DELETE_ERROR', statusCode);
    }
  }
}

module.exports = new ServicoController();



