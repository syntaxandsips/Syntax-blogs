-- Create a public bucket for user profile photos and lock it down per-user for writes
insert into storage.buckets (id, name, public)
select 'profile-photos', 'profile-photos', true
where not exists (
  select 1
  from storage.buckets
  where id = 'profile-photos'
);

-- Ensure bucket stays public if it already existed
update storage.buckets
set public = true
where id = 'profile-photos';

DO $$
BEGIN
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

DO $$
BEGIN
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

DO $$
BEGIN
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

DO $$
BEGIN
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
