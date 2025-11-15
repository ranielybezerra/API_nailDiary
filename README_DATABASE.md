# Configuração do Banco de Dados

## Problema de Autenticação

Se você está recebendo o erro:
```
Authentication failed against database server, the provided database credentials for `meuusuario` are not valid.
```

Isso significa que as credenciais do banco de dados no arquivo `.env` estão incorretas.

## Solução

### 1. Verificar se o PostgreSQL está rodando

```bash
# Verificar status do PostgreSQL
sudo systemctl status postgresql

# Ou iniciar se não estiver rodando
sudo systemctl start postgresql
```

### 2. Configurar o arquivo .env

Edite o arquivo `.env` na pasta `backend/` e configure a `DATABASE_URL` corretamente:

```env
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/naildiary?schema=public"
```

**Exemplo com usuário padrão do PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/naildiary?schema=public"
```

### 3. Criar o banco de dados (se não existir)

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Ou se você tem um usuário configurado
psql -U seu_usuario -d postgres

# Criar o banco de dados
CREATE DATABASE naildiary;

# Sair
\q
```

### 4. Verificar conexão

```bash
cd backend
npm run db:push
```

Se funcionar, a conexão está correta.

### 5. Executar o seed

```bash
npm run db:seed
```

## Formato da DATABASE_URL

```
postgresql://[USUARIO]:[SENHA]@[HOST]:[PORTA]/[NOME_DO_BANCO]?schema=public
```

- **USUARIO**: Seu usuário do PostgreSQL
- **SENHA**: Sua senha do PostgreSQL
- **HOST**: Geralmente `localhost` ou `127.0.0.1`
- **PORTA**: Geralmente `5432` (padrão do PostgreSQL)
- **NOME_DO_BANCO**: `naildiary`

## Criar usuário no PostgreSQL (se necessário)

```bash
# Conectar como superusuário
sudo -u postgres psql

# Criar usuário
CREATE USER meuusuario WITH PASSWORD 'minhasenha';

# Dar permissões
ALTER USER meuusuario CREATEDB;

# Criar banco de dados
CREATE DATABASE naildiary OWNER meuusuario;

# Dar todas as permissões no banco
GRANT ALL PRIVILEGES ON DATABASE naildiary TO meuusuario;

# Sair
\q
```

## Testar conexão manualmente

```bash
# Testar conexão
psql -U seu_usuario -d naildiary -h localhost
```

Se conseguir conectar, as credenciais estão corretas.


