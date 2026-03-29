-- Migration: Add is_beta_tester column to profiles table
-- Created: 2026-03-29

-- Add the is_beta_tester column (default: false)
ALTER TABLE public.profiles
ADD COLUMN is_beta_tester boolean NOT NULL DEFAULT false;

-- Create index for efficient queries
CREATE INDEX idx_profiles_is_beta_tester ON public.profiles(is_beta_tester) WHERE is_beta_tester = true;

-- Comment for documentation
COMMENT ON COLUMN public.profiles.is_beta_tester IS 'Flag indicating if user is part of the beta tester program with unlimited access';
