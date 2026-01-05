-- Create table for allowed teachers with their subject assignments
CREATE TABLE public.allowed_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to link teachers to subjects
CREATE TABLE public.teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.allowed_teachers(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, subject_id)
);

-- Create table for allowed admins
CREATE TABLE public.allowed_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.allowed_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_admins ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read allowed teachers/admins (for validation during signup)
CREATE POLICY "Anyone can view allowed teachers" ON public.allowed_teachers FOR SELECT USING (true);
CREATE POLICY "Anyone can view allowed admins" ON public.allowed_admins FOR SELECT USING (true);
CREATE POLICY "Anyone can view teacher subjects" ON public.teacher_subjects FOR SELECT USING (true);

-- Only admins can manage these tables
CREATE POLICY "Admins can manage allowed teachers" ON public.allowed_teachers FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage allowed admins" ON public.allowed_admins FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage teacher subjects" ON public.teacher_subjects FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Insert allowed teachers
INSERT INTO public.allowed_teachers (full_name) VALUES
('Shruti Dubey'),
('Ajay Kamble'),
('Pavan Kavale');

-- Insert allowed admin (you can add your admin name here)
INSERT INTO public.allowed_admins (full_name) VALUES
('Admin');

-- Link teachers to subjects
INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT at.id, s.id FROM public.allowed_teachers at, public.subjects s
WHERE at.full_name = 'Shruti Dubey' AND s.slug = 'object-oriented-programming';

INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT at.id, s.id FROM public.allowed_teachers at, public.subjects s
WHERE at.full_name = 'Ajay Kamble' AND s.slug = 'design-and-analysis-of-algorithm';

INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT at.id, s.id FROM public.allowed_teachers at, public.subjects s
WHERE at.full_name = 'Ajay Kamble' AND s.slug = 'python-programming';

INSERT INTO public.teacher_subjects (teacher_id, subject_id)
SELECT at.id, s.id FROM public.allowed_teachers at, public.subjects s
WHERE at.full_name = 'Pavan Kavale' AND s.slug = 'web-technology';