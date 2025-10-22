# NailDiary Backend

Backend do sistema NailDiary desenvolvido com Express.js, Prisma ORM e PostgreSQL, seguindo arquitetura em camadas.

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas bem definida:

- **Controllers**: Camada de apresentação, lida com requisições HTTP
- **Services**: Camada de lógica de negócio
- **Repositories**: Camada de acesso a dados
- **Middlewares**: Autenticação, validação e tratamento de erros
- **Utils**: Funções auxiliares (JWT, hash, formatação de respostas)

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## ⚙️ Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/naildiary?schema=public"
   JWT_SECRET="seu_jwt_secret_super_seguro_aqui"
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"
   ```

4. Configure o banco de dados:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. Inicie o servidor:
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm start
   ```

## 📚 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento com nodemon
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:push` - Aplica mudanças no banco de dados
- `npm run db:seed` - Popula o banco com dados iniciais
- `npm run db:studio` - Abre o Prisma Studio

## 🔗 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login de administrador
- `GET /api/auth/validate` - Validar token
- `POST /api/auth/logout` - Logout

### Serviços
- `GET /api/servicos` - Listar serviços (público)
- `GET /api/servicos/:id` - Obter serviço por ID (público)
- `POST /api/servicos` - Criar serviço (admin)
- `PUT /api/servicos/:id` - Atualizar serviço (admin)
- `PATCH /api/servicos/:id/inativar` - Inativar serviço (admin)
- `PATCH /api/servicos/:id/ativar` - Ativar serviço (admin)
- `DELETE /api/servicos/:id` - Excluir serviço (admin)

### Agendamentos
- `GET /api/agendamentos` - Listar agendamentos (admin)
- `GET /api/agendamentos/:id` - Obter agendamento por ID (admin)
- `POST /api/agendamentos` - Criar agendamento (público)
- `PUT /api/agendamentos/:id` - Atualizar agendamento (admin)
- `PATCH /api/agendamentos/:id/confirmar` - Confirmar agendamento (admin)
- `PATCH /api/agendamentos/:id/cancelar` - Cancelar agendamento (admin)
- `GET /api/agendamentos/verificar-disponibilidade` - Verificar disponibilidade (público)

### Dicas
- `GET /api/dicas` - Listar dicas (público)
- `GET /api/dicas/buscar` - Buscar dicas por título (público)
- `GET /api/dicas/:id` - Obter dica por ID (público)
- `POST /api/dicas` - Criar dica (admin)
- `PUT /api/dicas/:id` - Atualizar dica (admin)
- `DELETE /api/dicas/:id` - Excluir dica (admin)

### Health Check
- `GET /api/health` - Status da API

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer <seu_token>
```

### Usuário Padrão (Criado no Seed)
- **Email**: admin@naildiary.com
- **Senha**: admin123

## 📊 Modelos de Dados

### Usuario
- id, nome, email, senha, role, createdAt, updatedAt

### Servico
- id, nome, descricao, duracao, preco, icone, ativo, createdAt, updatedAt

### Agendamento
- id, clienteNome, clienteEmail, clienteTelefone, dataHora, status, observacoes, servicoId, createdAt, updatedAt

### Dica
- id, titulo, conteudo, dataPublicacao, createdAt, updatedAt

## 🛡️ Validações

A API inclui validações robustas para:
- Formato de email
- Tamanho de campos
- Tipos de dados
- Regras de negócio (horários, conflitos, etc.)

## 📝 Formato de Respostas

### Sucesso
```json
{
  "success": true,
  "data": {...},
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
```

## 🚨 Tratamento de Erros

A API possui tratamento centralizado de erros com códigos específicos:
- `VALIDATION_ERROR` - Erro de validação
- `NOT_FOUND` - Recurso não encontrado
- `CONFLICT` - Conflito (ex: horário ocupado)
- `ACCESS_DENIED` - Acesso negado
- `INVALID_CREDENTIALS` - Credenciais inválidas
- `TOKEN_ERROR` - Erro de token

## 🔧 Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork
2. Crie uma branch para sua feature
3. Implemente suas mudanças
4. Teste localmente
5. Faça um pull request

## 📄 Licença

ISC
