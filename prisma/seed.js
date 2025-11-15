const { PrismaClient } = require('@prisma/client');
const { hashSenha } = require('../src/utils/hash.util');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ============================================
  // USUÁRIOS
  // ============================================
  console.log('👤 Criando usuários...');
  
  const usuarios = [
    {
      email: 'admin@naildiary.com',
      nome: 'Administrador',
      senha: 'admin123',
      role: 'ADMIN',
    },
    {
      email: 'gerente@naildiary.com',
      nome: 'Gerente',
      senha: 'gerente123',
      role: 'ADMIN',
    },
  ];

  for (const usuarioData of usuarios) {
    const senhaHash = await hashSenha(usuarioData.senha);
    const usuario = await prisma.usuario.upsert({
      where: { email: usuarioData.email },
      update: {},
      create: {
        nome: usuarioData.nome,
        email: usuarioData.email,
        senha: senhaHash,
        role: usuarioData.role,
      },
    });
    console.log(`  ✅ Usuário criado: ${usuario.email} (senha: ${usuarioData.senha})`);
  }

  // ============================================
  // SERVIÇOS
  // ============================================
  console.log('\n💅 Criando serviços...');
  
  const servicos = [
    {
      nome: 'Manicure Completa',
      descricao: 'Manicure completa com esmaltação, corte, lixamento e cuidados com as cutículas. Inclui base coat, esmalte e top coat.',
      duracao: 45,
      preco: 35.00,
      icone: '💅',
      ativo: true,
    },
    {
      nome: 'Pedicure Completa',
      descricao: 'Pedicure completa com esmaltação, corte, lixamento, remoção de cutículas e hidratação dos pés. Inclui esfoliação leve.',
      duracao: 60,
      preco: 40.00,
      icone: '🦶',
      ativo: true,
    },
    {
      nome: 'Manicure + Pedicure',
      descricao: 'Pacote completo de manicure e pedicure com desconto especial. Ideal para quem quer cuidar das unhas das mãos e pés.',
      duracao: 90,
      preco: 65.00,
      icone: '✨',
      ativo: true,
    },
    {
      nome: 'Alongamento de Gel',
      descricao: 'Alongamento de unhas com gel para maior durabilidade e resistência. Inclui esmaltação e decoração básica.',
      duracao: 120,
      preco: 120.00,
      icone: '💎',
      ativo: true,
    },
    {
      nome: 'Manutenção de Alongamento',
      descricao: 'Manutenção de unhas alongadas com gel. Inclui preenchimento e esmaltação.',
      duracao: 90,
      preco: 80.00,
      icone: '🔧',
      ativo: true,
    },
    {
      nome: 'Unhas Decoradas',
      descricao: 'Esmaltação com decoração artística personalizada. Inclui desenhos, glitter e adesivos.',
      duracao: 60,
      preco: 50.00,
      icone: '🎨',
      ativo: true,
    },
    {
      nome: 'Spa dos Pés',
      descricao: 'Tratamento completo para os pés com pedicure, esfoliação profunda, máscara hidratante e massagem relaxante.',
      duracao: 75,
      preco: 70.00,
      icone: '🧖',
      ativo: true,
    },
    {
      nome: 'Curso de Alongamento',
      descricao: 'Curso completo de alongamento de unhas com gel. Inclui teoria e prática. Duração de 4 semanas com certificado.',
      duracao: 1680, // 4 semanas em minutos (28 dias x 60 min)
      preco: 450.00,
      icone: '🎓',
      ativo: true,
    },
    {
      nome: 'Remoção de Unhas',
      descricao: 'Remoção segura de unhas de gel ou acrílico sem danificar a unha natural.',
      duracao: 30,
      preco: 25.00,
      icone: '🔨',
      ativo: true,
    },
    {
      nome: 'Esmaltação em Gel',
      descricao: 'Esmaltação em gel com durabilidade de até 3 semanas. Inclui base, cor e top coat.',
      duracao: 40,
      preco: 45.00,
      icone: '💿',
      ativo: true,
    },
  ];

  // Verificar serviços existentes para evitar duplicatas
  const servicosExistentes = await prisma.servico.findMany({
    select: { nome: true, id: true },
  });
  const servicosMap = new Map(servicosExistentes.map(s => [s.nome, s.id]));

  const servicosCriados = [];
  for (const servicoData of servicos) {
    // Verifica se já existe
    const servicoExistente = servicosMap.get(servicoData.nome);
    
    if (servicoExistente) {
      // Atualiza se existir
      const servico = await prisma.servico.update({
        where: { id: servicoExistente },
        data: servicoData,
      });
      servicosCriados.push(servico);
      console.log(`  🔄 Serviço atualizado: ${servico.nome} - R$ ${servico.preco}`);
    } else {
      // Cria se não existir
      const servico = await prisma.servico.create({
        data: servicoData,
      });
      servicosCriados.push(servico);
      console.log(`  ✅ Serviço criado: ${servico.nome} - R$ ${servico.preco}`);
    }
  }

  // ============================================
  // DICAS
  // ============================================
  console.log('\n💡 Criando dicas de cuidados...');
  
  const dicas = [
    {
      titulo: 'Hidratação de Cutículas',
      conteudo: 'Para manter suas cutículas saudáveis, aplique óleo de cutícula diariamente. Isso ajuda a prevenir ressecamento e mantém as unhas mais bonitas. Use um bastão de laranjeira para empurrar suavemente as cutículas após o banho, quando estão mais macias. O óleo de cutícula também fortalece as unhas e previne quebras.',
    },
    {
      titulo: 'Cuidados com Alongamento',
      conteudo: 'Unhas alongadas requerem cuidados especiais. Evite usar as unhas como ferramentas e sempre use luvas ao fazer tarefas domésticas. Mantenha o alongamento por no máximo 3-4 semanas e faça a manutenção regularmente para evitar quebras. Se notar qualquer desconforto ou sinal de infecção, procure um profissional imediatamente.',
    },
    {
      titulo: 'Como fazer o esmalte durar mais',
      conteudo: 'Para que seu esmalte dure mais tempo, siga estes passos: 1) Limpe bem as unhas antes de esmaltar removendo qualquer resíduo de esmalte anterior, 2) Use base coat para proteger e criar uma superfície lisa, 3) Aplique o esmalte em camadas finas (2-3 camadas), 4) Finalize com top coat de qualidade, 5) Evite água quente nas primeiras 2 horas após esmaltar. Essas dicas podem fazer seu esmalte durar até 2 semanas!',
    },
    {
      titulo: 'Alimentação para unhas saudáveis',
      conteudo: 'Uma alimentação rica em proteínas, vitaminas do complexo B, ferro e zinco é essencial para unhas fortes e saudáveis. Inclua na sua dieta: ovos, peixes, castanhas, folhas verdes escuras e frutas cítricas. A hidratação também é fundamental - beba pelo menos 2 litros de água por dia. Evite dietas muito restritivas que podem enfraquecer as unhas.',
    },
    {
      titulo: 'Proteção durante tarefas domésticas',
      conteudo: 'Sempre use luvas ao lavar louça, fazer limpeza ou trabalhar com produtos químicos. Os produtos de limpeza podem ressecar e enfraquecer as unhas. Após qualquer contato com água, seque bem as mãos e unhas. Aplicar uma camada de esmalte ou base fortalecedora também ajuda a proteger as unhas naturais.',
    },
    {
      titulo: 'Sinais de problemas nas unhas',
      conteudo: 'Fique atenta aos sinais de problemas: unhas quebradiças, manchas brancas, descolamento, mudança de cor ou formato. Esses podem indicar deficiências nutricionais, infecções fúngicas ou outros problemas de saúde. Consulte um dermatologista se notar alterações persistentes. Unhas saudáveis são um reflexo da saúde geral do corpo.',
    },
    {
      titulo: 'Frequência ideal de manicure',
      conteudo: 'A frequência ideal de manicure varia de acordo com o tipo de tratamento. Para esmaltação comum, recomenda-se a cada 7-10 dias. Para unhas de gel, a manutenção deve ser feita a cada 2-3 semanas. Unhas naturais podem ser cuidadas semanalmente. Evite fazer manicure muito frequentemente, pois isso pode enfraquecer as unhas. Dê um intervalo de pelo menos 1 semana entre as sessões.',
    },
    {
      titulo: 'Cuidados pós-manicure',
      conteudo: 'Após fazer a manicure, evite atividades que possam danificar o esmalte nas primeiras horas. Não use as unhas para abrir latas ou objetos. Mantenha as mãos hidratadas com cremes específicos. Se fizer unhas de gel, proteja-as do sol excessivo para evitar amarelamento. E lembre-se: unhas bem cuidadas são um investimento em sua autoestima!',
    },
  ];

  // Verificar dicas existentes para evitar duplicatas
  const dicasExistentes = await prisma.dica.findMany({
    select: { titulo: true },
  });
  const titulosExistentes = new Set(dicasExistentes.map(d => d.titulo));

  for (const dicaData of dicas) {
    // Só cria se não existir
    if (!titulosExistentes.has(dicaData.titulo)) {
      const dica = await prisma.dica.create({
        data: dicaData,
      });
      console.log(`  ✅ Dica criada: ${dica.titulo}`);
    } else {
      console.log(`  ⏭️  Dica já existe: ${dicaData.titulo}`);
    }
  }

  // ============================================
  // AGENDAMENTOS
  // ============================================
  console.log('\n📅 Criando agendamentos de exemplo...');
  
  let agendamentosCriados = 0;
  if (servicosCriados.length > 0) {
    const agora = new Date();
    const agendamentos = [
      {
        clienteNome: 'Maria Silva',
        clienteEmail: 'maria.silva@email.com',
        clienteTelefone: '(11) 99999-1111',
        dataHora: new Date(agora.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 dias no futuro
        servicoId: servicosCriados[0].id, // Manicure Completa
        status: 'PENDENTE',
        observacoes: 'Primeira vez fazendo manicure. Preferência por cores neutras.',
      },
      {
        clienteNome: 'Joana Santos',
        clienteEmail: 'joana.santos@email.com',
        clienteTelefone: '(11) 99999-2222',
        dataHora: new Date(agora.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 dias no futuro
        servicoId: servicosCriados[1].id, // Pedicure Completa
        status: 'CONFIRMADO',
        observacoes: 'Cliente preferencial. Gosta de cores vibrantes.',
      },
      {
        clienteNome: 'Ana Costa',
        clienteEmail: 'ana.costa@email.com',
        clienteTelefone: '(11) 99999-3333',
        dataHora: new Date(agora.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 dias no futuro
        servicoId: servicosCriados[3].id, // Alongamento de Gel
        status: 'CONFIRMADO',
        observacoes: 'Manutenção de alongamento. Trazer referência de cor desejada.',
      },
      {
        clienteNome: 'Carla Oliveira',
        clienteEmail: 'carla.oliveira@email.com',
        clienteTelefone: '(11) 99999-4444',
        dataHora: new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 dias no futuro
        servicoId: servicosCriados[2].id, // Manicure + Pedicure
        status: 'PENDENTE',
        observacoes: 'Pacote completo. Primeira vez no salão.',
      },
      {
        clienteNome: 'Fernanda Lima',
        clienteEmail: 'fernanda.lima@email.com',
        clienteTelefone: '(11) 99999-5555',
        dataHora: new Date(agora.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        servicoId: servicosCriados[0].id, // Manicure Completa
        status: 'CONCLUIDO',
        observacoes: 'Atendimento realizado com sucesso. Cliente satisfeita.',
      },
      {
        clienteNome: 'Patricia Souza',
        clienteEmail: 'patricia.souza@email.com',
        clienteTelefone: '(11) 99999-6666',
        dataHora: new Date(agora.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        servicoId: servicosCriados[5].id, // Unhas Decoradas
        status: 'CONCLUIDO',
        observacoes: 'Decoração com flores. Cliente adorou o resultado.',
      },
      {
        clienteNome: 'Juliana Ferreira',
        clienteEmail: 'juliana.ferreira@email.com',
        clienteTelefone: '(11) 99999-7777',
        dataHora: new Date(agora.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 dia no futuro
        servicoId: servicosCriados[6].id, // Spa dos Pés
        status: 'CONFIRMADO',
        observacoes: 'Tratamento relaxante. Cliente tem alergia a alguns produtos, verificar.',
      },
      {
        clienteNome: 'Roberta Alves',
        clienteEmail: 'roberta.alves@email.com',
        clienteTelefone: '(11) 99999-8888',
        dataHora: new Date(agora.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        servicoId: servicosCriados[3].id, // Alongamento de Gel
        status: 'CANCELADO',
        observacoes: 'Cancelado por motivo de força maior. Cliente reagendou para próxima semana.',
      },
    ];

    for (const agendamentoData of agendamentos) {
      const agendamento = await prisma.agendamento.create({
        data: agendamentoData,
      });
      agendamentosCriados++;
      console.log(`  ✅ Agendamento criado: ${agendamento.clienteNome} - ${agendamento.status}`);
    }
  }

  // ============================================
  // RESUMO
  // ============================================
  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('📋 Resumo dos dados criados:');
  console.log(`  👤 ${usuarios.length} usuários`);
  console.log(`  💅 ${servicos.length} serviços`);
  console.log(`  💡 ${dicas.length} dicas`);
  console.log(`  📅 ${agendamentosCriados} agendamentos de exemplo\n`);
  console.log('🔑 Credenciais de acesso:');
  console.log('  📧 admin@naildiary.com / admin123');
  console.log('  📧 gerente@naildiary.com / gerente123\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
