
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view webinars for public pages" ON public.webinars;

-- Re-create it for anon only (public watch/replay pages)
CREATE POLICY "Anon can view webinars for public pages"
ON public.webinars
FOR SELECT
TO anon
USING (true);
