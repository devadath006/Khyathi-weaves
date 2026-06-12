-- ============================================================
-- Khyathi Weaves — Supabase Schema
-- Paste this entire script into: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Drop tables if re-running (safe for fresh setup)
DROP TABLE IF EXISTS saree_images CASCADE;
DROP TABLE IF EXISTS sarees CASCADE;
DROP TABLE IF EXISTS gallery_items CASCADE;

-- Sarees table
CREATE TABLE sarees (
    id        BIGSERIAL PRIMARY KEY,
    name      TEXT NOT NULL,
    mrp       TEXT,
    price     TEXT,
    is_sold   BOOLEAN DEFAULT FALSE,
    primary_image TEXT
);

-- Gallery of saree images (one saree can have many images)
CREATE TABLE saree_images (
    id        BIGSERIAL PRIMARY KEY,
    saree_id  BIGINT NOT NULL REFERENCES sarees(id) ON DELETE CASCADE,
    image_url TEXT
);

-- Gallery / inauguration items
CREATE TABLE gallery_items (
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT,
    description TEXT,
    media_url   TEXT,
    category    TEXT
);

-- ============================================================
-- Enable Row Level Security (RLS) — read is public, writes need service key
-- ============================================================
ALTER TABLE sarees        ENABLE ROW LEVEL SECURITY;
ALTER TABLE saree_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Allow public reads on all three tables
CREATE POLICY "Public read sarees"        ON sarees        FOR SELECT USING (true);
CREATE POLICY "Public read saree_images"  ON saree_images  FOR SELECT USING (true);
CREATE POLICY "Public read gallery_items" ON gallery_items FOR SELECT USING (true);

-- Allow full access via service role (used by server.js with service key)
CREATE POLICY "Service full access sarees"        ON sarees        USING (true) WITH CHECK (true);
CREATE POLICY "Service full access saree_images"  ON saree_images  USING (true) WITH CHECK (true);
CREATE POLICY "Service full access gallery_items" ON gallery_items USING (true) WITH CHECK (true);
