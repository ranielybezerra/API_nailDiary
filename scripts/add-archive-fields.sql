-- Script para adicionar campos de arquivamento na tabela agendamentos
-- Execute este script se os campos não existirem no banco de dados

-- Adicionar campo arquivado (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agendamentos' 
        AND column_name = 'arquivado'
    ) THEN
        ALTER TABLE agendamentos 
        ADD COLUMN arquivado BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Adicionar campo dataArquivamento (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agendamentos' 
        AND column_name = 'dataArquivamento'
    ) THEN
        ALTER TABLE agendamentos 
        ADD COLUMN "dataArquivamento" TIMESTAMP;
    END IF;
END $$;

-- Verificar se os campos foram adicionados
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'agendamentos'
AND column_name IN ('arquivado', 'dataArquivamento');


