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
   * Atualiza o status de um agendamento (admin)
   */
  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return errorResponse(res, 'Status é obrigatório', 'VALIDATION_ERROR', 400);
      }

      // Validar status válido
      const statusValidos = ['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO'];
      if (!statusValidos.includes(status)) {
        return errorResponse(res, `Status inválido. Deve ser um dos: ${statusValidos.join(', ')}`, 'VALIDATION_ERROR', 400);
      }
      
      const agendamento = await agendamentoService.atualizarStatusAgendamento(id, status);
      
      return successResponse(res, agendamento, 'Status do agendamento atualizado com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'UPDATE_ERROR', statusCode);
    }
  }

  /**
   * Verifica disponibilidade de horário (público)
   * Como é um único trabalhador, verifica se o horário está livre
   * independente do serviço
   * Aceita servicoId OU duracao diretamente (duração é opcional para casos especiais)
   */
  async verificarDisponibilidade(req, res) {
    try {
      const { dataHora, servicoId, duracao } = req.query;
      
      if (!dataHora) {
        return errorResponse(res, 'Data/hora é obrigatória', 'VALIDATION_ERROR', 400);
      }

      let duracaoFinal;

      // Se duração foi fornecida diretamente, usar ela (casos especiais)
      if (duracao) {
        duracaoFinal = parseInt(duracao, 10);
        if (isNaN(duracaoFinal) || duracaoFinal <= 0) {
          return errorResponse(res, 'Duração deve ser um número positivo', 'VALIDATION_ERROR', 400);
        }
      } else if (servicoId) {
        // Buscar serviço para obter duração (caso normal - um serviço por agendamento)
        const servicoService = require('../services/servico.service');
        const servico = await servicoService.obterServico(servicoId);
        duracaoFinal = servico.duracao;
      } else {
        return errorResponse(res, 'ID do serviço ou duração são obrigatórios', 'VALIDATION_ERROR', 400);
      }
      
      // Verificar disponibilidade - não importa qual serviço, apenas o horário
      await agendamentoService.verificarDisponibilidade(
        new Date(dataHora),
        duracaoFinal
      );
      
      return successResponse(res, { disponivel: true }, 'Horário disponível');
    } catch (error) {
      const statusCode = error.message.includes('não disponível') ? 409 :
                        error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'AVAILABILITY_ERROR', statusCode);
    }
  }

  /**
   * Busca horários ocupados em uma data (público)
   */
  async buscarHorariosOcupados(req, res) {
    try {
      const { data } = req.query;
      
      if (!data) {
        return errorResponse(res, 'Data é obrigatória', 'VALIDATION_ERROR', 400);
      }

      const horariosOcupados = await agendamentoService.buscarHorariosOcupados(data);
      
      return successResponse(res, { horariosOcupados }, 'Horários ocupados obtidos com sucesso');
    } catch (error) {
      return errorResponse(res, error.message, 'LIST_ERROR', 500);
    }
  }

  /**
   * Verifica agendamento por token (público)
   */
  async verificarPorToken(req, res) {
    try {
      const { token } = req.params;
      
      if (!token) {
        return errorResponse(res, 'Token é obrigatório', 'VALIDATION_ERROR', 400);
      }

      const agendamento = await agendamentoService.verificarPorToken(token);
      
      return successResponse(res, agendamento, 'Agendamento encontrado com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'VERIFY_ERROR', statusCode);
    }
  }

  /**
   * Verifica agendamento por PIN (público)
   */
  async verificarPorPIN(req, res) {
    try {
      const { pin } = req.body;
      
      if (!pin) {
        return errorResponse(res, 'PIN é obrigatório', 'VALIDATION_ERROR', 400);
      }

      // Validar formato do PIN (4 dígitos)
      if (!/^\d{4}$/.test(pin)) {
        return errorResponse(res, 'PIN deve conter exatamente 4 dígitos numéricos', 'VALIDATION_ERROR', 400);
      }

      const agendamento = await agendamentoService.verificarPorPIN(pin);
      
      return successResponse(res, agendamento, 'Agendamento encontrado com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, error.message, 'VERIFY_ERROR', statusCode);
    }
  }

  /**
   * Obtém estatísticas de agendamentos (admin)
   */
  async obterEstatisticas(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
      const filters = {};
      if (dataInicio) filters.dataInicio = new Date(dataInicio);
      if (dataFim) filters.dataFim = new Date(dataFim);
      
      const estatisticas = await agendamentoService.obterEstatisticas(filters);
      
      return successResponse(res, estatisticas, 'Estatísticas obtidas com sucesso');
    } catch (error) {
      return errorResponse(res, error.message, 'STATS_ERROR', 500);
    }
  }

  /**
   * Lista agendamentos arquivados (admin)
   */
  async listarArquivados(req, res) {
    try {
      const { status, dataInicio, dataFim } = req.query;
      
      // Validação básica dos parâmetros
      const filters = {};
      
      if (status) {
        const statusValidos = ['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO'];
        if (!statusValidos.includes(status)) {
          return errorResponse(res, `Status inválido. Deve ser um dos: ${statusValidos.join(', ')}`, 'VALIDATION_ERROR', 400);
        }
        filters.status = status;
      }
      
      if (dataInicio) {
        const data = new Date(dataInicio);
        if (isNaN(data.getTime())) {
          return errorResponse(res, 'Data de início inválida', 'VALIDATION_ERROR', 400);
        }
        filters.dataInicio = data;
      }
      
      if (dataFim) {
        const data = new Date(dataFim);
        if (isNaN(data.getTime())) {
          return errorResponse(res, 'Data de fim inválida', 'VALIDATION_ERROR', 400);
        }
        filters.dataFim = data;
      }
      
      const agendamentos = await agendamentoService.listarArquivados(filters);
      
      return successResponse(res, agendamentos, 'Agendamentos arquivados listados com sucesso');
    } catch (error) {
      return errorResponse(res, error.message, 'LIST_ERROR', 500);
    }
  }

  /**
   * Desarquiva um agendamento (admin)
   */
  async desarquivar(req, res) {
    try {
      const { id } = req.params;
      
      const agendamento = await agendamentoService.desarquivar(id);
      
      return successResponse(res, agendamento, 'Agendamento desarquivado com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 :
                        error.message.includes('não está arquivado') ? 400 : 500;
      return errorResponse(res, error.message, 'UPDATE_ERROR', statusCode);
    }
  }

  /**
   * Exclui um agendamento permanentemente (admin)
   * Apenas agendamentos cancelados podem ser excluídos
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;
      
      await agendamentoService.excluirAgendamento(id);
      
      return successResponse(res, null, 'Agendamento excluído com sucesso');
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 :
                        error.message.includes('Apenas agendamentos cancelados') ? 400 : 500;
      return errorResponse(res, error.message, 'DELETE_ERROR', statusCode);
    }
  }
}

module.exports = new AgendamentoController();







