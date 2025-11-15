const { PrismaClient } = require('@prisma/client');
const { hashSenha } = require('../src/utils/hash.util');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ============================================
  // USUÁRIO ADMINISTRADOR
  // ============================================
  console.log('👤 Criando usuário administrador...');
  
  const usuarioAdmin = {
    email: 'ranielybezerra3@gmail.com',
    nome: 'Administrador',
    senha: 'rany3003',
    role: 'ADMIN',
  };

  const senhaHash = await hashSenha(usuarioAdmin.senha);
  const usuario = await prisma.usuario.upsert({
    where: { email: usuarioAdmin.email },
    update: {
      nome: usuarioAdmin.nome,
      senha: senhaHash,
      role: usuarioAdmin.role,
    },
    create: {
      nome: usuarioAdmin.nome,
      email: usuarioAdmin.email,
      senha: senhaHash,
      role: usuarioAdmin.role,
    },
  });
  console.log(`  ✅ Usuário administrador criado/atualizado: ${usuario.email}`);

  // ============================================
  // RESUMO
  // ============================================
  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('📋 Resumo:');
  console.log(`  👤 1 usuário administrador criado/atualizado\n`);
  console.log('🔑 Credenciais de acesso:');
  console.log(`  📧 ${usuario.email}`);
  console.log(`  🔐 Senha: ${usuarioAdmin.senha}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
