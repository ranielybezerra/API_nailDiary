const dicaRepository = require('../repositories/dica.repository');

class DicaService {
  /**
   * Lista todas as dicas
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} Lista de dicas
   */
  async listarDicas(filters = {}) {
    return await dicaRepository.findAll(filters);
  }

  /**
   * Obtém uma dica por ID
   * @param {string} id - ID da dica
   * @returns {Promise<Object>} Dica encontrada
   */
  async obterDica(id) {
    const dica = await dicaRepository.findById(id);
    
    if (!dica) {
      throw new Error('Dica não encontrada');
    }

    return dica;
  }

  /**
   * Cria uma nova dica
   * @param {Object} dicaData - Dados da dica
   * @returns {Promise<Object>} Dica criada
   */
  async criarDica(dicaData) {
    // Validar dados obrigatórios
    this.validarDadosDica(dicaData);

    return await dicaRepository.create(dicaData);
  }

  /**
   * Atualiza uma dica
   * @param {string} id - ID da dica
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Dica atualizada
   */
  async atualizarDica(id, updateData) {
    // Verificar se a dica existe
    await this.obterDica(id);

    // Validar dados se fornecidos
    if (updateData.titulo || updateData.conteudo) {
      this.validarDadosDica(updateData);
    }

    return await dicaRepository.update(id, updateData);
  }

  /**
   * Exclui uma dica
   * @param {string} id - ID da dica
   * @returns {Promise<Object>} Dica excluída
   */
  async excluirDica(id) {
    await this.obterDica(id);
    return await dicaRepository.delete(id);
  }

  /**
   * Busca dicas por título
   * @param {string} titulo - Título para buscar
   * @returns {Promise<Array>} Lista de dicas encontradas
   */
  async buscarDicas(titulo) {
    if (!titulo || titulo.trim().length < 2) {
      throw new Error('Título deve ter pelo menos 2 caracteres');
    }

    return await dicaRepository.findByTitulo(titulo.trim());
  }

  /**
   * Valida dados da dica
   * @param {Object} dicaData - Dados da dica
   */
  validarDadosDica(dicaData) {
    if (!dicaData.titulo || dicaData.titulo.trim().length < 3) {
      throw new Error('Título é obrigatório e deve ter pelo menos 3 caracteres');
    }

    if (!dicaData.conteudo || dicaData.conteudo.trim().length < 10) {
      throw new Error('Conteúdo é obrigatório e deve ter pelo menos 10 caracteres');
    }

    if (dicaData.titulo && dicaData.titulo.length > 200) {
      throw new Error('Título deve ter no máximo 200 caracteres');
    }

    if (dicaData.conteudo && dicaData.conteudo.length > 5000) {
      throw new Error('Conteúdo deve ter no máximo 5000 caracteres');
    }
  }
}

module.exports = new DicaService();







