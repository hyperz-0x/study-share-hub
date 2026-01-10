-- Create function to update materials count when material status changes
CREATE OR REPLACE FUNCTION public.update_subject_materials_count()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserting or updating, update the new subject's count
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE subjects 
    SET materials_count = (
      SELECT COUNT(*) FROM materials 
      WHERE materials.subject_id = NEW.subject_id 
      AND materials.status = 'approved'
    )
    WHERE id = NEW.subject_id;
  END IF;
  
  -- If updating and subject changed, also update old subject's count
  IF TG_OP = 'UPDATE' AND OLD.subject_id != NEW.subject_id THEN
    UPDATE subjects 
    SET materials_count = (
      SELECT COUNT(*) FROM materials 
      WHERE materials.subject_id = OLD.subject_id 
      AND materials.status = 'approved'
    )
    WHERE id = OLD.subject_id;
  END IF;
  
  -- If deleting, update the old subject's count
  IF TG_OP = 'DELETE' THEN
    UPDATE subjects 
    SET materials_count = (
      SELECT COUNT(*) FROM materials 
      WHERE materials.subject_id = OLD.subject_id 
      AND materials.status = 'approved'
    )
    WHERE id = OLD.subject_id;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on materials table
DROP TRIGGER IF EXISTS update_materials_count_trigger ON materials;
CREATE TRIGGER update_materials_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON materials
FOR EACH ROW
EXECUTE FUNCTION public.update_subject_materials_count();