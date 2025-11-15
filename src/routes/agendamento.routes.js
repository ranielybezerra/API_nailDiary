const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamento.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');
const { 
  validarCriarAgendamento, 
  validarUUID, 
  validarBusca 
} = require('../middlewares/validation.middleware');

// GET /api/agendamentos/verificar-disponibilidade - Verificar disponibilidade (público)
// IMPORTANTE: Esta rota deve vir antes de /:id para não ser interpretada como ID
router.get('/verificar-disponibilidade', agendamentoController.verificarDisponibilidade);

// GET /api/agendamentos/horarios-ocupados - Buscar horários ocupados em uma data (público)
router.get('/horarios-ocupados', agendamentoController.buscarHorariosOcupados);

// GET /api/agendamentos/verificar/:token - Verificar agendamento por token (público)
router.get('/verificar/:token', agendamentoController.verificarPorToken);

// POST /api/agendamentos/verificar-pin - Verificar agendamento por PIN (público)
router.post('/verificar-pin', agendamentoController.verificarPorPIN);

// GET /api/agendamentos/estatisticas - Obter estatísticas (admin)
router.get('/estatisticas', verificarToken, verificarAdmin, agendamentoController.obterEstatisticas);

// GET /api/agendamentos/arquivados - Listar agendamentos arquivados (admin)
// IMPORTANTE: Esta rota deve vir antes de /:id para não ser interpretada como ID
router.get('/arquivados', verificarToken, verificarAdmin, agendamentoController.listarArquivados);

// GET /api/agendamentos - Listar agendamentos (admin)
router.get('/', verificarToken, verificarAdmin, validarBusca, agendamentoController.listar);

// POST /api/agendamentos - Criar agendamento (público)
router.post('/', validarCriarAgendamento, agendamentoController.criar);

// GET /api/agendamentos/:id - Obter agendamento por ID (admin)
router.get('/:id', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.obterPorId);

// PUT /api/agendamentos/:id - Atualizar agendamento (admin)
router.put('/:id', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.atualizar);

// PATCH /api/agendamentos/:id/status - Atualizar status do agendamento (admin)
router.patch('/:id/status', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.atualizarStatus);

// PATCH /api/agendamentos/:id/confirmar - Confirmar agendamento (admin)
router.patch('/:id/confirmar', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.confirmar);

// PATCH /api/agendamentos/:id/cancelar - Cancelar agendamento (admin)
router.patch('/:id/cancelar', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.cancelar);

// PATCH /api/agendamentos/:id/desarquivar - Desarquivar agendamento (admin)
router.patch('/:id/desarquivar', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.desarquivar);

// DELETE /api/agendamentos/:id - Excluir agendamento (admin) - apenas cancelados
router.delete('/:id', verificarToken, verificarAdmin, validarUUID('id'), agendamentoController.excluir);

module.exports = router;







