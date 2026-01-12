-- Demo seed for Maximus Engagimus
-- Run this in Supabase SQL Editor to create a demo org, link the current auth user, and add a client.
-- Replace the USER_ID below with your auth user's id if different.

-- NOTE: This is safe to run multiple times (uses UPSERT patterns where appropriate)

BEGIN;

-- Create or get demo organization
WITH org AS (
  INSERT INTO organizations (name, slug)
  VALUES ('Demo Organization', 'demo-organization')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
)
-- Create or update user profile for the existing auth user
INSERT INTO users (id, organization_id, email, full_name, role)
SELECT
  '36dce9fe-ad1b-4eca-841e-5d959b1b5cf5'::uuid as id, -- replace if needed
  org.id,
  'test@test.com' as email,
  'Test User' as full_name,
  'owner' as role
FROM org
ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id, email = EXCLUDED.email, full_name = EXCLUDED.full_name;

-- Add a demo client if not exists
INSERT INTO clients (organization_id, name, industry, description, voice_prompt, default_cta)
SELECT org.id, 'Demo Client', 'Home Services', 'Demo client for testing', 'Be friendly and helpful', 'Learn more'
FROM org
WHERE NOT EXISTS (
  SELECT 1 FROM clients c WHERE c.organization_id = org.id AND c.name = 'Demo Client'
);

COMMIT;

-- After running, refresh the app and verify Dashboard shows "Demo Client" under Active Clients and profile data appears.