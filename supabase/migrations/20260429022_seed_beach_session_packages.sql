-- ============================================================
-- Migration 022: Seed beach photo-session packages
--
-- Adds 4 packages under the family-beach-photography family:
--   • beach-midday      — 1h, 10 photos, mid-day natural light, $250
--   • beach-standard    — 1h, 20 photos, mixed light + flash, $330
--   • beach-golden-hour — 1h, 20 photos super-edited at golden hour, $400
--   • beach-custom      — quote-only (multi-location, drone, groups)
--
-- These power the new /{locale}/beach-photo-sessions landing page and
-- are bookable through the regular wizard via composite deep-link
--   /book?service=family-beach-photography__beach-midday   (etc.)
--
-- Existing essential / premium / luxury / custom under the same family
-- are NOT touched — they stay at their current price points.
-- ============================================================

DO $$
DECLARE
  v_family_id UUID;
BEGIN
  SELECT id INTO v_family_id
  FROM public.service_families
  WHERE slug = 'family-beach-photography';

  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'service_families.slug=family-beach-photography not found';
  END IF;

  -- ── beach-midday ──────────────────────────────────────────────
  INSERT INTO public.service_packages (
    family_id, slug,
    name_es, name_en,
    description_short_es, description_short_en,
    inclusions_es, inclusions_en,
    duration_min, starting_price_usd, deposit_percent,
    photo_count, bookable_direct, custom_quote_allowed,
    featured, popular_badge,
    active, sort_order, legacy_aliases
  ) VALUES (
    v_family_id, 'beach-midday',
    'Sesión Playa · Mediodía',
    'Beach Session · Mid-Day',
    'Sesión rápida de 1 hora con luz natural en cualquier playa de RD. 10 fotos editadas listas en 48 h.',
    'Quick 1-hour natural-light session at any DR beach. 10 edited photos delivered within 48 h.',
    ARRAY[
      '1 hora de sesión en cualquier playa de RD',
      '10 fotos editadas en alta resolución',
      'Iluminación natural balanceada',
      'Coordinación de outfits y poses',
      'Galería privada online (entrega 48 h)'
    ],
    ARRAY[
      '1 hour at any beach in DR',
      '10 high-res edited photos',
      'Balanced natural light',
      'Outfit + pose coordination',
      'Private online gallery (48 h delivery)'
    ],
    60, 250.00, 50,
    10, true, true,
    false, NULL,
    true, 5, ARRAY['beach-quick','beach-natural-light']
  )
  ON CONFLICT (family_id, slug) DO UPDATE SET
    name_es = EXCLUDED.name_es, name_en = EXCLUDED.name_en,
    description_short_es = EXCLUDED.description_short_es,
    description_short_en = EXCLUDED.description_short_en,
    inclusions_es = EXCLUDED.inclusions_es, inclusions_en = EXCLUDED.inclusions_en,
    duration_min = EXCLUDED.duration_min,
    starting_price_usd = EXCLUDED.starting_price_usd,
    photo_count = EXCLUDED.photo_count,
    bookable_direct = EXCLUDED.bookable_direct,
    featured = EXCLUDED.featured,
    popular_badge = EXCLUDED.popular_badge,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    legacy_aliases = EXCLUDED.legacy_aliases,
    updated_at = NOW();

  -- ── beach-standard ────────────────────────────────────────────
  INSERT INTO public.service_packages (
    family_id, slug,
    name_es, name_en,
    description_short_es, description_short_en,
    inclusions_es, inclusions_en,
    duration_min, starting_price_usd, deposit_percent,
    photo_count, bookable_direct, custom_quote_allowed,
    featured, popular_badge,
    active, sort_order, legacy_aliases
  ) VALUES (
    v_family_id, 'beach-standard',
    'Sesión Playa · Estándar',
    'Beach Session · Standard',
    'Sesión de 1 hora con dirección creativa y mezcla de luz natural + flash si es necesario. 20 fotos.',
    '1-hour session with creative direction and mixed natural light + fill flash when needed. 20 photos.',
    ARRAY[
      '1 hora en cualquier playa de RD',
      '20 fotos editadas en alta resolución',
      'Luz natural + flash de relleno cuando aplique',
      'Hasta 2 cambios de outfit',
      'Retoque de piel y color',
      'Galería privada online'
    ],
    ARRAY[
      '1 hour at any DR beach',
      '20 high-res edited photos',
      'Natural light + fill flash when applicable',
      'Up to 2 outfit changes',
      'Skin and color retouching',
      'Private online gallery'
    ],
    60, 330.00, 50,
    20, true, true,
    false, 'most_booked',
    true, 7, ARRAY['beach-classic']
  )
  ON CONFLICT (family_id, slug) DO UPDATE SET
    name_es = EXCLUDED.name_es, name_en = EXCLUDED.name_en,
    description_short_es = EXCLUDED.description_short_es,
    description_short_en = EXCLUDED.description_short_en,
    inclusions_es = EXCLUDED.inclusions_es, inclusions_en = EXCLUDED.inclusions_en,
    duration_min = EXCLUDED.duration_min,
    starting_price_usd = EXCLUDED.starting_price_usd,
    photo_count = EXCLUDED.photo_count,
    bookable_direct = EXCLUDED.bookable_direct,
    featured = EXCLUDED.featured,
    popular_badge = EXCLUDED.popular_badge,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    legacy_aliases = EXCLUDED.legacy_aliases,
    updated_at = NOW();

  -- ── beach-golden-hour ─────────────────────────────────────────
  INSERT INTO public.service_packages (
    family_id, slug,
    name_es, name_en,
    description_short_es, description_short_en,
    inclusions_es, inclusions_en,
    duration_min, starting_price_usd, deposit_percent,
    photo_count, bookable_direct, custom_quote_allowed,
    featured, popular_badge,
    active, sort_order, legacy_aliases
  ) VALUES (
    v_family_id, 'beach-golden-hour',
    'Sesión Playa · Golden Hour',
    'Beach Session · Golden Hour',
    'Sesión al amanecer o atardecer con tratamiento editorial. 20 fotos súper editadas con corrección de color cinematográfica.',
    'Sunrise or sunset session with editorial treatment. 20 super-edited photos with cinematic color grading.',
    ARRAY[
      '1 hora al amanecer o atardecer (golden hour)',
      '20 fotos súper editadas (calidad editorial)',
      'Corrección de color cinematográfica',
      'Hasta 2 cambios de outfit',
      'Galería privada online',
      '5 cortes verticales listos para Reels / Stories'
    ],
    ARRAY[
      '1 hour at sunrise or sunset (golden hour)',
      '20 super-edited photos (editorial grade)',
      'Cinematic color grading',
      'Up to 2 outfit changes',
      'Private online gallery',
      '5 vertical crops Reels-ready'
    ],
    60, 400.00, 50,
    20, true, true,
    true, 'best_value',
    true, 9, ARRAY['beach-sunset','beach-sunrise','beach-editorial']
  )
  ON CONFLICT (family_id, slug) DO UPDATE SET
    name_es = EXCLUDED.name_es, name_en = EXCLUDED.name_en,
    description_short_es = EXCLUDED.description_short_es,
    description_short_en = EXCLUDED.description_short_en,
    inclusions_es = EXCLUDED.inclusions_es, inclusions_en = EXCLUDED.inclusions_en,
    duration_min = EXCLUDED.duration_min,
    starting_price_usd = EXCLUDED.starting_price_usd,
    photo_count = EXCLUDED.photo_count,
    bookable_direct = EXCLUDED.bookable_direct,
    featured = EXCLUDED.featured,
    popular_badge = EXCLUDED.popular_badge,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    legacy_aliases = EXCLUDED.legacy_aliases,
    updated_at = NOW();

  -- ── beach-custom (quote-only) ─────────────────────────────────
  INSERT INTO public.service_packages (
    family_id, slug,
    name_es, name_en,
    description_short_es, description_short_en,
    inclusions_es, inclusions_en,
    duration_min, starting_price_usd, deposit_percent,
    photo_count, bookable_direct, custom_quote_allowed,
    featured, popular_badge,
    active, sort_order, legacy_aliases
  ) VALUES (
    v_family_id, 'beach-custom',
    'Proyecto Playa · A Medida',
    'Custom Beach Project',
    'Cobertura multi-locación, varios outfits, drone, fotos grupales o concepto especial. Cotización personalizada.',
    'Multi-location coverage, multiple outfits, drone, group portraits, or specialty concept. Custom quote.',
    ARRAY[
      'Cobertura multi-locación (varias playas en un día)',
      'Outfits ilimitados',
      'Drone aéreo opcional',
      'Fotos grupales / familias extendidas',
      'Concepto editorial o boudoir en playa',
      'Calendario y entrega a la medida'
    ],
    ARRAY[
      'Multi-location coverage (several beaches in one day)',
      'Unlimited outfits',
      'Optional drone aerial',
      'Group / extended-family photos',
      'Editorial or beach boudoir concept',
      'Custom timeline and deliverables'
    ],
    240, 0.00, 50,
    NULL, false, true,
    false, NULL,
    true, 45, ARRAY['beach-multi-location','beach-drone','beach-group']
  )
  ON CONFLICT (family_id, slug) DO UPDATE SET
    name_es = EXCLUDED.name_es, name_en = EXCLUDED.name_en,
    description_short_es = EXCLUDED.description_short_es,
    description_short_en = EXCLUDED.description_short_en,
    inclusions_es = EXCLUDED.inclusions_es, inclusions_en = EXCLUDED.inclusions_en,
    duration_min = EXCLUDED.duration_min,
    starting_price_usd = EXCLUDED.starting_price_usd,
    photo_count = EXCLUDED.photo_count,
    bookable_direct = EXCLUDED.bookable_direct,
    custom_quote_allowed = EXCLUDED.custom_quote_allowed,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    legacy_aliases = EXCLUDED.legacy_aliases,
    updated_at = NOW();
END $$;
