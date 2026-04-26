-- ============================================================================
-- Migration 016 — Seed canonical families/packages + backfill bookings + view
-- ============================================================================
-- Authored from: docs/canonical-seed-final-locked.md (v3, 2026-04-26)
-- Architecture: 9 families · 33 packages · 18 legacy slugs reconciled
-- Live booking exposure: 3 rows (2× weddings CONFIRMED + 1× portrait CANCELLED)
--
-- Pre-flight requirements:
--   1. Migration 015 (with §6 amendments) MUST be applied first
--   2. Migrations 009 + 010 SHOULD be applied to align quotes drift
--      (recommended but not strictly required for 016 to succeed)
--
-- Operations summary (zero destructive DROP TABLE — only RENAME):
--   A. Insert 9 service_families rows
--   B. Insert 33 service_packages rows (with legacy_aliases populated)
--   C. Verify counts
--   D. Backfill 3 historical bookings (family_id, package_id, package_snapshot)
--   E. Drop FK constraint bookings_service_id_fkey (no data loss)
--   F. UPDATE bookings.service_id to point to new service_packages UUIDs
--      (so the backwards-compat view's id column still joins correctly)
--   G. RENAME booking_services → booking_services_legacy (data preserved)
--   H. CREATE VIEW booking_services for backwards compatibility
--   I. Re-add FK on bookings.service_id pointing to service_packages.id
--   J. Final verification with assertions
--
-- Wrapped in a single transaction. Failures roll back entirely.
-- Re-running is gated by the pre-flight EXCEPTION on non-empty service_families.
-- ============================================================================

BEGIN;

-- ─── Pre-flight: assert migration 015 + amendments applied ──────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                 WHERE table_schema='public' AND table_name='service_families') THEN
    RAISE EXCEPTION 'Migration 015 not applied — service_families table missing.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables
                 WHERE table_schema='public' AND table_name='service_packages') THEN
    RAISE EXCEPTION 'Migration 015 not applied — service_packages table missing.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='service_packages'
                   AND column_name='legacy_aliases') THEN
    RAISE EXCEPTION 'Migration 015 amendment A not applied — service_packages.legacy_aliases missing.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='service_packages'
                   AND column_name='minimum_billable_hours') THEN
    RAISE EXCEPTION 'Migration 015 amendment B not applied — service_packages.minimum_billable_hours missing.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.service_families) THEN
    RAISE EXCEPTION 'Migration 016 already run — service_families is not empty.';
  END IF;
END $$;

-- ============================================================================
-- SECTION A · service_families seed (9 rows)
-- ============================================================================
INSERT INTO public.service_families
  (slug, title_en, title_es, tagline_en, tagline_es, icon, seo_parent_url,
   bookable, quoteable, active, sort_order)
VALUES
  ('wedding-photography', 'Wedding Photography', 'Bodas',
   '4h, 6h, or 8h wedding day coverage with edited gallery and album options.',
   'Cobertura de boda de 4h, 6h u 8h con galería editada y opciones de álbum.',
   '💍', '/services/wedding-photography', true, true, true, 10),

  ('proposal-photography', 'Proposal Photography', 'Propuesta de Matrimonio',
   'Hidden coverage of marriage proposals using telephoto and drone techniques.',
   'Cobertura oculta de propuestas de matrimonio con técnicas de teleobjetivo y drone.',
   '🥷', '/services/proposal-photography', true, true, true, 20),

  ('family-beach-photography', 'Family & Beach', 'Familia y Playa',
   'Family sessions in studio, on location, and at premium DR beaches.',
   'Sesiones familiares en estudio, locación y playas premium de RD.',
   '🏖️', '/services/family-beach-photography', true, true, true, 30),

  ('luxury-portrait-photography', 'Luxury Portraits', 'Retratos de Lujo',
   'Editorial portraits for executives, artists, models, and creators.',
   'Retratos editoriales para ejecutivos, artistas, modelos y creadores.',
   '🧑‍💼', '/services/luxury-portrait-photography', true, true, true, 40),

  ('commercial-branding-photography', 'Commercial & Branding', 'Comercial y Branding',
   'Product, restaurant, hotel, and brand photography with commercial-use rights.',
   'Fotografía de productos, restaurantes, hoteles y marcas con derechos comerciales.',
   '📸', '/services/commercial-branding-photography', true, true, true, 50),

  ('real-estate-drone-photography', 'Real Estate & Drone', 'Bienes Raíces y Drone',
   'Listing photos, drone aerials, twilight, and Matterport tours.',
   'Fotos de listados, aéreas con drone, twilight y tours Matterport.',
   '🏠', '/services/real-estate-drone-photography', true, true, true, 60),

  ('corporate-event-photography', 'Corporate Events', 'Eventos Corporativos',
   'Hourly or full-day coverage for conferences, launches, and awards.',
   'Cobertura por hora o día completo de conferencias, lanzamientos y premiaciones.',
   '🏢', '/services/corporate-event-photography', true, true, true, 70),

  ('birthday-event-photography', 'Birthday & Celebrations', 'Cumpleaños y Celebraciones',
   'Graduations, baptisms, birthdays, and quinceañeras.',
   'Graduaciones, bautizos, cumpleaños y quinceañeras.',
   '🎂', '/services/birthday-event-photography', true, true, true, 80),

  ('custom-specialty-photography', 'Custom Specialty', 'Especialidad Personalizada',
   'Quote-only family for video, theatre, art, multi-day, and bespoke projects.',
   'Familia solo cotización para video, teatro, arte, multi-día y proyectos a medida.',
   '✨', '/services/custom-specialty-photography', false, true, true, 90);

-- ============================================================================
-- SECTION B · service_packages seed (33 rows)
-- ============================================================================
-- Family lookup uses subselect-by-slug to avoid hard-coding UUIDs.
-- legacy_aliases is populated per docs/canonical-seed-final-locked.md §3.

-- ─── B.1 wedding-photography (4 packages) ───────────────────────────────────
INSERT INTO public.service_packages
  (family_id, slug, name_en, name_es, description_short_en, description_short_es,
   inclusions_en, inclusions_es, duration_min, starting_price_usd, deposit_percent,
   photo_count, bookable_direct, custom_quote_allowed, featured, popular_badge,
   sort_order, minimum_billable_hours, legacy_aliases)
VALUES
  ((SELECT id FROM public.service_families WHERE slug='wedding-photography'),
   'essential', 'Essential Wedding', 'Boda Esencial',
   '4-hour wedding ceremony coverage. Edited high-res gallery.',
   'Cobertura de 4h de ceremonia. Galería editada en alta resolución.',
   ARRAY['4 hours of ceremony coverage','Edited high-resolution photos','Private online gallery','14-day delivery'],
   ARRAY['4h de cobertura de ceremonia','Fotos editadas en alta resolución','Galería online privada','Entrega en 14 días'],
   240, 900.00, 50, 80, true, true, false, 'best_value', 10, NULL, ARRAY['weddings']::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='wedding-photography'),
   'premium', 'Premium Wedding', 'Boda Premium',
   '6-hour wedding coverage with engagement session and album.',
   'Cobertura de 6h con sesión de compromiso y álbum.',
   ARRAY['6 hours of wedding day coverage','1-hour engagement session','Designed photo album','Edited high-resolution photos','Private online gallery','14-day delivery'],
   ARRAY['6h de cobertura del día','Sesión de compromiso de 1h','Álbum diseñado','Fotos editadas en alta resolución','Galería online privada','Entrega en 14 días'],
   360, 1500.00, 50, 150, true, true, true, 'most_booked', 20, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='wedding-photography'),
   'luxury', 'Luxury Full Day', 'Día Completo de Lujo',
   '8-hour full-day coverage with second photographer option.',
   '8h cobertura día completo con opción de segundo fotógrafo.',
   ARRAY['8 hours of full-day coverage','Engagement + bridal session','Premium photo album','Second photographer option','Same-day teaser delivery','Private online gallery'],
   ARRAY['8h cobertura día completo','Sesión compromiso + bridal','Álbum premium','Opción de segundo fotógrafo','Teaser entregado mismo día','Galería online privada'],
   480, 2500.00, 50, 250, true, true, false, NULL, 30, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='wedding-photography'),
   'custom', 'Custom Wedding', 'Boda Personalizada',
   'Multi-day, destination, or fully bespoke wedding coverage.',
   'Bodas multi-día, destino o totalmente personalizadas.',
   ARRAY['Custom-built scope by quote','Multi-day or destination support','Premium deliverables tailored to event'],
   ARRAY['Alcance personalizado por cotización','Soporte multi-día o destino','Entregables premium a medida'],
   240, 0.00, 50, NULL, false, true, false, NULL, 40, NULL, ARRAY[]::TEXT[]);

-- ─── B.2 proposal-photography (4 packages) ──────────────────────────────────
INSERT INTO public.service_packages
  (family_id, slug, name_en, name_es, description_short_en, description_short_es,
   inclusions_en, inclusions_es, duration_min, starting_price_usd, deposit_percent,
   photo_count, bookable_direct, custom_quote_allowed, featured, popular_badge,
   sort_order, minimum_billable_hours, legacy_aliases)
VALUES
  ((SELECT id FROM public.service_families WHERE slug='proposal-photography'),
   'secret-beach-proposal', 'Secret Beach Proposal', 'Propuesta Playa Secreta',
   '2-hour hidden proposal coverage with 400-600mm telephoto.',
   'Cobertura oculta de 2h con teleobjetivo 400-600mm.',
   ARRAY['2 hours of hidden coverage','400-600mm telephoto from 50-80m','Edited high-resolution gallery','Private gallery delivered within 24h'],
   ARRAY['2h de cobertura oculta','Teleobjetivo 400-600mm desde 50-80m','Galería editada en alta resolución','Galería privada entregada en 24h'],
   120, 250.00, 50, 20, true, true, false, 'best_value', 10, NULL, ARRAY['proposal-photography']::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='proposal-photography'),
   'signature-proposal', 'Signature Proposal', 'Propuesta Firma',
   '3-hour proposal coverage with venue coordination.',
   'Cobertura de propuesta de 3h con coordinación del local.',
   ARRAY['3 hours of coverage','Restaurant or venue coordination','Telephoto + close-up shots','Same-night gallery delivery','Private online gallery'],
   ARRAY['3h de cobertura','Coordinación con restaurante o local','Teleobjetivo + tomas cercanas','Galería entregada esa misma noche','Galería online privada'],
   180, 390.00, 50, 35, true, true, true, 'most_booked', 20, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='proposal-photography'),
   'luxury-drone-proposal', 'Luxury Drone Proposal', 'Propuesta Lujo con Drone',
   '4-hour destination proposal with drone aerial coverage.',
   '4h propuesta destino con cobertura aérea con drone.',
   ARRAY['4 hours of coverage','Drone aerial footage','Telephoto + close-up shots','Destination location support','Same-night gallery delivery','Private online gallery'],
   ARRAY['4h de cobertura','Tomas aéreas con drone','Teleobjetivo + tomas cercanas','Soporte para ubicación destino','Galería entregada esa misma noche','Galería online privada'],
   240, 480.00, 50, 50, true, true, false, NULL, 30, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='proposal-photography'),
   'custom-proposal-planning', 'Custom Proposal Planning', 'Planificación de Propuesta Personalizada',
   'Multi-location, multi-day, or fully bespoke proposal coverage.',
   'Propuestas multi-ubicación, multi-día o totalmente personalizadas.',
   ARRAY['Custom-built scope by quote','Multi-day support','Destination coordination','Premium deliverables'],
   ARRAY['Alcance personalizado por cotización','Soporte multi-día','Coordinación de destino','Entregables premium'],
   240, 0.00, 50, NULL, false, true, false, NULL, 40, NULL, ARRAY[]::TEXT[]);

-- ─── B.3 family-beach-photography (4 packages) ──────────────────────────────
INSERT INTO public.service_packages
  (family_id, slug, name_en, name_es, description_short_en, description_short_es,
   inclusions_en, inclusions_es, duration_min, starting_price_usd, deposit_percent,
   photo_count, bookable_direct, custom_quote_allowed, featured, popular_badge,
   sort_order, minimum_billable_hours, legacy_aliases)
VALUES
  ((SELECT id FROM public.service_families WHERE slug='family-beach-photography'),
   'essential', 'Essential Family Session', 'Sesión Familiar Esencial',
   '1-hour family session in studio or location.',
   'Sesión familiar de 1h en estudio o locación.',
   ARRAY['1 hour of session time','Up to 5 people','20 edited high-resolution photos','Private online gallery','7-day delivery'],
   ARRAY['1h de sesión','Hasta 5 personas','20 fotos editadas en alta resolución','Galería online privada','Entrega en 7 días'],
   60, 350.00, 50, 20, true, true, false, 'best_value', 10, NULL,
   ARRAY['family-session','maternity','children-session']::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='family-beach-photography'),
   'premium', 'Premium Beach Session', 'Sesión Premium de Playa',
   '90-minute beach session at premium DR locations.',
   'Sesión de 90 min en playas premium de RD.',
   ARRAY['90 minutes of session time','Up to 10 people','Premium beach location (Boca Chica, Juan Dolio, La Romana, Punta Cana, Puerto Plata)','30 edited high-resolution photos','Outfit and pose direction','Private online gallery'],
   ARRAY['90 min de sesión','Hasta 10 personas','Playa premium (Boca Chica, Juan Dolio, La Romana, Punta Cana, Puerto Plata)','30 fotos editadas en alta resolución','Dirección de outfits y poses','Galería online privada'],
   90, 480.00, 50, 30, true, true, true, 'most_booked', 20, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='family-beach-photography'),
   'luxury', 'Luxury Exclusive Session', 'Sesión Exclusiva de Lujo',
   '3-hour exclusive Saona-class session with transport.',
   '3h sesión exclusiva clase Saona con transporte.',
   ARRAY['3 hours of session time','Saona/Catalina-class location','Boat or catamaran transport included','Lunch and beverages included','40 edited high-resolution photos','Private online gallery'],
   ARRAY['3h de sesión','Ubicación clase Saona/Catalina','Transporte en lancha o catamarán incluido','Almuerzo y bebidas incluidos','40 fotos editadas en alta resolución','Galería online privada'],
   180, 650.00, 50, 40, true, true, false, NULL, 30, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='family-beach-photography'),
   'custom', 'Custom Family Project', 'Proyecto Familiar Personalizado',
   'Multi-location, extended, or themed family project.',
   'Proyecto familiar multi-ubicación, extendido o temático.',
   ARRAY['Custom-built scope by quote','Multi-location support','Themed concepts available','Premium deliverables'],
   ARRAY['Alcance personalizado por cotización','Soporte multi-ubicación','Conceptos temáticos disponibles','Entregables premium'],
   240, 0.00, 50, NULL, false, true, false, NULL, 40, NULL, ARRAY[]::TEXT[]);

-- ─── B.4 luxury-portrait-photography (4 packages) ───────────────────────────
INSERT INTO public.service_packages
  (family_id, slug, name_en, name_es, description_short_en, description_short_es,
   inclusions_en, inclusions_es, duration_min, starting_price_usd, deposit_percent,
   photo_count, bookable_direct, custom_quote_allowed, featured, popular_badge,
   sort_order, minimum_billable_hours, legacy_aliases)
VALUES
  ((SELECT id FROM public.service_families WHERE slug='luxury-portrait-photography'),
   'essential', 'Essential Portrait', 'Retrato Esencial',
   '1-hour portrait session in studio or location.',
   'Sesión de retratos de 1h en estudio o locación.',
   ARRAY['1 hour of session time','Studio or location of choice','15 edited high-resolution photos','1 outfit change','Private gallery delivery within 48h'],
   ARRAY['1h de sesión','Estudio o locación a elección','15 fotos editadas en alta resolución','1 cambio de outfit','Galería privada entregada en 48h'],
   60, 250.00, 50, 15, true, true, false, 'best_value', 10, NULL,
   ARRAY['portrait','corporate-portrait','engagement-session']::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='luxury-portrait-photography'),
   'premium', 'Premium Editorial', 'Editorial Premium',
   '90-minute editorial portrait with multiple looks.',
   'Sesión editorial de 90 min con múltiples looks.',
   ARRAY['90 minutes of session time','Up to 3 outfit changes','Editorial-style direction','25 edited high-resolution photos','Premium retouching','Private gallery delivery within 48h'],
   ARRAY['90 min de sesión','Hasta 3 cambios de outfit','Dirección estilo editorial','25 fotos editadas en alta resolución','Retoque premium','Galería privada entregada en 48h'],
   90, 390.00, 50, 25, true, true, true, 'most_booked', 20, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='luxury-portrait-photography'),
   'signature', 'Signature Studio', 'Sesión Firma',
   '2-hour signature studio session for branding or model book.',
   '2h sesión firma estudio para branding o book de modelo.',
   ARRAY['2 hours of studio time','Up to 4 outfit changes','Multiple lighting setups (Snoot, beauty, editorial)','40 edited high-resolution photos','Premium retouching','Commercial usage rights'],
   ARRAY['2h de estudio','Hasta 4 cambios de outfit','Múltiples setups de iluminación (Snoot, beauty, editorial)','40 fotos editadas en alta resolución','Retoque premium','Derechos de uso comercial'],
   120, 550.00, 50, 40, true, true, false, NULL, 30, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='luxury-portrait-photography'),
   'custom', 'Custom Portrait Concept', 'Concepto de Retrato Personalizado',
   'Concept-driven portrait projects (theatre, fashion, art).',
   'Proyectos de retrato conceptual (teatro, moda, arte).',
   ARRAY['Custom-built scope by quote','Concept development support','Multi-look productions','Premium deliverables'],
   ARRAY['Alcance personalizado por cotización','Soporte de desarrollo de concepto','Producciones multi-look','Entregables premium'],
   240, 0.00, 50, NULL, false, true, false, NULL, 40, NULL, ARRAY[]::TEXT[]);

-- ─── B.5 commercial-branding-photography (4 packages) ───────────────────────
INSERT INTO public.service_packages
  (family_id, slug, name_en, name_es, description_short_en, description_short_es,
   inclusions_en, inclusions_es, duration_min, starting_price_usd, deposit_percent,
   photo_count, bookable_direct, custom_quote_allowed, featured, popular_badge,
   sort_order, minimum_billable_hours, legacy_aliases)
VALUES
  ((SELECT id FROM public.service_families WHERE slug='commercial-branding-photography'),
   'essential', 'Essential Commercial', 'Comercial Esencial',
   '1-hour product or location photo session.',
   'Sesión de productos o locación de 1h.',
   ARRAY['1 hour of session time','Studio or location','15 edited high-resolution images','Commercial usage rights','48h delivery'],
   ARRAY['1h de sesión','Estudio o locación','15 imágenes editadas en alta resolución','Derechos de uso comercial','Entrega en 48h'],
   60, 400.00, 50, 15, true, true, false, 'best_value', 10, NULL,
   ARRAY['commercial','food-and-beverage']::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='commercial-branding-photography'),
   'premium', 'Premium Branding', 'Branding Premium',
   '3-hour branding session with products and lifestyle.',
   'Sesión de branding de 3h con productos y lifestyle.',
   ARRAY['3 hours of session time','Products + lifestyle/team shots','30 edited high-resolution images','Premium retouching','Commercial usage rights','Web + print formats'],
   ARRAY['3h de sesión','Productos + lifestyle/equipo','30 imágenes editadas en alta resolución','Retoque premium','Derechos de uso comercial','Formatos web + impresión'],
   180, 700.00, 50, 30, true, true, true, 'most_booked', 20, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='commercial-branding-photography'),
   'luxury', 'Luxury Campaign', 'Campaña de Lujo',
   'Full-day campaign for hotel or brand multi-asset deliverable.',
   'Campaña día completo para hotel o marca con múltiples assets.',
   ARRAY['6+ hours of shoot time','Multiple looks/scenes','60 edited high-resolution images','Drone aerial option','Premium retouching','Commercial usage rights','Multiple format deliverables'],
   ARRAY['6+ horas de rodaje','Múltiples looks/escenas','60 imágenes editadas en alta resolución','Opción de drone aéreo','Retoque premium','Derechos de uso comercial','Entregables en múltiples formatos'],
   360, 1200.00, 50, 60, true, true, false, NULL, 30, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='commercial-branding-photography'),
   'custom', 'Custom Commercial Project', 'Proyecto Comercial Personalizado',
   'Multi-day shoots, ad campaigns, complex productions.',
   'Rodajes multi-día, campañas publicitarias, producciones complejas.',
   ARRAY['Custom-built scope by quote','Multi-day production support','Ad campaign coordination','Premium deliverables'],
   ARRAY['Alcance personalizado por cotización','Soporte de producción multi-día','Coordinación de campaña publicitaria','Entregables premium'],
   240, 0.00, 50, NULL, false, true, false, NULL, 40, NULL, ARRAY[]::TEXT[]);

-- ─── B.6 real-estate-drone-photography (4 packages) ─────────────────────────
INSERT INTO public.service_packages
  (family_id, slug, name_en, name_es, description_short_en, description_short_es,
   inclusions_en, inclusions_es, duration_min, starting_price_usd, deposit_percent,
   photo_count, bookable_direct, custom_quote_allowed, featured, popular_badge,
   sort_order, minimum_billable_hours, legacy_aliases)
VALUES
  ((SELECT id FROM public.service_families WHERE slug='real-estate-drone-photography'),
   'essential', 'Essential Listing', 'Listado Esencial',
   'Interior + exterior photos for residential listing.',
   'Fotos interior + exterior para listado residencial.',
   ARRAY['Up to 90 minutes on-site','Up to 200m² property size','20 edited high-resolution photos','Interior + exterior coverage','48h delivery'],
   ARRAY['Hasta 90 min en sitio','Hasta 200m² de propiedad','20 fotos editadas en alta resolución','Cobertura interior + exterior','Entrega en 48h'],
   90, 200.00, 50, 20, true, true, false, 'best_value', 10, NULL,
   ARRAY['real-estate','drone-aerial']::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='real-estate-drone-photography'),
   'premium', 'Premium Property', 'Propiedad Premium',
   'Interior + exterior + drone aerial for properties up to 500m².',
   'Interior + exterior + drone aéreo para propiedades hasta 500m².',
   ARRAY['Up to 3 hours on-site','Up to 500m² property size','35 edited high-resolution photos','Drone aerial photos','Twilight option available','Same-week delivery'],
   ARRAY['Hasta 3h en sitio','Hasta 500m² de propiedad','35 fotos editadas en alta resolución','Fotos aéreas con drone','Opción de twilight disponible','Entrega en la misma semana'],
   180, 400.00, 50, 35, true, true, true, 'most_booked', 20, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='real-estate-drone-photography'),
   'luxury', 'Luxury Estate', 'Finca de Lujo',
   'Full-property coverage with 4K drone video and Matterport.',
   'Cobertura completa con video 4K con drone y tour Matterport.',
   ARRAY['Up to 4 hours on-site','Unlimited property size','50+ edited high-resolution photos','4K drone aerial video','Matterport 3D virtual tour','Twilight session','Premium retouching'],
   ARRAY['Hasta 4h en sitio','Tamaño de propiedad ilimitado','50+ fotos editadas en alta resolución','Video aéreo 4K con drone','Tour virtual 3D Matterport','Sesión twilight','Retoque premium'],
   240, 600.00, 50, 50, true, true, false, NULL, 30, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='real-estate-drone-photography'),
   'custom', 'Custom Property Coverage', 'Cobertura Personalizada de Propiedad',
   'Commercial properties, multi-building, or extended drone work.',
   'Propiedades comerciales, multi-edificio o trabajos de dron extendidos.',
   ARRAY['Custom-built scope by quote','Commercial property support','Multi-building coordination','Extended drone work'],
   ARRAY['Alcance personalizado por cotización','Soporte de propiedades comerciales','Coordinación multi-edificio','Trabajo de dron extendido'],
   240, 0.00, 50, NULL, false, true, false, NULL, 40, NULL, ARRAY[]::TEXT[]);

-- ─── B.7 corporate-event-photography (4 packages, 2 with min 2h billable) ───
INSERT INTO public.service_packages
  (family_id, slug, name_en, name_es, description_short_en, description_short_es,
   inclusions_en, inclusions_es, duration_min, starting_price_usd, deposit_percent,
   photo_count, bookable_direct, custom_quote_allowed, featured, popular_badge,
   sort_order, minimum_billable_hours, legacy_aliases)
VALUES
  ((SELECT id FROM public.service_families WHERE slug='corporate-event-photography'),
   'hourly-standard', 'Hourly Standard', 'Por Hora Estándar',
   '$100/hour. 2-hour minimum. Conferences, awards, smaller corporate gatherings.',
   '$100/hora. Mínimo 2h. Conferencias, premiaciones, eventos corporativos pequeños.',
   ARRAY['$100 per hour, 2-hour minimum','Documentary-style coverage','Edited high-resolution photos','48h delivery','Commercial usage rights'],
   ARRAY['$100 por hora, mínimo 2h','Cobertura estilo documental','Fotos editadas en alta resolución','Entrega en 48h','Derechos de uso comercial'],
   60, 100.00, 50, NULL, true, true, false, 'best_value', 10, 2, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='corporate-event-photography'),
   'hourly-premium', 'Hourly Premium', 'Por Hora Premium',
   '$200/hour. 2-hour minimum. Senior photographer with same-day teaser.',
   '$200/hora. Mínimo 2h. Fotógrafo senior con teaser mismo día.',
   ARRAY['$200 per hour, 2-hour minimum','Senior-level photographer','Same-day teaser (5 images)','Edited high-resolution gallery','24h full delivery','Commercial usage rights'],
   ARRAY['$200 por hora, mínimo 2h','Fotógrafo nivel senior','Teaser mismo día (5 imágenes)','Galería editada en alta resolución','Entrega completa 24h','Derechos de uso comercial'],
   60, 200.00, 50, NULL, true, true, false, 'most_booked', 20, 2, ARRAY['corporate-event']::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='corporate-event-photography'),
   'full-day', 'Full Day', 'Día Completo',
   '8-hour fixed-rate corporate event coverage with same-day teaser.',
   '8h cobertura evento corporativo a precio fijo con teaser mismo día.',
   ARRAY['8 hours of coverage','Same-day teaser (10 images)','Edited high-resolution gallery','48h full delivery','Commercial usage rights','Multiple format deliverables'],
   ARRAY['8h de cobertura','Teaser mismo día (10 imágenes)','Galería editada en alta resolución','Entrega completa 48h','Derechos de uso comercial','Entregables en múltiples formatos'],
   480, 550.00, 50, NULL, true, true, true, NULL, 30, NULL, ARRAY[]::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='corporate-event-photography'),
   'custom', 'Custom Corporate Event', 'Evento Corporativo Personalizado',
   'Multi-day conferences, conventions, corporate retreats.',
   'Conferencias multi-día, convenciones, retiros corporativos.',
   ARRAY['Custom-built scope by quote','Multi-day support','Convention coordination','Premium deliverables'],
   ARRAY['Alcance personalizado por cotización','Soporte multi-día','Coordinación de convenciones','Entregables premium'],
   240, 0.00, 50, NULL, false, true, false, NULL, 40, NULL, ARRAY[]::TEXT[]);

-- ─── B.8 birthday-event-photography (4 packages, with renamed slugs) ────────
INSERT INTO public.service_packages
  (family_id, slug, name_en, name_es, description_short_en, description_short_es,
   inclusions_en, inclusions_es, duration_min, starting_price_usd, deposit_percent,
   photo_count, bookable_direct, custom_quote_allowed, featured, popular_badge,
   sort_order, minimum_billable_hours, legacy_aliases)
VALUES
  ((SELECT id FROM public.service_families WHERE slug='birthday-event-photography'),
   'essential-event', 'Essential Event Coverage', 'Cobertura Esencial de Evento',
   '1-hour coverage for graduations, baptisms, small ceremonies.',
   '1h cobertura para graduaciones, bautizos, ceremonias pequeñas.',
   ARRAY['1 hour of coverage','Group photos + key moments','20 edited high-resolution photos','Private online gallery','7-day delivery'],
   ARRAY['1h de cobertura','Fotos grupales + momentos clave','20 fotos editadas en alta resolución','Galería online privada','Entrega en 7 días'],
   60, 200.00, 50, 20, true, true, false, 'best_value', 10, NULL,
   ARRAY['graduation','baptism']::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='birthday-event-photography'),
   'signature-celebration', 'Signature Celebration', 'Celebración Firma',
   '2-hour celebration coverage including decoration and group photos.',
   '2h cobertura de celebración con decoración y fotos grupales.',
   ARRAY['2 hours of coverage','Decoration and details','Organized group photos','30 edited high-resolution photos','Private online gallery','7-day delivery'],
   ARRAY['2h de cobertura','Decoración y detalles','Fotos grupales organizadas','30 fotos editadas en alta resolución','Galería online privada','Entrega en 7 días'],
   120, 350.00, 50, 30, true, true, true, 'most_booked', 20, NULL, ARRAY['birthday-party']::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='birthday-event-photography'),
   'quinceanera-premium', 'Premium Quinceañera', 'Quinceañera Premium',
   '4-hour quinceañera coverage: ceremony, waltz, reception, designed album.',
   '4h cobertura quinceañera: ceremonia, vals, recepción, álbum diseñado.',
   ARRAY['4 hours of coverage','Ceremony + church + waltz + reception','60 edited high-resolution photos','Designed photo album','Private online gallery','14-day delivery'],
   ARRAY['4h de cobertura','Ceremonia + iglesia + vals + recepción','60 fotos editadas en alta resolución','Álbum diseñado','Galería online privada','Entrega en 14 días'],
   240, 500.00, 50, 60, true, true, false, NULL, 30, NULL, ARRAY['quinceaneras']::TEXT[]),

  ((SELECT id FROM public.service_families WHERE slug='birthday-event-photography'),
   'custom-party', 'Custom Party Project', 'Proyecto de Fiesta Personalizada',
   'Extended quinceañeras, multi-day celebrations, themed events.',
   'Quinceañeras extendidas, celebraciones multi-día, eventos temáticos.',
   ARRAY['Custom-built scope by quote','Multi-day celebration support','Themed concepts','Premium deliverables'],
   ARRAY['Alcance personalizado por cotización','Soporte de celebración multi-día','Conceptos temáticos','Entregables premium'],
   240, 0.00, 50, NULL, false, true, false, NULL, 40, NULL, ARRAY[]::TEXT[]);

-- ─── B.9 custom-specialty-photography (1 package, RFQ-only) ─────────────────
INSERT INTO public.service_packages
  (family_id, slug, name_en, name_es, description_short_en, description_short_es,
   inclusions_en, inclusions_es, duration_min, starting_price_usd, deposit_percent,
   photo_count, bookable_direct, custom_quote_allowed, featured, popular_badge,
   sort_order, minimum_billable_hours, legacy_aliases)
VALUES
  ((SELECT id FROM public.service_families WHERE slug='custom-specialty-photography'),
   'rfq', 'Custom Specialty Project', 'Proyecto Especializado Personalizado',
   'RFQ-only destination for video production, theatre, art, music videos, multi-day productions.',
   'Destino solo cotización para producción de video, teatro, arte, videos musicales, producciones multi-día.',
   ARRAY['Custom-built scope by quote','Video production support','Theatre / art / music video projects','Multi-day production support','Premium deliverables'],
   ARRAY['Alcance personalizado por cotización','Soporte de producción de video','Proyectos de teatro / arte / video musical','Soporte de producción multi-día','Entregables premium'],
   240, 0.00, 50, NULL, false, true, false, NULL, 10, NULL, ARRAY['video-production']::TEXT[]);

-- ============================================================================
-- SECTION C · Verify seed counts
-- ============================================================================
DO $$
DECLARE
  fam_count INTEGER;
  pkg_count INTEGER;
  alias_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO fam_count FROM public.service_families;
  IF fam_count != 9 THEN
    RAISE EXCEPTION 'Section A failed: expected 9 families, got %', fam_count;
  END IF;

  SELECT COUNT(*) INTO pkg_count FROM public.service_packages;
  IF pkg_count != 33 THEN
    RAISE EXCEPTION 'Section B failed: expected 33 packages, got %', pkg_count;
  END IF;

  -- Aggregate legacy_aliases entries — should be exactly 18 (one per legacy slug)
  SELECT COALESCE(SUM(array_length(legacy_aliases, 1)), 0) INTO alias_total
  FROM public.service_packages
  WHERE legacy_aliases IS NOT NULL AND array_length(legacy_aliases, 1) > 0;
  IF alias_total != 18 THEN
    RAISE EXCEPTION 'Section B failed: expected 18 legacy_aliases entries, got %', alias_total;
  END IF;

  RAISE NOTICE 'Seed verification passed: 9 families, 33 packages, 18 legacy aliases.';
END $$;

-- ============================================================================
-- SECTION D · Backfill 3 historical bookings (family_id, package_id, snapshot)
-- ============================================================================
-- Joins through booking_services (still present at this point) to find each
-- booking's legacy slug, then matches the slug against
-- service_packages.legacy_aliases to find the canonical destination.
--
-- package_snapshot preserves: the canonical package data AS OF migration time,
-- the historic price the customer actually paid (from bookings.stripe_amount_usd),
-- and the original legacy slug for audit.

UPDATE public.bookings AS b
SET
  family_id = p.family_id,
  package_id = p.id,
  package_snapshot = jsonb_build_object(
    'family_slug',         f.slug,
    'package_slug',        p.slug,
    'name_es',             p.name_es,
    'name_en',             p.name_en,
    'price_usd',           p.starting_price_usd,
    'deposit_percent',     p.deposit_percent,
    'duration_min',        p.duration_min,
    'photo_count',         p.photo_count,
    'inclusions_es',       to_jsonb(p.inclusions_es),
    'inclusions_en',       to_jsonb(p.inclusions_en),
    'snapshotted_at',      NOW(),
    'legacy_slug',         bs.slug,
    'historic_price_usd',  b.stripe_amount_usd,
    'backfilled',          true
  )
FROM public.service_packages p
JOIN public.service_families f ON f.id = p.family_id
JOIN public.booking_services bs ON bs.id = b.service_id
WHERE bs.slug = ANY(p.legacy_aliases)
  AND b.family_id IS NULL;  -- idempotency guard

-- Verify every booking with non-null service_id is now backfilled.
DO $$
DECLARE
  unbackfilled INTEGER;
BEGIN
  SELECT COUNT(*) INTO unbackfilled
  FROM public.bookings
  WHERE service_id IS NOT NULL
    AND (family_id IS NULL OR package_id IS NULL OR package_snapshot IS NULL);

  IF unbackfilled > 0 THEN
    RAISE EXCEPTION 'Section D failed: % booking(s) lack family/package backfill. Check legacy_aliases coverage.', unbackfilled;
  END IF;
  RAISE NOTICE 'Backfill verification passed: all bookings have family_id, package_id, package_snapshot.';
END $$;

-- ============================================================================
-- SECTION E · Drop FK on bookings.service_id (constraint only — no data drop)
-- ============================================================================
-- The original FK points to booking_services. We're about to rename that
-- table and update the values, so the constraint must come off temporarily.
-- It's re-added in Section I pointing to the new service_packages table.

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_service_id_fkey;

-- ============================================================================
-- SECTION F · Update bookings.service_id to new package UUIDs
-- ============================================================================
-- After this update, bookings.service_id contains UUIDs that exist in
-- service_packages. This is what makes the backwards-compat view in
-- Section H actually JOIN-able by legacy code that does
--   SELECT * FROM bookings JOIN booking_services ON booking_services.id = bookings.service_id
-- The view's id column will return service_packages.id, which now matches.

UPDATE public.bookings
SET service_id = package_id
WHERE package_id IS NOT NULL
  AND service_id IS DISTINCT FROM package_id;

-- ============================================================================
-- SECTION G · RENAME booking_services to booking_services_legacy
-- ============================================================================
-- Non-destructive: data is preserved under the new name. RLS policies, indexes,
-- and the updated_at trigger all follow the rename automatically.
-- The renamed table remains queryable for historical reference.

ALTER TABLE public.booking_services
  RENAME TO booking_services_legacy;

-- ============================================================================
-- SECTION H · CREATE backwards-compat VIEW booking_services
-- ============================================================================
-- Sprint 1-4 code (every API route + admin page that still reads
-- "booking_services") continues to work without modification. The view exposes
-- the same column names/types as the old table, sourced from
-- service_packages JOIN service_families.
--
-- RLS: views inherit RLS from underlying tables. service_packages has
-- "active = true" public read; service_families has the same. Anon users
-- see only active rows automatically.

CREATE OR REPLACE VIEW public.booking_services AS
  SELECT
    p.id                        AS id,
    p.slug                      AS slug,
    p.name_es                   AS name_es,
    p.name_en                   AS name_en,
    p.description_short_es      AS description_es,
    p.description_short_en      AS description_en,
    f.icon                      AS icon,
    f.slug                      AS category,
    p.duration_min              AS duration_min,
    p.starting_price_usd        AS price_usd,
    p.deposit_percent           AS deposit_percent,
    p.bookable_direct           AS bookable,
    (p.active AND f.active)     AS active,
    p.sort_order                AS sort_order,
    p.created_at                AS created_at,
    p.updated_at                AS updated_at
  FROM public.service_packages p
  JOIN public.service_families f ON f.id = p.family_id;

-- ============================================================================
-- SECTION I · Re-add FK on bookings.service_id pointing to service_packages
-- ============================================================================
-- service_id now references the new canonical table. The constraint validates
-- at creation time — every existing service_id must exist in
-- service_packages.id (we ensured this in Section F).

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_service_id_fkey
  FOREIGN KEY (service_id) REFERENCES public.service_packages(id);

-- ============================================================================
-- SECTION J · Final verification with full migration assertion
-- ============================================================================
DO $$
DECLARE
  view_total       INTEGER;
  view_active      INTEGER;
  legacy_total     INTEGER;
  bookings_total   INTEGER;
  bookings_filled  INTEGER;
BEGIN
  -- View should expose all 33 packages
  SELECT COUNT(*) INTO view_total FROM public.booking_services;
  IF view_total != 33 THEN
    RAISE EXCEPTION 'Section J failed: booking_services view returned % rows, expected 33', view_total;
  END IF;

  -- Active+bookable subset (what /api/bookings/services returns publicly): 24
  SELECT COUNT(*) INTO view_active FROM public.booking_services
    WHERE active = true AND bookable = true;
  IF view_active != 24 THEN
    RAISE EXCEPTION 'Section J failed: view returned % active+bookable rows, expected 24', view_active;
  END IF;

  -- Renamed legacy table still has its 18 original rows
  SELECT COUNT(*) INTO legacy_total FROM public.booking_services_legacy;
  IF legacy_total != 18 THEN
    RAISE EXCEPTION 'Section J failed: booking_services_legacy has % rows, expected 18', legacy_total;
  END IF;

  -- Every booking has full backfill
  SELECT COUNT(*) INTO bookings_total FROM public.bookings;
  SELECT COUNT(*) INTO bookings_filled FROM public.bookings
    WHERE family_id IS NOT NULL AND package_id IS NOT NULL AND package_snapshot IS NOT NULL;
  IF bookings_total != bookings_filled THEN
    RAISE EXCEPTION 'Section J failed: % of % bookings missing backfill', (bookings_total - bookings_filled), bookings_total;
  END IF;

  RAISE NOTICE '✓ Migration 016 verification PASSED.';
  RAISE NOTICE '  service_families: 9';
  RAISE NOTICE '  service_packages: 33';
  RAISE NOTICE '  booking_services view: % rows (24 active+bookable)', view_total;
  RAISE NOTICE '  booking_services_legacy: % rows preserved', legacy_total;
  RAISE NOTICE '  bookings backfilled: % of %', bookings_filled, bookings_total;
END $$;

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES (read after applying)
-- ============================================================================
-- 1. The renamed booking_services_legacy table is now an orphan in PostgREST
--    — the OpenAPI spec will expose it as a queryable resource until you DROP
--    it. Recommended: leave it for at least 30 days as a recovery checkpoint,
--    then DROP TABLE in a future migration once Slice A code is fully verified.
--
-- 2. RLS policies on booking_services_legacy were renamed automatically with
--    the table. Their names still start with "booking_services_..." — this is
--    cosmetic; rename them in a future cleanup migration if desired.
--
-- 3. PostgREST's schema cache may need a refresh to pick up the new view.
--    In Supabase: API → Settings → Reload schema cache. Otherwise queries
--    via /rest/v1/booking_services may return stale 404 for ~60s after migration.
--
-- 4. After Slice A frontend code lands and reads service_packages directly,
--    the booking_services view becomes vestigial — but it remains harmless
--    to keep indefinitely as a read-only compatibility shim.
-- ============================================================================
