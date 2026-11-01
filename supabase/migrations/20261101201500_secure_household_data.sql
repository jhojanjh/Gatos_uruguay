-- Vincula cuentas autenticadas con el hogar compartido.
CREATE TABLE IF NOT EXISTS public.household_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id text NOT NULL DEFAULT 'hogar' CHECK (household_id = 'hogar'),
  member_id text NOT NULL UNIQUE CHECK (member_id IN ('jhojan', 'luisa')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.household_members FROM anon, authenticated;
GRANT SELECT ON TABLE public.household_members TO authenticated;

DROP POLICY IF EXISTS "members_read_own_membership" ON public.household_members;
CREATE POLICY "members_read_own_membership"
  ON public.household_members
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Retira las políticas anteriores que permitían acceso anónimo o general.
DROP POLICY IF EXISTS "anon_select_household" ON public.household_data;
DROP POLICY IF EXISTS "anon_insert_household" ON public.household_data;
DROP POLICY IF EXISTS "anon_update_household" ON public.household_data;
DROP POLICY IF EXISTS "members_select_household" ON public.household_data;
DROP POLICY IF EXISTS "members_insert_household" ON public.household_data;
DROP POLICY IF EXISTS "members_update_household" ON public.household_data;

REVOKE ALL ON TABLE public.household_data FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.household_data TO authenticated;

CREATE POLICY "members_select_household"
  ON public.household_data
  FOR SELECT
  TO authenticated
  USING (
    id = 'hogar'
    AND EXISTS (
      SELECT 1
      FROM public.household_members AS member
      WHERE member.household_id = household_data.id
        AND member.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "members_insert_household"
  ON public.household_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = 'hogar'
    AND EXISTS (
      SELECT 1
      FROM public.household_members AS member
      WHERE member.household_id = household_data.id
        AND member.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "members_update_household"
  ON public.household_data
  FOR UPDATE
  TO authenticated
  USING (
    id = 'hogar'
    AND EXISTS (
      SELECT 1
      FROM public.household_members AS member
      WHERE member.household_id = household_data.id
        AND member.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    id = 'hogar'
    AND EXISTS (
      SELECT 1
      FROM public.household_members AS member
      WHERE member.household_id = household_data.id
        AND member.user_id = (SELECT auth.uid())
    )
  );
