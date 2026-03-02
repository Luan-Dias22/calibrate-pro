
-- Fix overly permissive RLS policies on instruments
DROP POLICY "Authenticated users can insert instruments" ON public.instruments;
DROP POLICY "Authenticated users can update instruments" ON public.instruments;
DROP POLICY "Authenticated users can delete instruments" ON public.instruments;

CREATE POLICY "Admins and technicians can insert instruments"
  ON public.instruments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tecnico'));

CREATE POLICY "Admins and technicians can update instruments"
  ON public.instruments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tecnico'));

CREATE POLICY "Admins can delete instruments"
  ON public.instruments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix calibrations policies
DROP POLICY "Authenticated users can insert calibrations" ON public.calibrations;
DROP POLICY "Authenticated users can update calibrations" ON public.calibrations;

CREATE POLICY "Admins and technicians can insert calibrations"
  ON public.calibrations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tecnico'));

CREATE POLICY "Admins and technicians can update calibrations"
  ON public.calibrations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'tecnico'));

-- Fix audit logs insert policy
DROP POLICY "Authenticated users can insert audit logs" ON public.audit_logs;

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
