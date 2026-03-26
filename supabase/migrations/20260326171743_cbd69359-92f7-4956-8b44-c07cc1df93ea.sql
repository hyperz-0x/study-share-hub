
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  room_id text NOT NULL UNIQUE,
  host_id uuid NOT NULL,
  subject_id uuid REFERENCES public.subjects(id),
  scheduled_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view meetings"
  ON public.meetings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Teachers and admins can create meetings"
  ON public.meetings FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = host_id AND (
      has_role(auth.uid(), 'teacher'::app_role) OR
      has_role(auth.uid(), 'admin'::app_role)
    )
  );

CREATE POLICY "Hosts can update their meetings"
  ON public.meetings FOR UPDATE TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts and admins can delete meetings"
  ON public.meetings FOR DELETE TO authenticated
  USING (auth.uid() = host_id OR has_role(auth.uid(), 'admin'::app_role));
