const prisma = require('../config/database');

class AgendamentoRepository {
  /**
   * Lista todos os agendamentos
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} Lista de agendamentos
   */
  async findAll(filters = {}) {
    const where = {
      arquivado: false, // Por padrão, não mostrar arquivados
    };
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.dataInicio && filters.dataFim) {
      where.dataHora = {
        gte: filters.dataInicio,
        lte: filters.dataFim,
      };
    }

    return await prisma.agendamento.findMany({
      where,
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
      orderBy: {
        dataHora: 'asc',
      },
    });
  }

  /**
   * Busca agendamento por ID
   * @param {string} id - ID do agendamento
   * @returns {Promise<Object|null>} Agendamento encontrado ou null
   */
  async findById(id) {
    return await prisma.agendamento.findUnique({
      where: { id },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Busca agendamento por token de verificação
   * @param {string} token - Token de verificação
   * @returns {Promise<Object|null>} Agendamento encontrado ou null
   */
  async findByToken(token) {
    return await prisma.agendamento.findUnique({
      where: { tokenVerificacao: token },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Busca agendamento por PIN de verificação
   * @param {string} pin - PIN de verificação
   * @returns {Promise<Object|null>} Agendamento encontrado ou null
   */
  async findByPIN(pin) {
    return await prisma.agendamento.findFirst({
      where: { pinVerificacao: pin },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Cria um novo agendamento
   * @param {Object} agendamentoData - Dados do agendamento
   * @returns {Promise<Object>} Agendamento criado
   */
  async create(agendamentoData) {
    return await prisma.agendamento.create({
      data: agendamentoData,
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Atualiza um agendamento
   * @param {string} id - ID do agendamento
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Agendamento atualizado
   */
  async update(id, updateData) {
    return await prisma.agendamento.update({
      where: { id },
      data: updateData,
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Atualiza status do agendamento
   * @param {string} id - ID do agendamento
   * @param {string} status - Novo status
   * @returns {Promise<Object>} Agendamento atualizado
   */
  async updateStatus(id, status) {
    return await prisma.agendamento.update({
      where: { id },
      data: { status },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Atualiza status e arquiva o agendamento
   * @param {string} id - ID do agendamento
   * @param {string} status - Novo status (deve ser CONCLUIDO)
   * @returns {Promise<Object>} Agendamento atualizado
   */
  async updateStatusEArquivar(id, status) {
    return await prisma.agendamento.update({
      where: { id },
      data: { 
        status,
        arquivado: true,
        dataArquivamento: new Date()
      },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Lista agendamentos arquivados
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} Lista de agendamentos arquivados
   */
  async findArquivados(filters = {}) {
    const where = {
      arquivado: true,
    };
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.dataInicio && filters.dataFim) {
      where.dataHora = {
        gte: filters.dataInicio,
        lte: filters.dataFim,
      };
    }

    return await prisma.agendamento.findMany({
      where,
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
      orderBy: {
        dataArquivamento: 'desc',
      },
    });
  }

  /**
   * Desarquiva um agendamento
   * @param {string} id - ID do agendamento
   * @returns {Promise<Object>} Agendamento desarquivado
   */
  async desarquivar(id) {
    return await prisma.agendamento.update({
      where: { id },
      data: { 
        arquivado: false,
        dataArquivamento: null
      },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            duracao: true,
            preco: true,
          },
        },
      },
    });
  }

  /**
   * Verifica conflitos de horário
   * Como é um único trabalhador, qualquer agendamento conflita com outro
   * independente do serviço - o que importa é o horário
   * @param {Date} dataHora - Data e hora do agendamento
   * @param {number} duracao - Duração em minutos
   * @param {string} excludeId - ID do agendamento a excluir (para edição)
   * @returns {Promise<Array>} Agendamentos conflitantes
   */
  async verificarConflitos(dataHora, duracao, excludeId = null) {
    const inicio = new Date(dataHora);
    const fim = new Date(dataHora.getTime() + duracao * 60000);

    // Buscar todos os agendamentos ativos no mesmo dia
    // Como é um único trabalhador, qualquer agendamento no mesmo horário conflita
    const dataInicio = new Date(inicio);
    dataInicio.setHours(0, 0, 0, 0);
    
    const dataFim = new Date(inicio);
    dataFim.setHours(23, 59, 59, 999);

    const where = {
      dataHora: {
        gte: dataInicio,
        lte: dataFim,
      },
      status: {
        in: ['PENDENTE', 'CONFIRMADO'], // Apenas agendamentos ativos ocupam horário
      },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    // Buscar todos os agendamentos do dia
    const agendamentosDoDia = await prisma.agendamento.findMany({
      where,
      include: {
        servico: {
          select: {
            nome: true,
            duracao: true,
          },
        },
      },
    });

    // Filtrar apenas os que realmente conflitam (sobreposição de horários)
    const conflitos = agendamentosDoDia.filter(agendamento => {
      const inicioExistente = new Date(agendamento.dataHora);
      const fimExistente = new Date(inicioExistente.getTime() + agendamento.servico.duracao * 60000);

      // Verificar se há sobreposição de horários
      // Dois períodos se sobrepõem se: inicioExistente < fim && fimExistente > inicio
      return (inicioExistente < fim && fimExistente > inicio);
    });

    return conflitos;
  }

  /**
   * Busca horários ocupados em uma data específica
   * Como é um único trabalhador, qualquer agendamento ocupa o horário
   * independente do serviço - o que importa é o horário
   * @param {Date|string} data - Data para verificar
   * @returns {Promise<Array>} Array de horários ocupados (formato HH:MM)
   */
  async buscarHorariosOcupados(data) {
    // Garantir que a data seja interpretada no timezone local
    // Se a data vier no formato YYYY-MM-DD, criar a data corretamente
    let dataInicio, dataFim;
    
    if (typeof data === 'string' && data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Formato YYYY-MM-DD - criar data no timezone local
      const [ano, mes, dia] = data.split('-').map(Number);
      dataInicio = new Date(ano, mes - 1, dia, 0, 0, 0, 0); // mes - 1 porque Date usa 0-11
      dataFim = new Date(ano, mes - 1, dia, 23, 59, 59, 999);
    } else {
      // Se já for uma data ou outro formato, usar diretamente
      dataInicio = new Date(data);
      dataInicio.setHours(0, 0, 0, 0);
      
      dataFim = new Date(data);
      dataFim.setHours(23, 59, 59, 999);
    }
    
    console.log('🔍 Buscando horários ocupados para:', data);
    console.log('📅 Data início (local):', dataInicio.toISOString());
    console.log('📅 Data fim (local):', dataFim.toISOString());

    // Buscar TODOS os agendamentos do dia (independente do serviço)
    // Como é um único trabalhador, qualquer agendamento ocupa o horário
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        dataHora: {
          gte: dataInicio,
          lte: dataFim,
        },
        status: {
          in: ['PENDENTE', 'CONFIRMADO'], // Apenas agendamentos pendentes e confirmados ocupam horário
        },
      },
      include: {
        servico: {
          select: {
            duracao: true,
          },
        },
      },
    });

    // Converter agendamentos em horários ocupados
    const horariosOcupados = new Set();
    
    console.log(`📋 Encontrados ${agendamentos.length} agendamento(s) para esta data`);
    
    agendamentos.forEach(agendamento => {
      const dataHora = new Date(agendamento.dataHora);
      const duracao = agendamento.servico.duracao;
      
      // Verificar se o agendamento está realmente no dia correto
      const dataAgendamento = new Date(dataHora.getFullYear(), dataHora.getMonth(), dataHora.getDate());
      const dataBuscada = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), dataInicio.getDate());
      
      if (dataAgendamento.getTime() !== dataBuscada.getTime()) {
        console.log(`⚠️ Agendamento ${agendamento.id} está em data diferente:`, dataAgendamento, 'vs', dataBuscada);
        return; // Pular agendamentos de outros dias
      }
      
      // Marcar o horário inicial
      const horaInicio = dataHora.getHours();
      const minutosInicio = dataHora.getMinutes();
      
      // Calcular horário de fim
      const dataHoraFim = new Date(dataHora.getTime() + duracao * 60000);
      const horaFim = dataHoraFim.getHours();
      const minutosFim = dataHoraFim.getMinutes();
      
      console.log(`  📌 Agendamento ${agendamento.id}: ${horaInicio}:${String(minutosInicio).padStart(2, '0')} - ${horaFim}:${String(minutosFim).padStart(2, '0')} (${duracao}min)`);
      
      // Marcar todos os slots de hora que devem ser bloqueados
      // Lógica: bloqueamos uma hora HH:00 se há um agendamento que está ativo durante qualquer parte da hora HH
      // (ou seja, que ocupa o período de HH:00:00 até HH:59:59.999)
      // 
      // Um agendamento está ativo em uma hora H se ele ocupa qualquer parte dessa hora
      // Isso acontece se: inicioExistente < fimHora && fimExistente > inicioHora
      // 
      // Exemplos:
      // - Agendamento 09:00-10:00: bloqueia 09:00 (ocupa 09:00-09:59) e 10:00 (ocupa 10:00-10:00)
      // - Agendamento 09:30-10:30: bloqueia 09:00 (ocupa 09:30-09:59) e 10:00 (ocupa 10:00-10:30)
      // - Agendamento 09:00-09:45: bloqueia apenas 09:00 (ocupa apenas 09:00-09:45)
      // - Agendamento 09:15-10:15: bloqueia 09:00 (ocupa 09:15-09:59) e 10:00 (ocupa 10:00-10:15)
      
      const inicioExistente = dataHora.getTime();
      const fimExistente = dataHoraFim.getTime();
      
      // Verificar todas as horas que o agendamento pode tocar
      // Incluir a hora de início e todas as horas até a hora de fim
      const horaMinima = horaInicio;
      const horaMaxima = horaFim;
      
      for (let hora = horaMinima; hora <= horaMaxima; hora++) {
        // Criar os limites da hora (HH:00:00.000 até HH:59:59.999)
        const inicioHora = new Date(dataInicio);
        inicioHora.setHours(hora, 0, 0, 0);
        const fimHora = new Date(dataInicio);
        fimHora.setHours(hora, 59, 59, 999);
        
        // Verificar se o agendamento está ativo durante esta hora
        // Está ativo se há sobreposição: inicioExistente < fimHora && fimExistente > inicioHora
        // Mas se termina exatamente no início da hora (fimExistente === inicioHora), não está ativo
        const estaAtivo = (inicioExistente < fimHora.getTime()) && (fimExistente > inicioHora.getTime());
        
        if (estaAtivo) {
          const horarioFormatado = `${String(hora).padStart(2, '0')}:00`;
          horariosOcupados.add(horarioFormatado);
        }
      }
    });

    const horariosArray = Array.from(horariosOcupados).sort();
    console.log('✅ Horários ocupados retornados:', horariosArray);
    
    return horariosArray;
  }

  /**
   * Remove um agendamento
   * @param {string} id - ID do agendamento
   * @returns {Promise<Object>} Agendamento removido
   */
  async delete(id) {
    return await prisma.agendamento.delete({
      where: { id },
    });
  }

  /**
   * Obtém estatísticas de agendamentos
   * @param {Object} filters - Filtros de data (dataInicio, dataFim)
   * @returns {Promise<Object>} Estatísticas agregadas
   */
  async obterEstatisticas(filters = {}) {
    const where = {
      status: 'CONCLUIDO', // Apenas agendamentos concluídos contam para estatísticas
    };

    if (filters.dataInicio && filters.dataFim) {
      // Converter para Date se necessário e ajustar para incluir o dia inteiro
      const dataInicio = new Date(filters.dataInicio)
      dataInicio.setHours(0, 0, 0, 0)
      
      const dataFim = new Date(filters.dataFim)
      dataFim.setHours(23, 59, 59, 999)
      
      where.dataHora = {
        gte: dataInicio,
        lte: dataFim,
      };
    }

    // Buscar agendamentos concluídos com serviço
    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            preco: true,
          },
        },
      },
    });

    // Filtrar apenas agendamentos que têm serviço válido
    const agendamentosValidos = agendamentos.filter(ag => ag.servico && ag.servico.preco);
    
    // Log para debug (pode ser removido depois)
    console.log(`📊 Estatísticas: ${agendamentos.length} agendamentos concluídos encontrados, ${agendamentosValidos.length} válidos`);

    // Calcular estatísticas
    const totalGanhos = agendamentosValidos.reduce((sum, ag) => {
      return sum + Number(ag.servico.preco);
    }, 0);

    const totalClientes = agendamentosValidos.length;

    // Agrupar por serviço
    const porServico = {};
    agendamentosValidos.forEach(ag => {
      const servicoNome = ag.servico.nome;
      if (!porServico[servicoNome]) {
        porServico[servicoNome] = {
          nome: servicoNome,
          quantidade: 0,
          ganhos: 0,
        };
      }
      porServico[servicoNome].quantidade++;
      porServico[servicoNome].ganhos += Number(ag.servico.preco);
    });

    // Agrupar por dia
    const porDia = {};
    agendamentosValidos.forEach(ag => {
      const data = new Date(ag.dataHora);
      const diaKey = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
      if (!porDia[diaKey]) {
        porDia[diaKey] = {
          data: diaKey,
          quantidade: 0,
          ganhos: 0,
        };
      }
      porDia[diaKey].quantidade++;
      porDia[diaKey].ganhos += Number(ag.servico.preco);
    });

    // Agrupar por mês
    const porMes = {};
    agendamentosValidos.forEach(ag => {
      const data = new Date(ag.dataHora);
      const mesKey = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      if (!porMes[mesKey]) {
        porMes[mesKey] = {
          mes: mesKey,
          quantidade: 0,
          ganhos: 0,
        };
      }
      porMes[mesKey].quantidade++;
      porMes[mesKey].ganhos += Number(ag.servico.preco);
    });

    return {
      totalGanhos,
      totalClientes,
      porServico: Object.values(porServico),
      porDia: Object.values(porDia).sort((a, b) => a.data.localeCompare(b.data)),
      porMes: Object.values(porMes).sort((a, b) => a.mes.localeCompare(b.mes)),
    };
  }
}

module.exports = new AgendamentoRepository();

