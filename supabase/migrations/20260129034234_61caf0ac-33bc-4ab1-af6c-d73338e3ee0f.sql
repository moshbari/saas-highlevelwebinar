-- Allow anyone (including anonymous) to read webinar data
-- This enables the public /watch and /replay pages to function
CREATE POLICY "Anyone can view webinars for public pages"
ON public.webinars
FOR SELECT
TO anon, authenticated
USING (true);