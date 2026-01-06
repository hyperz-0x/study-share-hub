-- Create allowed_students table for college student database
CREATE TABLE public.allowed_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.allowed_students ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view allowed students"
ON public.allowed_students
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage allowed students"
ON public.allowed_students
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert the 8 college students
INSERT INTO public.allowed_students (full_name) VALUES
  ('Ranjeet Yadav'),
  ('Shravan Mandlik'),
  ('Vivek Vishwakarma'),
  ('Vedant Tiwari'),
  ('Abhishek Gupta'),
  ('Rajan Yadav'),
  ('Shubham Vishwakarma'),
  ('Vishal Gautam');