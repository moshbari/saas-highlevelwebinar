CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webinar_id uuid NOT NULL,
    lead_id uuid,
    user_name text NOT NULL,
    user_email text NOT NULL,
    user_message text NOT NULL,
    ai_response text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    session_date date DEFAULT CURRENT_DATE NOT NULL
);


--
-- Name: cta_clicks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cta_clicks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webinar_id uuid NOT NULL,
    lead_id uuid,
    clicked_at timestamp with time zone DEFAULT now() NOT NULL,
    minutes_watched integer DEFAULT 0 NOT NULL,
    button_text text,
    button_url text
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    webinar_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    captured_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text
);


--
-- Name: webinar_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webinar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    webinar_id text NOT NULL,
    webinar_name text,
    user_name text,
    user_email text NOT NULL,
    event_type text NOT NULL,
    watch_percent integer,
    watch_minutes numeric(10,2),
    cta_url text,
    chat_message text,
    session_id text,
    device_type text
);


--
-- Name: webinars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webinars (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    webinar_name text NOT NULL,
    header_title text DEFAULT 'Exclusive Training Session'::text NOT NULL,
    logo_text text DEFAULT 'W'::text NOT NULL,
    video_url text DEFAULT ''::text NOT NULL,
    duration_minutes integer DEFAULT 60 NOT NULL,
    start_hour integer DEFAULT 12 NOT NULL,
    start_minute integer DEFAULT 0 NOT NULL,
    timezone text DEFAULT 'America/New_York'::text NOT NULL,
    min_viewers integer DEFAULT 150 NOT NULL,
    max_viewers integer DEFAULT 300 NOT NULL,
    bot_name text DEFAULT 'Support Team'::text NOT NULL,
    bot_avatar text DEFAULT 'AI'::text NOT NULL,
    webhook_url text DEFAULT ''::text NOT NULL,
    typing_delay_min integer DEFAULT 3 NOT NULL,
    typing_delay_max integer DEFAULT 5 NOT NULL,
    error_message text DEFAULT 'Let''s keep watching the webinar! I''ll answer all questions at the end. 😊'::text NOT NULL,
    enable_lead_capture boolean DEFAULT true NOT NULL,
    require_name boolean DEFAULT true NOT NULL,
    require_email boolean DEFAULT true NOT NULL,
    welcome_message text DEFAULT 'Hi {name}! 👋 Ask me anything about the training.'::text NOT NULL,
    lead_webhook_url text DEFAULT ''::text NOT NULL,
    primary_color text DEFAULT '#e53935'::text NOT NULL,
    background_color text DEFAULT '#0a0a0f'::text NOT NULL,
    chat_background text DEFAULT '#12121a'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    enable_cta boolean DEFAULT false NOT NULL,
    cta_show_after_minutes integer DEFAULT 45 NOT NULL,
    cta_headline text DEFAULT 'Ready to Transform Your Life?'::text NOT NULL,
    cta_subheadline text DEFAULT 'Join thousands of successful students'::text NOT NULL,
    cta_button_text text DEFAULT 'Get Instant Access →'::text NOT NULL,
    cta_button_url text DEFAULT ''::text NOT NULL,
    cta_button_color text DEFAULT '#e53935'::text NOT NULL,
    cta_style text DEFAULT 'banner'::text NOT NULL,
    cta_show_urgency boolean DEFAULT false NOT NULL,
    cta_urgency_text text DEFAULT '⚡ Limited spots available!'::text NOT NULL,
    enable_tracking boolean DEFAULT true NOT NULL,
    tracking_webhook_url text DEFAULT 'https://moshbari.cloud/webhook/webinar-tracking'::text NOT NULL
);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: cta_clicks cta_clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cta_clicks
    ADD CONSTRAINT cta_clicks_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: webinar_events webinar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webinar_events
    ADD CONSTRAINT webinar_events_pkey PRIMARY KEY (id);


--
-- Name: webinars webinars_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webinars
    ADD CONSTRAINT webinars_pkey PRIMARY KEY (id);


--
-- Name: idx_webinar_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webinar_events_created_at ON public.webinar_events USING btree (created_at);


--
-- Name: idx_webinar_events_event_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webinar_events_event_type ON public.webinar_events USING btree (event_type);


--
-- Name: idx_webinar_events_user_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webinar_events_user_email ON public.webinar_events USING btree (user_email);


--
-- Name: idx_webinar_events_webinar_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_webinar_events_webinar_id ON public.webinar_events USING btree (webinar_id);


--
-- Name: webinars update_webinars_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_webinars_updated_at BEFORE UPDATE ON public.webinars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chat_messages chat_messages_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_webinar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_webinar_id_fkey FOREIGN KEY (webinar_id) REFERENCES public.webinars(id) ON DELETE CASCADE;


--
-- Name: cta_clicks cta_clicks_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cta_clicks
    ADD CONSTRAINT cta_clicks_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;


--
-- Name: cta_clicks cta_clicks_webinar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cta_clicks
    ADD CONSTRAINT cta_clicks_webinar_id_fkey FOREIGN KEY (webinar_id) REFERENCES public.webinars(id) ON DELETE CASCADE;


--
-- Name: leads leads_webinar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_webinar_id_fkey FOREIGN KEY (webinar_id) REFERENCES public.webinars(id) ON DELETE CASCADE;


--
-- Name: webinars webinars_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webinars
    ADD CONSTRAINT webinars_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: chat_messages Anyone can create chat_messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);


--
-- Name: cta_clicks Anyone can create cta_clicks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create cta_clicks" ON public.cta_clicks FOR INSERT WITH CHECK (true);


--
-- Name: leads Anyone can create leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create leads" ON public.leads FOR INSERT WITH CHECK (true);


--
-- Name: webinars Anyone can create webinars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create webinars" ON public.webinars FOR INSERT WITH CHECK (true);


--
-- Name: chat_messages Anyone can delete chat_messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete chat_messages" ON public.chat_messages FOR DELETE USING (true);


--
-- Name: leads Anyone can delete leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete leads" ON public.leads FOR DELETE USING (true);


--
-- Name: webinar_events Anyone can delete webinar_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete webinar_events" ON public.webinar_events FOR DELETE USING (true);


--
-- Name: webinars Anyone can delete webinars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete webinars" ON public.webinars FOR DELETE USING (true);


--
-- Name: webinar_events Anyone can insert webinar_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert webinar_events" ON public.webinar_events FOR INSERT WITH CHECK (true);


--
-- Name: webinar_events Anyone can update webinar_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update webinar_events" ON public.webinar_events FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: webinars Anyone can update webinars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update webinars" ON public.webinars FOR UPDATE USING (true);


--
-- Name: chat_messages Anyone can view chat_messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view chat_messages" ON public.chat_messages FOR SELECT USING (true);


--
-- Name: cta_clicks Anyone can view cta_clicks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view cta_clicks" ON public.cta_clicks FOR SELECT USING (true);


--
-- Name: leads Anyone can view leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view leads" ON public.leads FOR SELECT USING (true);


--
-- Name: webinar_events Anyone can view webinar_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view webinar_events" ON public.webinar_events FOR SELECT USING (true);


--
-- Name: webinars Anyone can view webinars; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view webinars" ON public.webinars FOR SELECT USING (true);


--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: cta_clicks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: webinar_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webinar_events ENABLE ROW LEVEL SECURITY;

--
-- Name: webinars; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;