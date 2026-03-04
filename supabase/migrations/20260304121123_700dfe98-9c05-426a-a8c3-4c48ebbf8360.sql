
-- Drop all restrictive policies and recreate as permissive

-- instruments
DROP POLICY IF EXISTS "Authenticated users can view instruments" ON public.instruments;
DROP POLICY IF EXISTS "Admins and technicians can insert instruments" ON public.instruments;
DROP POLICY IF EXISTS "Admins and technicians can update instruments" ON public.instruments;
DROP POLICY IF EXISTS "Admins can delete instruments" ON public.instruments;

CREATE POLICY "Authenticated users can view instruments" ON public.instruments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and technicians can insert instruments" ON public.instruments FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tecnico'::app_role));
CREATE POLICY "Admins and technicians can update instruments" ON public.instruments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tecnico'::app_role));
CREATE POLICY "Admins can delete instruments" ON public.instruments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- calibrations
DROP POLICY IF EXISTS "Authenticated users can view calibrations" ON public.calibrations;
DROP POLICY IF EXISTS "Admins and technicians can insert calibrations" ON public.calibrations;
DROP POLICY IF EXISTS "Admins and technicians can update calibrations" ON public.calibrations;

CREATE POLICY "Authenticated users can view calibrations" ON public.calibrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and technicians can insert calibrations" ON public.calibrations FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tecnico'::app_role));
CREATE POLICY "Admins and technicians can update calibrations" ON public.calibrations FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'tecnico'::app_role));

-- audit_logs
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- user_roles
DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
