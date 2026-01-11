/*
  # Update RLS Policies for Public Access

  ## Changes
  - Drop existing restrictive policies
  - Create new permissive policies that allow public access
  - All users can now read, create, update, and delete all records
  - System uses a shared "public-user" ID for all operations

  ## Security Note
  This migration makes the system completely public. All data is shared
  among all users without authentication.
*/

-- Drop existing policies for datasets
DROP POLICY IF EXISTS "Users can view own datasets" ON datasets;
DROP POLICY IF EXISTS "Users can insert own datasets" ON datasets;
DROP POLICY IF EXISTS "Users can update own datasets" ON datasets;
DROP POLICY IF EXISTS "Users can delete own datasets" ON datasets;

-- Create public access policies for datasets
CREATE POLICY "Public can view all datasets"
  ON datasets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert datasets"
  ON datasets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update datasets"
  ON datasets FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete datasets"
  ON datasets FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop existing policies for anonymization_configs
DROP POLICY IF EXISTS "Users can view own configs" ON anonymization_configs;
DROP POLICY IF EXISTS "Users can insert own configs" ON anonymization_configs;
DROP POLICY IF EXISTS "Users can update own configs" ON anonymization_configs;
DROP POLICY IF EXISTS "Users can delete own configs" ON anonymization_configs;

-- Create public access policies for anonymization_configs
CREATE POLICY "Public can view all configs"
  ON anonymization_configs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert configs"
  ON anonymization_configs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update configs"
  ON anonymization_configs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete configs"
  ON anonymization_configs FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop existing policies for anonymization_results
DROP POLICY IF EXISTS "Users can view own results" ON anonymization_results;
DROP POLICY IF EXISTS "Users can insert own results" ON anonymization_results;
DROP POLICY IF EXISTS "Users can update own results" ON anonymization_results;
DROP POLICY IF EXISTS "Users can delete own results" ON anonymization_results;

-- Create public access policies for anonymization_results
CREATE POLICY "Public can view all results"
  ON anonymization_results FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert results"
  ON anonymization_results FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update results"
  ON anonymization_results FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete results"
  ON anonymization_results FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop existing policies for audit_logs
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON audit_logs;

-- Create public access policies for audit_logs
CREATE POLICY "Public can view all logs"
  ON audit_logs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert logs"
  ON audit_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
