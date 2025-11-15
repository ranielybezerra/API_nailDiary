const dicaService = require('../services/dica.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class DicaController {
  /**
   * Lista todas as dicas
   */
  async listar(req, res) {
    try {
      const { titulo } = req.query;
      
      const filters = {};
      if (titulo) filters.titulo = titulo;
      
      const dicas = await dicaService.listarDicas(filters);
      
      return successResponse(res, dicas, 'Dicas listadas com sucesso');
    } catch (error) {
      return errorResponse(res, error.message, 'LIST_ERROR', 500);
    }
  }

  /**
   * Obtém uma dica por ID
   */
  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      
      const dica = await dicaService.obterDica(id);
      
      return successResponse(res, dica, 'Dica encontrada');
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 500;
      return errorResponse(res, error.message, 'NOT_FOUND', statusCode);
    }
  }

  /**
   * Cria uma nova dica (admin)
   */
  async criar(req, res) {
    try {
      const dicaData = req.body;
      
      const dica = await dicaService.criarDica(dicaData);
      
      return successResponse(res, dica, 'Dica criada com sucesso', 201);
    } catch (error) {
      return errorResponse(res, error.message, 'CREATE_ERROR', 400);
    }
  }

  /**
   * Atualiza uma dica (admin)
   */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const dica = await dicaService.atualizarDica(id, updateData);
      
      return successResponse(res, dica, 'Dica atualizada com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 400;
      return errorResponse(res, error.message, 'UPDATE_ERROR', statusCode);
    }
  }

  /**
   * Exclui uma dica (admin)
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;
      
      await dicaService.excluirDica(id);
      
      return successResponse(res, null, 'Dica excluída com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 500;
      return errorResponse(res, error.message, 'DELETE_ERROR', statusCode);
    }
  }

  /**
   * Busca dicas por título
   */
  async buscar(req, res) {
    try {
      const { titulo } = req.query;
      
      if (!titulo) {
        return errorResponse(res, 'Título de busca é obrigatório', 'VALIDATION_ERROR', 400);
      }
      
      const dicas = await dicaService.buscarDicas(titulo);
      
      return successResponse(res, dicas, 'Busca realizada com sucesso');
    } catch (error) {
      return errorResponse(res, error.message, 'SEARCH_ERROR', 400);
    }
  }
}

module.exports = new DicaController();







