const { PrismaClient } = require('@prisma/client');
const { hashSenha } = require('../src/utils/hash.util');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  console.log('👤 Criando usuário administrador...');
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@naildiary.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@naildiary.com',
      senha: await hashSenha('admin123'),
      role: 'ADMIN',
    },
  });
  console.log('✅ Usuário admin criado:', admin.email);

  // Criar serviços
  console.log('💅 Criando serviços...');
  const servicos = [
    {
      nome: 'Manicure Completa',
      descricao: 'Manicure completa com esmaltação e cuidados com as cutículas',
      duracao: 45,
      preco: 35.00,
      icone: '💅',
    },
    {
      nome: 'Pedicure Completa',
      descricao: 'Pedicure completa com esmaltação e cuidados com os pés',
      duracao: 60,
      preco: 40.00,
      icone: '🦶',
    },
    {
      nome: 'Alongamento de Gel',
      descricao: 'Alongamento de unhas com gel para maior durabilidade',
      duracao: 120,
      preco: 120.00,
      icone: '✨',
    },
    {
      nome: 'Curso de Alongamento',
      descricao: 'Curso completo de alongamento de unhas com gel',
      duracao: 1680, // 4 semanas em minutos
      preco: 450.00,
      icone: '🎓',
    },
  ];

  for (const servicoData of servicos) {
    const servico = await prisma.servico.create({
      data: servicoData,
    });
    console.log(`✅ Serviço criado: ${servico.nome}`);
  }

  // Criar dicas
  console.log('💡 Criando dicas...');
  const dicas = [
    {
      titulo: 'Hidratação de Cutículas',
      conteudo: 'Para manter suas cutículas saudáveis, aplique óleo de cutícula diariamente. Isso ajuda a prevenir ressecamento e mantém as unhas mais bonitas. Use um bastão de laranjeira para empurrar suavemente as cutículas após o banho, quando estão mais macias.',
    },
    {
      titulo: 'Cuidados com Alongamento',
      conteudo: 'Unhas alongadas requerem cuidados especiais. Evite usar as unhas como ferramentas e sempre use luvas ao fazer tarefas domésticas. Mantenha o alongamento por no máximo 3-4 semanas e faça a manutenção regularmente para evitar quebras.',
    },
    {
      titulo: 'Como fazer o esmalte durar mais',
      conteudo: 'Para que seu esmalte dure mais tempo, siga estes passos: 1) Limpe bem as unhas antes de esmaltar, 2) Use base coat, 3) Aplique o esmalte em camadas finas, 4) Finalize com top coat, 5) Evite água quente nas primeiras 2 horas. Essas dicas podem fazer seu esmalte durar até 2 semanas!',
    },
    {
      titulo: 'Alimentação para unhas saudáveis',
      conteudo: 'Uma alimentação rica em proteínas, vitaminas do complexo B, ferro e zinco é essencial para unhas fortes e saudáveis. Inclua na sua dieta: ovos, peixes, castanhas, folhas verdes escuras e frutas cítricas. A hidratação também é fundamental - beba pelo menos 2 litros de água por dia.',
    },
  ];

  for (const dicaData of dicas) {
    const dica = await prisma.dica.create({
      data: dicaData,
    });
    console.log(`✅ Dica criada: ${dica.titulo}`);
  }

  // Criar alguns agendamentos de exemplo
  console.log('📅 Criando agendamentos de exemplo...');
  const servicosExistentes = await prisma.servico.findMany();
  
  if (servicosExistentes.length > 0) {
    const agendamentos = [
      {
        clienteNome: 'Maria Silva',
        clienteEmail: 'maria@email.com',
        clienteTelefone: '(11) 99999-1111',
        dataHora: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias no futuro
        servicoId: servicosExistentes[0].id,
        status: 'PENDENTE',
        observacoes: 'Primeira vez fazendo manicure',
      },
      {
        clienteNome: 'Joana Santos',
        clienteEmail: 'joana@email.com',
        clienteTelefone: '(11) 99999-2222',
        dataHora: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias no futuro
        servicoId: servicosExistentes[1].id,
        status: 'CONFIRMADO',
        observacoes: 'Cliente preferencial',
      },
    ];

    for (const agendamentoData of agendamentos) {
      const agendamento = await prisma.agendamento.create({
        data: agendamentoData,
      });
      console.log(`✅ Agendamento criado: ${agendamento.clienteNome}`);
    }
  }

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados criados:');
  console.log('👤 Usuário admin: admin@naildiary.com / admin123');
  console.log(`💅 ${servicos.length} serviços`);
  console.log(`💡 ${dicas.length} dicas`);
  console.log('📅 2 agendamentos de exemplo');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
