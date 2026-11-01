/*
# Create household data table

1. New Tables
- `household_data`
  - `id` (text, primary key): identifier of the household document, always 'hogar'
  - `data` (jsonb, not null): the full household state (expenses, categories, products, purchases, settings)
  - `updated_at` (timestamptz): last time the document was saved

2. Security
- Row level security is enabled.
- The app has no sign-in, so the anon and authenticated roles can read and write.
- Policies only allow the single row with id 'hogar', so no other rows can be created.
- DELETE is not granted; the app never removes the household row.

3. Notes
- The app saves the whole document with an upsert on each change.
- Expense photos are not stored here; they remain on the device.
*/

CREATE TABLE IF NOT EXISTS household_data (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE household_data ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON household_data TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_household" ON household_data;
CREATE POLICY "anon_select_household" ON household_data FOR SELECT
  TO anon, authenticated USING (id = 'hogar');

DROP POLICY IF EXISTS "anon_insert_household" ON household_data;
CREATE POLICY "anon_insert_household" ON household_data FOR INSERT
  TO anon, authenticated WITH CHECK (id = 'hogar');

DROP POLICY IF EXISTS "anon_update_household" ON household_data;
CREATE POLICY "anon_update_household" ON household_data FOR UPDATE
  TO anon, authenticated USING (id = 'hogar') WITH CHECK (id = 'hogar');
