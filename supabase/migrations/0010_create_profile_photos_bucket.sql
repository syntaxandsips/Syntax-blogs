-- Create a public bucket for user profile photos and lock it down per-user for writes
-- First, try to create the bucket with the public column (if it exists)
DO $$ BEGIN
    -- Check if the public column exists in storage.buckets
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'storage' 
        AND table_name = 'buckets' 
        AND column_name = 'public'
    ) THEN
        -- Column exists, use the original approach
        INSERT INTO storage.buckets (id, name, public)
        SELECT 'profile-photos', 'profile-photos', true
        WHERE NOT EXISTS (
            SELECT 1
            FROM storage.buckets
            WHERE id = 'profile-photos'
        );
        
        -- Ensure bucket stays public if it already existed
        UPDATE storage.buckets
        SET public = true
        WHERE id = 'profile-photos';
    ELSE
        -- Column doesn't exist, create bucket without it
        INSERT INTO storage.buckets (id, name)
        SELECT 'profile-photos', 'profile-photos'
        WHERE NOT EXISTS (
            SELECT 1
            FROM storage.buckets
            WHERE id = 'profile-photos'
        );
    END IF;
END
 $$;

-- Create RLS policies for public access
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Avatar images are publicly accessible'
    ) THEN
        CREATE POLICY "Avatar images are publicly accessible"
          ON storage.objects
          FOR SELECT
          USING (bucket_id = 'profile-photos');
    END IF;
END
 $$;

-- Create RLS policies for user uploads
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Users can upload their avatar'
    ) THEN
        CREATE POLICY "Users can upload their avatar"
          ON storage.objects
          FOR INSERT
          TO authenticated
          WITH CHECK (
            bucket_id = 'profile-photos'
            AND auth.uid()::text = split_part(name, '/', 1)
          );
    END IF;
END
 $$;

-- Create RLS policies for user updates
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Users can update their avatar'
    ) THEN
        CREATE POLICY "Users can update their avatar"
          ON storage.objects
          FOR UPDATE
          TO authenticated
          USING (
            bucket_id = 'profile-photos'
            AND auth.uid()::text = split_part(name, '/', 1)
          )
          WITH CHECK (
            bucket_id = 'profile-photos'
            AND auth.uid()::text = split_part(name, '/', 1)
          );
    END IF;
END
 $$;

-- Create RLS policies for user deletions
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Users can delete their avatar'
    ) THEN
        CREATE POLICY "Users can delete their avatar"
          ON storage.objects
          FOR DELETE
          TO authenticated
          USING (
            bucket_id = 'profile-photos'
            AND auth.uid()::text = split_part(name, '/', 1)
          );
    END IF;
END
 $$;