const express = require('express');
const router = express.Router();
const dicaController = require('../controllers/dica.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');
const { 
  validarCriarDica, 
  validarUUID, 
  validarBusca 
} = require('../middlewares/validation.middleware');

// GET /api/dicas - Listar dicas (público)
router.get('/', validarBusca, dicaController.listar);

// GET /api/dicas/buscar - Buscar dicas por título (público)
router.get('/buscar', dicaController.buscar);

// GET /api/dicas/:id - Obter dica por ID (público)
router.get('/:id', validarUUID('id'), dicaController.obterPorId);

// POST /api/dicas - Criar dica (admin)
router.post('/', verificarToken, verificarAdmin, validarCriarDica, dicaController.criar);

// PUT /api/dicas/:id - Atualizar dica (admin)
router.put('/:id', verificarToken, verificarAdmin, validarUUID('id'), dicaController.atualizar);

// DELETE /api/dicas/:id - Excluir dica (admin)
router.delete('/:id', verificarToken, verificarAdmin, validarUUID('id'), dicaController.excluir);

module.exports = router;



