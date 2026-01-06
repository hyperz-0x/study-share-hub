-- Create bookmarks table for student dashboard
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add bookmarks"
ON public.bookmarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own bookmarks"
ON public.bookmarks
FOR DELETE
USING (auth.uid() = user_id);

-- Create user_downloads table to track downloads for student dashboard
CREATE TABLE public.user_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- Enable RLS
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_downloads
CREATE POLICY "Users can view their own downloads"
ON public.user_downloads
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can record their downloads"
ON public.user_downloads
FOR INSERT
WITH CHECK (auth.uid() = user_id);