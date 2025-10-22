const agendamentoService = require('../services/agendamento.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class AgendamentoController {
  /**
   * Lista todos os agendamentos (admin)
   */
  async listar(req, res) {
    try {
      const { status, dataInicio, dataFim } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (dataInicio) filters.dataInicio = new Date(dataInicio);
      if (dataFim) filters.dataFim = new Date(dataFim);
      
      const agendamentos = await agendamentoService.listarAgendamentos(filters);
      
      return successResponse(res, agendamentos, 'Agendamentos listados com sucesso');
    } catch (error) {
      return errorResponse(res, error.message, 'LIST_ERROR', 500);
    }
  }

  /**
   * Obtém um agendamento por ID
   */
  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      
      const agendamento = await agendamentoService.obterAgendamento(id);
      
      return successResponse(res, agendamento, 'Agendamento encontrado');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'NOT_FOUND', statusCode);
    }
  }

  /**
   * Cria um novo agendamento (público)
   */
  async criar(req, res) {
    try {
      const agendamentoData = req.body;
      
      const agendamento = await agendamentoService.criarAgendamento(agendamentoData);
      
      return successResponse(res, agendamento, 'Agendamento criado com sucesso', 201);
    } catch (error) {
      const statusCode = error.message.includes('não disponível') ? 409 :
                        error.message.includes('obrigatório') ? 400 :
                        error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'CREATE_ERROR', statusCode);
    }
  }

  /**
   * Atualiza um agendamento (admin)
   */
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const agendamento = await agendamentoService.atualizarAgendamento(id, updateData);
      
      return successResponse(res, agendamento, 'Agendamento atualizado com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 :
                        error.message.includes('não disponível') ? 409 : 400;
      return errorResponse(res, error.message, 'UPDATE_ERROR', statusCode);
    }
  }

  /**
   * Confirma um agendamento (admin)
   */
  async confirmar(req, res) {
    try {
      const { id } = req.params;
      
      const agendamento = await agendamentoService.confirmarAgendamento(id);
      
      return successResponse(res, agendamento, 'Agendamento confirmado com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 :
                        error.message.includes('Apenas agendamentos pendentes') ? 400 : 500;
      return errorResponse(res, error.message, 'UPDATE_ERROR', statusCode);
    }
  }

  /**
   * Cancela um agendamento (admin)
   */
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      
      const agendamento = await agendamentoService.cancelarAgendamento(id);
      
      return successResponse(res, agendamento, 'Agendamento cancelado com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 :
                        error.message.includes('já está cancelado') ? 400 :
                        error.message.includes('não é possível cancelar') ? 400 : 500;
      return errorResponse(res, error.message, 'UPDATE_ERROR', statusCode);
    }
  }

  /**
   * Verifica disponibilidade de horário (público)
   */
  async verificarDisponibilidade(req, res) {
    try {
      const { dataHora, servicoId } = req.query;
      
      if (!dataHora || !servicoId) {
        return errorResponse(res, 'Data/hora e ID do serviço são obrigatórios', 'VALIDATION_ERROR', 400);
      }

      // Buscar serviço para obter duração
      const servicoService = require('../services/servico.service');
      const servico = await servicoService.obterServico(servicoId);
      
      await agendamentoService.verificarDisponibilidade(
        new Date(dataHora),
        servico.duracao
      );
      
      return successResponse(res, { disponivel: true }, 'Horário disponível');
    } catch (error) {
      const statusCode = error.message.includes('não disponível') ? 409 :
                        error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'AVAILABILITY_ERROR', statusCode);
    }
  }
}

module.exports = new AgendamentoController();



