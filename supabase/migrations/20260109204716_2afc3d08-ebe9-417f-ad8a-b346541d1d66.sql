-- Drop existing permissive policies on webinars table
DROP POLICY IF EXISTS "Anyone can create webinars" ON public.webinars;
DROP POLICY IF EXISTS "Anyone can delete webinars" ON public.webinars;
DROP POLICY IF EXISTS "Anyone can update webinars" ON public.webinars;
DROP POLICY IF EXISTS "Anyone can view webinars" ON public.webinars;

-- Create new RLS policies for webinars
-- Users can view their own webinars, admins can view all
CREATE POLICY "Users can view their own webinars"
ON public.webinars
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- Users can create webinars (user_id will be set to their own id)
CREATE POLICY "Users can create their own webinars"
ON public.webinars
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own webinars, admins can update all
CREATE POLICY "Users can update their own webinars"
ON public.webinars
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- Users can delete their own webinars, admins can delete all
CREATE POLICY "Users can delete their own webinars"
ON public.webinars
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- Also update clips table to be user-scoped
DROP POLICY IF EXISTS "Anyone can create clips" ON public.clips;
DROP POLICY IF EXISTS "Anyone can delete clips" ON public.clips;
DROP POLICY IF EXISTS "Anyone can update clips" ON public.clips;
DROP POLICY IF EXISTS "Anyone can view clips" ON public.clips;

CREATE POLICY "Users can view their own clips"
ON public.clips
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can create their own clips"
ON public.clips
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips"
ON public.clips
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete their own clips"
ON public.clips
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);