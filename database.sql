-- ----------------------------
-- 1. Create Profiles Table
-- Stores public user data. This table is linked to the auth.users table.
-- Using IF NOT EXISTS to prevent errors on default Supabase projects.
-- ----------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  updated_at timestamptz,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then recreate them to be safe.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ----------------------------
-- 2. Function & Trigger to Create Profiles on Signup
-- This automatically creates a profile for a new user when they sign up.
-- ----------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists, then recreate it.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------
-- 3. Create Storage Bucket for Vehicle Images
-- ----------------------------
INSERT INTO storage.buckets (id, name, public)
  VALUES ('vehicle_images', 'vehicle_images', false)
  ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
DROP POLICY IF EXISTS "Authenticated users can upload images." ON storage.objects;
CREATE POLICY "Authenticated users can upload images." ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle_images');

DROP POLICY IF EXISTS "Users can view their own images." ON storage.objects;
CREATE POLICY "Users can view their own images." ON storage.objects FOR SELECT TO authenticated USING (auth.uid() = owner);

DROP POLICY IF EXISTS "Users can delete their own images." ON storage.objects;
CREATE POLICY "Users can delete their own images." ON storage.objects FOR DELETE TO authenticated USING (auth.uid() = owner);

-- ----------------------------
-- 4. Create Vehicle Identifications Table
-- Stores a record for each image a user uploads for vehicle identification.
-- ----------------------------
CREATE TABLE IF NOT EXISTS public.vehicle_identifications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  image_storage_path text,
  ai_raw_response jsonb,
  identified_make text,
  identified_model text,
  identified_year_start integer,
  identified_year_end integer,
  identified_variant text,
  ai_confidence_score integer,
  user_confirmed boolean DEFAULT false,
  confirmed_at timestamptz
);

-- Set up RLS for vehicle_identifications
ALTER TABLE public.vehicle_identifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own identifications" ON public.vehicle_identifications;
CREATE POLICY "Users can view own identifications" ON public.vehicle_identifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create identifications" ON public.vehicle_identifications;
CREATE POLICY "Users can create identifications" ON public.vehicle_identifications FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own identifications" ON public.vehicle_identifications;
CREATE POLICY "Users can update own identifications" ON public.vehicle_identifications FOR UPDATE USING (auth.uid() = user_id);

-- ----------------------------
-- 5. Create Parts Catalog Table
-- Master table for all spare parts.
-- ----------------------------
CREATE TABLE IF NOT EXISTS public.parts_catalog (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now() NOT NULL,
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  description text,
  category text,
  image_url text
);
-- Set up RLS for parts_catalog
ALTER TABLE public.parts_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parts catalog is viewable by everyone." ON public.parts_catalog;
CREATE POLICY "Parts catalog is viewable by everyone." ON public.parts_catalog FOR SELECT USING (true);


-- ----------------------------
-- 6. Create Vehicle Compatibility Table
-- Junction table to link parts to specific vehicle models and years.
-- ----------------------------
CREATE TABLE IF NOT EXISTS public.vehicle_compatibility (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  part_id bigint NOT NULL REFERENCES public.parts_catalog ON DELETE CASCADE,
  vehicle_make text NOT NULL,
  vehicle_model text NOT NULL,
  year_start integer NOT NULL,
  year_end integer NOT NULL
);
-- Set up RLS for vehicle_compatibility
ALTER TABLE public.vehicle_compatibility ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Compatibility info is viewable by everyone." ON public.vehicle_compatibility;
CREATE POLICY "Compatibility info is viewable by everyone." ON public.vehicle_compatibility FOR SELECT USING (true);

-- ----------------------------
-- 7. Database Function to Get Parts for a Vehicle
-- Simplifies querying for parts based on a vehicle's make, model, and year range.
-- ----------------------------
-- Drop the old, obsolete version of the function with 3 arguments if it exists
DROP FUNCTION IF EXISTS public.get_parts_for_vehicle(text, text, integer);

-- FIX: Explicitly drop the 4-argument function to handle signature changes during development.
-- This prevents the "cannot change return type" error when running the script multiple times.
DROP FUNCTION IF EXISTS public.get_parts_for_vehicle(text, text, integer, integer);

CREATE OR REPLACE FUNCTION get_parts_for_vehicle(
    v_make text,
    v_model text,
    v_year_start integer,
    v_year_end integer
)
RETURNS TABLE(id bigint, created_at timestamptz, name text, sku text, description text, category text, image_url text) AS $$
BEGIN
    RETURN QUERY
    SELECT pc.id, pc.created_at, pc.name, pc.sku, pc.description, pc.category, pc.image_url
    FROM public.parts_catalog pc
    JOIN public.vehicle_compatibility vc ON pc.id = vc.part_id
    WHERE
        (vc.vehicle_make ILIKE '%' || v_make || '%' OR v_make ILIKE '%' || vc.vehicle_make || '%')
        AND (vc.vehicle_model ILIKE '%' || v_model || '%' OR v_model ILIKE '%' || vc.vehicle_model || '%')
        AND v_year_start <= vc.year_end -- Check for range overlap: identified start <= compatibility end
        AND vc.year_start <= v_year_end; -- AND compatibility start <= identified end
END;
$$ LANGUAGE plpgsql;

-- Grant execution permission to authenticated, anon, and service_role users
GRANT EXECUTE ON FUNCTION public.get_parts_for_vehicle(text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_parts_for_vehicle(text, text, integer, integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_parts_for_vehicle(text, text, integer, integer) TO service_role;


-- ----------------------------
-- 8. Add Sample Data
-- ----------------------------
-- Clear any old sample data first
TRUNCATE public.vehicle_compatibility, public.parts_catalog RESTART IDENTITY;

-- Add a comprehensive list of generic motorcycle/scooter parts
INSERT INTO public.parts_catalog(name, sku, description, category, image_url) VALUES
('Oil Filter', 'OF-MC-STD-01', 'Standard oil filter for small displacement engines. Helps remove harmful contaminants from engine oil.', 'Engine', 'https://placehold.co/600x400.webp?text=Oil+Filter'),
('Air Filter', 'AF-MC-STD-01', 'High-flow paper element air filter. Improves airflow and protects your engine from dust and debris.', 'Engine', 'https://placehold.co/600x400.webp?text=Air+Filter'),
('Brake Pads (Front, Disc)', 'BP-FD-STD-01', 'Organic compound front disc brake pads. Provides reliable stopping power for daily commuting.', 'Brakes', 'https://placehold.co/600x400.webp?text=Brake+Pads'),
('Brake Shoes (Rear, Drum)', 'BS-RD-STD-01', 'Standard rear drum brake shoes. Designed for durability and consistent performance.', 'Brakes', 'https://placehold.co/600x400.webp?text=Brake+Shoes'),
('Clutch Plate Set', 'CP-SET-STD-01', 'Complete set of clutch plates and friction discs for a smooth gear change.', 'Transmission', 'https://placehold.co/600x400.webp?text=Clutch+Plates'),
('Clutch Cable', 'CC-CBL-STD-01', 'Durable, high-quality clutch cable with protective sheathing.', 'Controls', 'https://placehold.co/600x400.webp?text=Clutch+Cable'),
('Spark Plug', 'SP-NGK-CR7HSA', 'NGK standard spark plug. Ensures reliable ignition and efficient combustion.', 'Engine', 'https://placehold.co/600x400.webp?text=Spark+Plug'),
('Headlight Bulb (Halogen)', 'HL-H4-12V', '12V 35/35W Halogen headlight bulb for clear visibility.', 'Electrical', 'https://placehold.co/600x400.webp?text=Headlight'),
('Chain & Sprocket Set', 'CS-SET-428-120', 'Standard 428 pitch chain and sprocket kit. Includes front and rear sprockets and a 120-link chain.', 'Drivetrain', 'https://placehold.co/600x400.webp?text=Chain+Set'),
('Front Fork Oil Seal Kit', 'FS-KIT-31MM', 'Set of two 31mm front fork oil seals to prevent leaks and ensure smooth suspension travel.', 'Suspension', 'https://placehold.co/600x400.webp?text=Fork+Seals'),
('Rear Shock Absorber (Dual)', 'SA-RD-STD-01', 'Set of two standard hydraulic rear shock absorbers for a comfortable ride.', 'Suspension', 'https://placehold.co/600x400.webp?text=Shocks'),
('Brake Lever (Right)', 'BL-R-STD-01', 'Standard aluminum right-hand brake lever.', 'Controls', 'https://placehold.co/600x400.webp?text=Brake+Lever')
ON CONFLICT (sku) DO NOTHING;

-- Create a temporary function to link parts to a vehicle model
CREATE OR REPLACE PROCEDURE link_parts_to_vehicle(
    v_make text,
    v_model text,
    v_year_start integer,
    v_year_end integer,
    part_skus text[]
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.vehicle_compatibility(part_id, vehicle_make, vehicle_model, year_start, year_end)
    SELECT id, v_make, v_model, v_year_start, v_year_end
    FROM public.parts_catalog
    WHERE sku = ANY(part_skus)
    ON CONFLICT DO NOTHING;
END;
$$;

-- Common parts SKUs
DO $$
DECLARE
    common_motorcycle_parts text[] := ARRAY['OF-MC-STD-01', 'AF-MC-STD-01', 'BP-FD-STD-01', 'BS-RD-STD-01', 'CP-SET-STD-01', 'CC-CBL-STD-01', 'SP-NGK-CR7HSA', 'HL-H4-12V', 'CS-SET-428-120', 'FS-KIT-31MM', 'SA-RD-STD-01', 'BL-R-STD-01'];
    common_scooter_parts text[] := ARRAY['OF-MC-STD-01', 'AF-MC-STD-01', 'BP-FD-STD-01', 'BS-RD-STD-01', 'SP-NGK-CR7HSA', 'HL-H4-12V'];
BEGIN
    -- 🏍️ Link parts for Honda models
    CALL link_parts_to_vehicle('Honda', 'Shine', 2018, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('Honda', 'Activa', 2018, 2024, common_scooter_parts);
    CALL link_parts_to_vehicle('Honda', 'Dio', 2018, 2024, common_scooter_parts);
    CALL link_parts_to_vehicle('Honda', 'SP 125', 2019, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('Honda', 'CB Hornet', 2018, 2024, common_motorcycle_parts);

    -- 🏍️ Link parts for Bajaj models
    CALL link_parts_to_vehicle('Bajaj', 'Pulsar 150', 2018, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('Bajaj', 'Pulsar NS200', 2018, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('Bajaj', 'Pulsar N250', 2021, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('Bajaj', 'CT 100', 2018, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('Bajaj', 'Platina', 2018, 2024, common_motorcycle_parts);

    -- 🏍️ Link parts for TVS models
    CALL link_parts_to_vehicle('TVS', 'Raider 125', 2021, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('TVS', 'Apache RTR 160', 2018, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('TVS', 'Ronin', 2022, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('TVS', 'Ntorq 125', 2018, 2024, common_scooter_parts);
    CALL link_parts_to_vehicle('TVS', 'Star City+', 2018, 2024, common_motorcycle_parts);

    -- 🏍️ Link parts for Hero models
    CALL link_parts_to_vehicle('Hero', 'Splendor Plus', 2018, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('Hero', 'HF Deluxe', 2018, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('Hero', 'Passion Pro', 2018, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('Hero', 'Xtreme 160R', 2020, 2024, common_motorcycle_parts);
    CALL link_parts_to_vehicle('Hero', 'Maestro Edge', 2018, 2024, common_scooter_parts);
END $$;

-- Drop the temporary function
DROP PROCEDURE IF EXISTS link_parts_to_vehicle(text, text, integer, integer, text[]);


-- Add comments for clarity
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';
COMMENT ON TABLE public.vehicle_identifications IS 'Logs each time a user submits an image for vehicle identification and stores the result.';
COMMENT ON TABLE public.parts_catalog IS 'Master catalog of all available spare parts.';
COMMENT ON TABLE public.vehicle_compatibility IS 'Links parts from the catalog to the specific vehicles they fit.';
COMMENT ON FUNCTION public.get_parts_for_vehicle(text, text, integer, integer) IS 'Returns all compatible parts for a given vehicle make, model, and year range.';

-- ----------------------------
-- 9. Create Saved Parts Table
-- Stores parts saved by users for later.
-- ----------------------------
CREATE TABLE IF NOT EXISTS public.saved_parts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  part_id bigint NOT NULL REFERENCES public.parts_catalog ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, part_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.saved_parts ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist
DROP POLICY IF EXISTS "Users can manage their own saved parts." ON public.saved_parts;

-- Create policy
CREATE POLICY "Users can manage their own saved parts." ON public.saved_parts
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.saved_parts IS 'Stores parts saved by users for later reference.';
