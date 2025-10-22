-- Improve update_updated_at_column function with explicit schema qualification
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Use clock_timestamp() with explicit schema qualification for better precision
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$function$;

-- Recreate handle_new_user with explicit schema qualification (already secure but adding for consistency)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$function$;