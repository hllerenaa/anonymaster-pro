/*
  # Create Data Anonymization System Tables

  ## Overview
  Creates the complete database schema for a data anonymization system that implements
  k-anonymity, l-diversity, t-closeness, differential privacy, generalization, and suppression
  techniques.

  ## New Tables

  ### 1. `datasets`
  Stores uploaded datasets from users
  - `id` (uuid, primary key) - Unique identifier for each dataset
  - `user_id` (uuid, foreign key to auth.users) - Owner of the dataset
  - `name` (text) - User-defined name for the dataset
  - `original_filename` (text) - Original file name from upload
  - `file_size` (bigint) - Size of the file in bytes
  - `row_count` (integer) - Number of rows in the dataset
  - `column_count` (integer) - Number of columns in the dataset
  - `column_names` (jsonb) - Array of column names
  - `data` (jsonb) - The actual dataset stored as JSON
  - `status` (text) - Status: 'uploaded', 'processing', 'ready', 'error'
  - `created_at` (timestamptz) - When the dataset was uploaded
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `anonymization_configs`
  Stores anonymization configuration settings
  - `id` (uuid, primary key) - Unique identifier for each configuration
  - `user_id` (uuid, foreign key) - Owner of the configuration
  - `dataset_id` (uuid, foreign key) - Associated dataset
  - `name` (text) - User-defined configuration name
  - `column_mappings` (jsonb) - Mapping of columns to data types (quasi-identifier, sensitive, identifier)
  - `techniques` (jsonb) - Selected techniques per column with parameters
  - `global_params` (jsonb) - Global parameters (k value, l value, t value, epsilon, etc.)
  - `created_at` (timestamptz) - When the configuration was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `anonymization_results`
  Stores the results of anonymization processes
  - `id` (uuid, primary key) - Unique identifier for each result
  - `user_id` (uuid, foreign key) - Owner of the result
  - `dataset_id` (uuid, foreign key) - Original dataset
  - `config_id` (uuid, foreign key) - Configuration used
  - `anonymized_data` (jsonb) - The anonymized dataset
  - `metrics` (jsonb) - Calculated metrics (k-anonymity level, information loss, etc.)
  - `technique_details` (jsonb) - Detailed explanation of what each technique did
  - `status` (text) - Status: 'processing', 'completed', 'failed'
  - `error_message` (text) - Error message if failed
  - `processing_time_ms` (integer) - Time taken to process in milliseconds
  - `created_at` (timestamptz) - When the processing started
  - `completed_at` (timestamptz) - When the processing completed

  ### 4. `audit_logs`
  Logs critical operations for security and debugging
  - `id` (uuid, primary key) - Unique identifier for each log entry
  - `user_id` (uuid, foreign key) - User who performed the action
  - `action` (text) - Action performed (upload, configure, anonymize, download, etc.)
  - `resource_type` (text) - Type of resource (dataset, config, result)
  - `resource_id` (uuid) - ID of the affected resource
  - `details` (jsonb) - Additional details about the action
  - `ip_address` (text) - IP address of the user
  - `user_agent` (text) - Browser/client user agent
  - `created_at` (timestamptz) - When the action occurred

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Restrictive policies for SELECT, INSERT, UPDATE, DELETE

  ### Policies
  Each table has four policies:
  1. SELECT - Users can view only their own records
  2. INSERT - Users can create records associated with their user_id
  3. UPDATE - Users can update only their own records
  4. DELETE - Users can delete only their own records

  ## Important Notes
  - All timestamps use `timestamptz` for timezone awareness
  - JSONB is used for flexible storage of datasets, configurations, and metrics
  - Foreign key constraints ensure referential integrity
  - Default values are set for timestamps and UUIDs
  - Indexes are created on user_id and foreign keys for performance
*/

-- Create datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  original_filename text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  row_count integer NOT NULL DEFAULT 0,
  column_count integer NOT NULL DEFAULT 0,
  column_names jsonb NOT NULL DEFAULT '[]'::jsonb,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'uploaded',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status);

-- Enable RLS on datasets
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Policies for datasets
CREATE POLICY "Users can view own datasets"
  ON datasets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own datasets"
  ON datasets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own datasets"
  ON datasets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets"
  ON datasets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create anonymization_configs table
CREATE TABLE IF NOT EXISTS anonymization_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id uuid NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name text NOT NULL,
  column_mappings jsonb NOT NULL DEFAULT '{}'::jsonb,
  techniques jsonb NOT NULL DEFAULT '{}'::jsonb,
  global_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_configs_user_id ON anonymization_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_configs_dataset_id ON anonymization_configs(dataset_id);

-- Enable RLS on anonymization_configs
ALTER TABLE anonymization_configs ENABLE ROW LEVEL SECURITY;

-- Policies for anonymization_configs
CREATE POLICY "Users can view own configs"
  ON anonymization_configs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own configs"
  ON anonymization_configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configs"
  ON anonymization_configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own configs"
  ON anonymization_configs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create anonymization_results table
CREATE TABLE IF NOT EXISTS anonymization_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id uuid NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  config_id uuid NOT NULL REFERENCES anonymization_configs(id) ON DELETE CASCADE,
  anonymized_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  technique_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'processing',
  error_message text,
  processing_time_ms integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_results_user_id ON anonymization_results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_dataset_id ON anonymization_results(dataset_id);
CREATE INDEX IF NOT EXISTS idx_results_config_id ON anonymization_results(config_id);
CREATE INDEX IF NOT EXISTS idx_results_status ON anonymization_results(status);

-- Enable RLS on anonymization_results
ALTER TABLE anonymization_results ENABLE ROW LEVEL SECURITY;

-- Policies for anonymization_results
CREATE POLICY "Users can view own results"
  ON anonymization_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON anonymization_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results"
  ON anonymization_results FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own results"
  ON anonymization_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON audit_logs(created_at);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs (users can only view their own logs)
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);