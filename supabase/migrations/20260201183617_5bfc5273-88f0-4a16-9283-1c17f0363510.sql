-- Phase 1: Multi-Tenant Foundation

-- 1.1 Create license_type enum for tenants
CREATE TYPE public.license_type AS ENUM ('standard', 'white_label');

-- 1.2 Create tenant_role enum for memberships
CREATE TYPE public.tenant_role AS ENUM ('owner', 'admin', 'member');

-- 1.3 Create tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  license_type license_type NOT NULL DEFAULT 'standard',
  parent_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#e53935',
  secondary_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 1.4 Create tenant_memberships table
CREATE TABLE public.tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role tenant_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- 1.5 Add default_tenant_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN default_tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;

-- 1.6 Add tenant_id to webinars (nullable initially for migration)
ALTER TABLE public.webinars
ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 1.7 Add tenant_id to clips (nullable initially for migration)
ALTER TABLE public.clips
ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 1.8 Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

-- 1.9 Create helper function: get_user_tenant_ids (returns all tenant IDs for a user)
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.tenant_memberships
  WHERE user_id = _user_id
$$;

-- 1.10 Create helper function: get_user_default_tenant_id
CREATE OR REPLACE FUNCTION public.get_user_default_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT default_tenant_id FROM public.profiles WHERE user_id = _user_id),
    (SELECT tenant_id FROM public.tenant_memberships WHERE user_id = _user_id LIMIT 1)
  )
$$;

-- 1.11 Create helper function: has_tenant_role (check if user has specific role in tenant)
CREATE OR REPLACE FUNCTION public.has_tenant_role(_user_id UUID, _tenant_id UUID, _role tenant_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND role = _role
  )
$$;

-- 1.12 Create helper function: is_tenant_member (check if user is a member of tenant)
CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
  )
$$;

-- 1.13 RLS Policies for tenants table
CREATE POLICY "Users can view tenants they belong to"
ON public.tenants FOR SELECT
USING (id IN (SELECT public.get_user_tenant_ids(auth.uid())));

CREATE POLICY "Owners can update their tenant"
ON public.tenants FOR UPDATE
USING (public.has_tenant_role(auth.uid(), id, 'owner'));

CREATE POLICY "System can create tenants"
ON public.tenants FOR INSERT
WITH CHECK (true);

-- 1.14 RLS Policies for tenant_memberships table
CREATE POLICY "Users can view memberships in their tenants"
ON public.tenant_memberships FOR SELECT
USING (tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid())));

CREATE POLICY "Owners/Admins can manage memberships"
ON public.tenant_memberships FOR ALL
USING (
  public.has_tenant_role(auth.uid(), tenant_id, 'owner') OR 
  public.has_tenant_role(auth.uid(), tenant_id, 'admin')
);

CREATE POLICY "System can create memberships"
ON public.tenant_memberships FOR INSERT
WITH CHECK (true);

-- 1.15 Update trigger for tenants
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 1.16 Update trigger for tenant_memberships
CREATE TRIGGER update_tenant_memberships_updated_at
BEFORE UPDATE ON public.tenant_memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 1.17 Modify handle_new_user to auto-create tenant and membership
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  trial_days_setting INTEGER;
  new_tenant_id UUID;
BEGIN
  -- Get trial days from settings
  SELECT (setting_value->>'days')::INTEGER INTO trial_days_setting
  FROM public.app_settings
  WHERE setting_key = 'trial_days';
  
  -- Default to 14 days if not set
  IF trial_days_setting IS NULL THEN
    trial_days_setting := 14;
  END IF;

  -- Create tenant for new user
  INSERT INTO public.tenants (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || '''s Workspace')
  RETURNING id INTO new_tenant_id;

  -- Create profile with default tenant
  INSERT INTO public.profiles (user_id, full_name, email, status, trial_ends_at, default_tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'active',
    NOW() + (trial_days_setting || ' days')::INTERVAL,
    new_tenant_id
  );
  
  -- Create user role (default to trial)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'trial');

  -- Create tenant membership as owner
  INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
  VALUES (new_tenant_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$function$;

-- 1.18 Data migration: Create tenants for existing users and link data
DO $$
DECLARE
  r RECORD;
  new_tenant_id UUID;
BEGIN
  -- Loop through existing users who don't have a tenant yet
  FOR r IN 
    SELECT DISTINCT p.user_id, p.full_name, p.email
    FROM public.profiles p
    LEFT JOIN public.tenant_memberships tm ON tm.user_id = p.user_id
    WHERE tm.id IS NULL
  LOOP
    -- Create tenant for this user
    INSERT INTO public.tenants (name)
    VALUES (r.full_name || '''s Workspace')
    RETURNING id INTO new_tenant_id;
    
    -- Create membership as owner
    INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
    VALUES (new_tenant_id, r.user_id, 'owner');
    
    -- Update profile with default tenant
    UPDATE public.profiles
    SET default_tenant_id = new_tenant_id
    WHERE user_id = r.user_id;
    
    -- Migrate webinars to this tenant
    UPDATE public.webinars
    SET tenant_id = new_tenant_id
    WHERE user_id = r.user_id;
    
    -- Migrate clips to this tenant
    UPDATE public.clips
    SET tenant_id = new_tenant_id
    WHERE user_id = r.user_id;
  END LOOP;
END $$;

-- 1.19 Update webinars RLS to include tenant-based access
DROP POLICY IF EXISTS "Users can view their own webinars" ON public.webinars;
DROP POLICY IF EXISTS "Users can update their own webinars" ON public.webinars;
DROP POLICY IF EXISTS "Users can delete their own webinars" ON public.webinars;
DROP POLICY IF EXISTS "Users can create their own webinars" ON public.webinars;

CREATE POLICY "Users can view tenant webinars"
ON public.webinars FOR SELECT
USING (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
  OR auth.uid() = user_id  -- Backwards compatibility
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create tenant webinars"
ON public.webinars FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
  OR auth.uid() = user_id
);

CREATE POLICY "Users can update tenant webinars"
ON public.webinars FOR UPDATE
USING (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
  OR auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can delete tenant webinars"
ON public.webinars FOR DELETE
USING (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
  OR auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 1.20 Update clips RLS to include tenant-based access
DROP POLICY IF EXISTS "Users can view their own clips" ON public.clips;
DROP POLICY IF EXISTS "Users can update their own clips" ON public.clips;
DROP POLICY IF EXISTS "Users can delete their own clips" ON public.clips;
DROP POLICY IF EXISTS "Users can create their own clips" ON public.clips;

CREATE POLICY "Users can view tenant clips"
ON public.clips FOR SELECT
USING (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
  OR auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create tenant clips"
ON public.clips FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
  OR auth.uid() = user_id
);

CREATE POLICY "Users can update tenant clips"
ON public.clips FOR UPDATE
USING (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
  OR auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can delete tenant clips"
ON public.clips FOR DELETE
USING (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
  OR auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
);