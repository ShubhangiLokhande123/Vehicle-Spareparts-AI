-- SQL script to delete unused tables
-- Run this script in your Supabase SQL Editor to remove tables not used by the current application.

-- Drop tables that depend on others first (to avoid foreign key constraint errors)
DROP TABLE IF EXISTS public.part_results;
DROP TABLE IF EXISTS public.identification_requests;
DROP TABLE IF EXISTS public.variant_parts;

-- Drop the main tables for the unused schema
DROP TABLE IF EXISTS public.parts;
DROP TABLE IF EXISTS public.variants;
DROP TABLE IF EXISTS public.models;
DROP TABLE IF EXISTS public.brands;
