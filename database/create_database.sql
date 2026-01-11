-- ================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Anonimización de Datos
-- ================================================

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE data_anonymization;
-- \c data_anonymization;

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLA: datasets
-- Almacena información sobre los datasets subidos
-- ================================================

CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_size BIGINT DEFAULT 0,
    row_count INTEGER DEFAULT 0,
    column_count INTEGER DEFAULT 0,
    column_names JSONB NOT NULL,
    data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'ready',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para datasets
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status);

-- ================================================
-- TABLA: anonymization_configs
-- Almacena configuraciones de anonimización
-- ================================================

CREATE TABLE IF NOT EXISTS anonymization_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    column_mappings JSONB NOT NULL,
    techniques JSONB NOT NULL,
    global_params JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para anonymization_configs
CREATE INDEX IF NOT EXISTS idx_configs_user_id ON anonymization_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_configs_dataset_id ON anonymization_configs(dataset_id);
CREATE INDEX IF NOT EXISTS idx_configs_created_at ON anonymization_configs(created_at DESC);

-- ================================================
-- TABLA: anonymization_results
-- Almacena resultados de procesamiento
-- ================================================

CREATE TABLE IF NOT EXISTS anonymization_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    config_id UUID NOT NULL REFERENCES anonymization_configs(id) ON DELETE CASCADE,
    anonymized_data JSONB NOT NULL,
    metrics JSONB NOT NULL,
    technique_details JSONB,
    status VARCHAR(50) DEFAULT 'completed',
    processing_time_ms INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para anonymization_results
CREATE INDEX IF NOT EXISTS idx_results_user_id ON anonymization_results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_dataset_id ON anonymization_results(dataset_id);
CREATE INDEX IF NOT EXISTS idx_results_config_id ON anonymization_results(config_id);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON anonymization_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_status ON anonymization_results(status);

-- ================================================
-- TABLA: audit_logs
-- Registro de auditoría del sistema
-- ================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);

-- ================================================
-- COMENTARIOS EN LAS TABLAS
-- ================================================

COMMENT ON TABLE datasets IS 'Almacena información sobre datasets subidos por los usuarios';
COMMENT ON TABLE anonymization_configs IS 'Configuraciones de anonimización creadas por los usuarios';
COMMENT ON TABLE anonymization_results IS 'Resultados de procesamiento de anonimización';
COMMENT ON TABLE audit_logs IS 'Registro de auditoría de todas las acciones del sistema';

-- ================================================
-- BASE DE DATOS CREADA EXITOSAMENTE
-- ================================================

-- Verificar tablas creadas
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
