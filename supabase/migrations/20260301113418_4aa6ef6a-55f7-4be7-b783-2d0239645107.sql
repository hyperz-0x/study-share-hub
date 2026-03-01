
-- ============================================
-- V2 SCHEMA: All new tables and columns
-- ============================================

-- 1. Material Views (student progress tracking)
CREATE TABLE public.material_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.material_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can record their views" ON public.material_views
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own views" ON public.material_views
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_material_views_user ON public.material_views(user_id, viewed_at DESC);
CREATE INDEX idx_material_views_material ON public.material_views(material_id);

-- 2. Add tags and is_draft to materials
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;

-- 3. Rejection templates (admin)
CREATE TABLE public.rejection_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.rejection_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage rejection templates" ON public.rejection_templates
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view rejection templates" ON public.rejection_templates
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Moderation log (admin audit trail)
CREATE TABLE public.moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can insert moderation logs" ON public.moderation_log
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view moderation logs" ON public.moderation_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_moderation_log_material ON public.moderation_log(material_id);
CREATE INDEX idx_moderation_log_admin ON public.moderation_log(admin_id);

-- 5. Material comments (collaboration)
CREATE TABLE public.material_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.material_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.material_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view comments on approved materials" ON public.material_comments
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.materials WHERE id = material_id AND status = 'approved'::material_status)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
CREATE POLICY "Authenticated users can add comments" ON public.material_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.material_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.material_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_comments_material ON public.material_comments(material_id, created_at);

-- 6. Material ratings (1-5 stars)
CREATE TABLE public.material_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(material_id, user_id)
);
ALTER TABLE public.material_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ratings" ON public.material_ratings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can rate materials" ON public.material_ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their rating" ON public.material_ratings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their rating" ON public.material_ratings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. Material reports
CREATE TABLE public.material_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.material_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can report materials" ON public.material_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own reports" ON public.material_reports
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update reports" ON public.material_reports
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.material_comments;
