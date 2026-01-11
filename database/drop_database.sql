-- ================================================
-- SCRIPT PARA ELIMINAR TODAS LAS TABLAS
-- Sistema de Anonimización de Datos
-- ⚠️ CUIDADO: Esto eliminará TODOS los datos
-- ================================================

-- Eliminar tablas en orden (respetando foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS anonymization_results CASCADE;
DROP TABLE IF EXISTS anonymization_configs CASCADE;
DROP TABLE IF EXISTS datasets CASCADE;

-- Verificar que las tablas fueron eliminadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- Si no hay resultados, todas las tablas fueron eliminadas exitosamente
