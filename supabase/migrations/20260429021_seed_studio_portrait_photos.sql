-- ============================================================
-- Migration 021: Seed studio / fashion-editorial portfolio photos
--
-- Adds the 7 Cloudinary photos featured on the new
-- /{locale}/photo-studio-santo-domingo page to the portfolio_images
-- table under category='portrait' so they also surface in the
-- portfolio gallery filter.
--
-- public_id values are derived from the Cloudinary URL slug (the
-- portion before the underscore-suffix hash) and are unique across
-- the table — see migration 001 UNIQUE constraint on public_id.
-- ============================================================

INSERT INTO portfolio_images (
  public_id,
  alt_es, alt_en,
  caption_es, caption_en,
  title_es, title_en,
  description_es, description_en,
  category, location, featured, sort_order, width, height
) VALUES
-- Hero #1 (desktop hero on /photo-studio-santo-domingo)
(
  'editorial_sesioon_de_fotos_santoo_domingo_fotografo_profesional_republica_dominicana_neupwn',
  'Sesión editorial en estudio fotográfico — Santo Domingo, República Dominicana',
  'Editorial studio photo session — Santo Domingo, Dominican Republic',
  'Editorial fashion shoot en estudio profesional, Santo Domingo RD',
  'Editorial fashion shoot in a professional studio, Santo Domingo DR',
  'Sesión Editorial en Estudio',
  'Editorial Studio Session',
  'Fashion editorial con iluminación de estudio controlada y dirección de arte profesional',
  'Fashion editorial with controlled studio lighting and professional art direction',
  'portrait', 'Studio Santo Domingo', true,  100, 1600,  900
),
-- Hero #2 (mobile hero on /photo-studio-santo-domingo)
(
  'sesion_de_fotos_en_estudio_fotografico_santo_domingo_h0b3ap',
  'Sesión de fotos en estudio fotográfico — Santo Domingo',
  'Photo studio session — Santo Domingo',
  'Retrato editorial en estudio profesional Santo Domingo',
  'Editorial portrait in a professional Santo Domingo studio',
  'Estudio Fotográfico Santo Domingo',
  'Santo Domingo Photo Studio',
  'Retrato editorial vertical para mobile, fondo seamless y luz controlada',
  'Vertical editorial portrait for mobile, seamless backdrop with controlled light',
  'portrait', 'Studio Santo Domingo', false, 101, 900,  1600
),
-- Mid-page gallery, desktop set (4 photos)
(
  'retratos_sesion_de_fotos_en_santo_domingo_izdpba',
  'Retratos · sesión de fotos en Santo Domingo',
  'Portraits · photo session in Santo Domingo',
  'Sesión de retratos en estudio Santo Domingo',
  'Portrait session in studio, Santo Domingo',
  'Retratos en Estudio',
  'Studio Portraits',
  'Sesión de retratos editoriales con luz natural difusa y dirección creativa',
  'Editorial portrait session with diffused natural light and creative direction',
  'portrait', 'Studio Santo Domingo', false, 102, 1600,  900
),
(
  'sesion_de_fotos_estudio_santo_domingo_px3n1o',
  'Sesión de fotos en estudio — Santo Domingo',
  'Studio photo session — Santo Domingo',
  'Sesión fashion editorial en estudio profesional Santo Domingo',
  'Fashion editorial session in a professional Santo Domingo studio',
  'Estudio · Fashion',
  'Studio · Fashion',
  'Editorial de moda con manejo de color y composición pictórica',
  'Fashion editorial with intentional color and painterly composition',
  'portrait', 'Studio Santo Domingo', false, 103, 1600,  900
),
(
  'servicio_de_fotografia_santo_domingo_babula_f1jcqd',
  'Servicio de fotografía — Babula Shots, Santo Domingo',
  'Photography service — Babula Shots, Santo Domingo',
  'Servicio de fotografía profesional en estudio, Babula Shots',
  'Professional studio photography service, Babula Shots',
  'Servicio Fotografía Estudio',
  'Studio Photography Service',
  'Cobertura editorial en estudio para campañas, lookbooks y modelos',
  'Editorial studio coverage for campaigns, lookbooks, and models',
  'portrait', 'Studio Santo Domingo', false, 104, 1600,  900
),
(
  'fotoografia_estudi_fotografico_santo_domingo_republica_dominicana_phehpw',
  'Fotografía estudio fotográfico — Santo Domingo, República Dominicana',
  'Studio photography — Santo Domingo, Dominican Republic',
  'Estudio fotográfico profesional en Santo Domingo RD',
  'Professional photo studio in Santo Domingo DR',
  'Estudio Fotográfico RD',
  'DR Photo Studio',
  'Sesión de retrato editorial con flash de estudio y modeladores profesionales',
  'Editorial portrait session with studio strobes and professional modifiers',
  'portrait', 'Studio Santo Domingo', false, 105, 1600,  900
),
-- Mid-page gallery, mobile set (2 vertical photos)
(
  'sesion_de_fotos_en_estudio_fotografic_en_santo_domingo_kxuxer',
  'Sesión de fotos en estudio fotográfico — Santo Domingo',
  'Photo studio session — Santo Domingo',
  'Retrato editorial vertical en estudio Santo Domingo',
  'Vertical editorial portrait in studio, Santo Domingo',
  'Estudio · Vertical',
  'Studio · Vertical',
  'Composición vertical para redes sociales y portfolio editorial',
  'Vertical composition for social media and editorial portfolios',
  'portrait', 'Studio Santo Domingo', false, 106, 900,  1600
),
(
  'estudio_fotografico_santo_domingoo_zp2fcq',
  'Estudio fotográfico — Santo Domingo',
  'Photo studio — Santo Domingo',
  'Estudio fotográfico Santo Domingo, retrato editorial',
  'Santo Domingo photo studio, editorial portrait',
  'Estudio Editorial',
  'Editorial Studio',
  'Retrato editorial vertical con fondo neutro y luz dirigida',
  'Vertical editorial portrait with neutral backdrop and directed light',
  'portrait', 'Studio Santo Domingo', false, 107, 900,  1600
)
ON CONFLICT (public_id) DO UPDATE SET
  alt_es = EXCLUDED.alt_es,
  alt_en = EXCLUDED.alt_en,
  caption_es = EXCLUDED.caption_es,
  caption_en = EXCLUDED.caption_en,
  title_es = EXCLUDED.title_es,
  title_en = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  description_en = EXCLUDED.description_en,
  category = EXCLUDED.category,
  location = EXCLUDED.location,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  width = EXCLUDED.width,
  height = EXCLUDED.height;
