-- Client photo delivery galleries: password-gated, original-JPG download,
-- freestanding OR auto-created from a booking. See src/lib/gallery/*.
--
-- Access model: no anon RLS at all. Both the admin UI and the public /g/[slug]
-- gate go through API routes using the service role client (same pattern as
-- bookings — see 20260424013_bookings.sql), so RLS only needs to cover
-- service_role + authenticated admin.

BEGIN;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_status') THEN
    CREATE TYPE public.gallery_status AS ENUM (
      'draft',      -- shell created (often at booking time), no photos yet
      'uploading',  -- admin actively adding photos
      'ready',      -- visible to client, expiration clock running
      'expired',    -- past expires_at, files deleted, row kept
      'deleted'     -- manually deleted by admin before expiry
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_delete_reason') THEN
    CREATE TYPE public.gallery_delete_reason AS ENUM ('expiration', 'manual', 'client_request');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_download_type') THEN
    CREATE TYPE public.gallery_download_type AS ENUM ('single', 'zip', 'batch');
  END IF;
END $$;

-- ─── galleries ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.galleries (
  id                UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),

  slug              TEXT                     NOT NULL UNIQUE,
  booking_id        UUID                     REFERENCES public.bookings(id) ON DELETE SET NULL,

  client_name       TEXT                     NOT NULL,
  client_email      TEXT                     NOT NULL,

  -- Null until the gallery goes 'ready' — generated at that point (not at
  -- creation) since that's the moment it's actually emailed to the client;
  -- there's nothing to protect while still draft/uploading. Auto-generated,
  -- hashed at rest, never client-chosen. See src/lib/gallery/crypto.ts.
  password_hash     TEXT,

  status            public.gallery_status    NOT NULL DEFAULT 'draft',

  cover_photo_id    UUID,  -- FK added after gallery_photos exists, below

  -- Denormalized so the client page and admin list don't need a COUNT/SUM
  -- query on every load. Updated by the upload/delete routes.
  photo_count       INTEGER                  NOT NULL DEFAULT 0,
  total_bytes        BIGINT                   NOT NULL DEFAULT 0,

  internal_notes    TEXT,

  -- Expiration clock starts at ready_at (photos actually delivered), NOT
  -- created_at — a freestanding gallery can sit in `draft` for weeks between
  -- booking and shoot without burning down its 30-day window.
  ready_at           TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  reminder_sent       BOOLEAN                 NOT NULL DEFAULT false,

  deleted_at          TIMESTAMPTZ,
  deleted_reason       public.gallery_delete_reason,

  uploaded_by          TEXT,  -- admin_users.user_id of whoever last touched it (string, not FK — keep it simple)

  created_at            TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ            NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_galleries_booking ON public.galleries(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_galleries_status ON public.galleries(status);

-- Cron: find galleries that need the T-2-day reminder or have expired.
CREATE INDEX IF NOT EXISTS idx_galleries_expires_at
  ON public.galleries(expires_at)
  WHERE status = 'ready';

-- ─── gallery_photos ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id        UUID          NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,

  filename          TEXT          NOT NULL,
  original_key      TEXT          NOT NULL,  -- R2 key — exact file the admin uploaded, served as-is on download
  preview_key       TEXT          NOT NULL,  -- R2 key — resized copy, grid display only, never served for download
  media_type        TEXT          NOT NULL DEFAULT 'image/jpeg',

  width             INTEGER,
  height            INTEGER,
  file_size         BIGINT        NOT NULL,

  sort_order        INTEGER       NOT NULL DEFAULT 0,

  uploaded_by       TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Upload order is just insertion order for v1 (no manual reordering yet), so
-- queries sort by created_at — sort_order is reserved for that later feature.
CREATE INDEX IF NOT EXISTS idx_gallery_photos_gallery ON public.gallery_photos(gallery_id, created_at);

ALTER TABLE public.galleries
  ADD CONSTRAINT galleries_cover_photo_fkey
  FOREIGN KEY (cover_photo_id) REFERENCES public.gallery_photos(id) ON DELETE SET NULL;

-- ─── gallery_downloads ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gallery_downloads (
  id             UUID                          PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id     UUID                          NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  photo_id       UUID                          REFERENCES public.gallery_photos(id) ON DELETE SET NULL,  -- null = download-all/batch
  download_type  public.gallery_download_type  NOT NULL,
  ip             TEXT,
  user_agent     TEXT,
  downloaded_at  TIMESTAMPTZ                   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_downloads_gallery ON public.gallery_downloads(gallery_id, downloaded_at);

-- ─── Atomic stat updates ────────────────────────────────────────────────────
-- Upload/delete routes call this instead of read-then-write, so concurrent
-- uploads (batch drag-drop) can't lose an update to photo_count/total_bytes.

CREATE OR REPLACE FUNCTION public.increment_gallery_stats(
  p_gallery_id UUID,
  p_delta_count INTEGER,
  p_delta_bytes BIGINT
) RETURNS public.galleries
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.galleries
  SET
    photo_count = photo_count + p_delta_count,
    total_bytes = GREATEST(total_bytes + p_delta_bytes, 0),
    status = CASE WHEN status = 'draft' AND p_delta_count > 0 THEN 'uploading' ELSE status END,
    updated_at = NOW()
  WHERE id = p_gallery_id
  RETURNING *;
$$;

-- ─── RLS — service_role + authenticated admin only, no anon access ─────────────

ALTER TABLE public.galleries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "galleries_service_role_all"
  ON public.galleries FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "galleries_admin_all"
  ON public.galleries FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "gallery_photos_service_role_all"
  ON public.gallery_photos FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "gallery_photos_admin_all"
  ON public.gallery_photos FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "gallery_downloads_service_role_all"
  ON public.gallery_downloads FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "gallery_downloads_admin_all"
  ON public.gallery_downloads FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

COMMIT;
