-- ============================================================
-- Migration 025: Seed business / corporate portrait portfolio photos
--
-- 17 Cloudinary photos featured on the new
-- /{locale}/business-portraits-santo-domingo landing page:
--   • 13 indoor / studio business headshots (sort 400-412)
--   • 4 outdoor business portraits (sort 413-416)
--
-- All categorized as 'portrait' so the existing portfolio Retratos /
-- Portraits filter surfaces them alongside the studio editorial set
-- from migration 021.
-- ============================================================

INSERT INTO portfolio_images (
  public_id,
  alt_es, alt_en,
  caption_es, caption_en,
  title_es, title_en,
  description_es, description_en,
  category, location, featured, sort_order, width, height
) VALUES
-- ── INDOOR / STUDIO HEADSHOTS (13) ───────────────────────────
(
  'Babula_Shots_RD_retratos_profesonal_10_ulwcfr',
  'Retrato profesional para LinkedIn — Santo Domingo, República Dominicana',
  'Professional LinkedIn portrait — Santo Domingo, Dominican Republic',
  'Headshot corporativo de estudio, fondo neutro',
  'Studio corporate headshot, neutral backdrop',
  'LinkedIn · Santo Domingo',
  'LinkedIn · Santo Domingo',
  'Retrato corporativo profesional para perfil LinkedIn con iluminación de estudio',
  'Professional corporate portrait for LinkedIn profile with studio lighting',
  'portrait', 'Santo Domingo · Estudio', true, 400, 1200, 1500
),
(
  'Babula_Shots_RD_retratos_profesonal_2_ewbn3k',
  'Sesión de fotos headshots profesionales en estudio — Santo Domingo',
  'Professional studio headshot session — Santo Domingo',
  'Sesión de headshots ejecutivos en estudio',
  'Executive headshot session in studio',
  'Headshots Ejecutivos',
  'Executive Headshots',
  'Headshot ejecutivo para CEO con dirección y retoque editorial',
  'Executive CEO headshot with direction and editorial retouching',
  'portrait', 'Santo Domingo · Estudio', true, 401, 1200, 1500
),
(
  'Babula_Shots_Rd_jp8tkg',
  'Fotógrafo de marca personal en Santo Domingo, República Dominicana',
  'Personal-brand photographer in Santo Domingo, Dominican Republic',
  'Sesión de marca personal con dirección creativa',
  'Personal-branding session with creative direction',
  'Marca Personal',
  'Personal Branding',
  'Sesión de marca personal para emprendedor con look editorial',
  'Personal-branding session for entrepreneur with editorial look',
  'portrait', 'Santo Domingo · Estudio', false, 402, 1200, 1500
),
(
  'Babula_Shots_Rd_-132_ovgumg',
  'Retratos corporativos para ejecutivos en RD — fondo neutro estudio',
  'Corporate portraits for executives in DR — neutral studio backdrop',
  'Retrato ejecutivo corporativo en estudio',
  'Corporate executive portrait in studio',
  'Ejecutivo · Estudio',
  'Executive · Studio',
  'Retrato corporativo de ejecutivo con iluminación profesional y fondo neutro',
  'Corporate executive portrait with professional lighting and neutral backdrop',
  'portrait', 'Santo Domingo · Estudio', false, 403, 1200, 1500
),
(
  'Babula_Shots_Rd_-116_x5lefx',
  'Fotos para perfil profesional LinkedIn Santo Domingo — Babula Shots',
  'Photos for LinkedIn professional profile Santo Domingo — Babula Shots',
  'Headshot profesional para LinkedIn',
  'Professional LinkedIn headshot',
  'LinkedIn · Profesional',
  'LinkedIn · Professional',
  'Foto profesional para perfil LinkedIn con dirección de pose y expresión',
  'Professional LinkedIn profile photo with pose and expression direction',
  'portrait', 'Santo Domingo · Estudio', false, 404, 1200, 1500
),
(
  'Babula_Shots_Rd_-23_idqwcx',
  'Sesión de fotos para empresa en estudio — Santo Domingo, RD',
  'Corporate company photo session in studio — Santo Domingo, DR',
  'Sesión grupal corporativa en estudio',
  'Corporate group session in studio',
  'Corporativo · Grupo',
  'Corporate · Group',
  'Sesión corporativa para equipo ejecutivo con consistencia de luz y fondo',
  'Corporate session for executive team with consistent light and backdrop',
  'portrait', 'Santo Domingo · Estudio', false, 405, 1200, 1500
),
(
  'Babula_Shots_Rd_-21_l0rdrb',
  'Retratos corporativos profesionales — fotógrafo Santo Domingo',
  'Professional corporate portraits — photographer Santo Domingo',
  'Retrato corporativo en estudio profesional',
  'Corporate portrait in professional studio',
  'Corporativo',
  'Corporate',
  'Retrato corporativo con look editorial para uso en web y prensa',
  'Corporate portrait with editorial look for web and press use',
  'portrait', 'Santo Domingo · Estudio', false, 406, 1200, 1500
),
(
  'Babula_Shots_Rd_-20_vkanwc',
  'Headshot ejecutivo en estudio — Santo Domingo, República Dominicana',
  'Executive headshot in studio — Santo Domingo, Dominican Republic',
  'Headshot profesional con luz controlada',
  'Professional headshot with controlled light',
  'Headshot · Ejecutivo',
  'Headshot · Executive',
  'Headshot ejecutivo en estudio con iluminación y dirección profesional',
  'Executive headshot in studio with professional lighting and direction',
  'portrait', 'Santo Domingo · Estudio', false, 407, 1200, 1500
),
(
  'Babula_Shots_Rd_-108_vvplfw',
  'Sesión de marca personal LinkedIn — Babula Shots Santo Domingo',
  'Personal-branding LinkedIn session — Babula Shots Santo Domingo',
  'Sesión de marca personal en estudio',
  'Personal-branding session in studio',
  'Marca Personal · LinkedIn',
  'Personal Brand · LinkedIn',
  'Sesión de marca personal con dirección creativa para LinkedIn y web',
  'Personal-branding session with creative direction for LinkedIn and web',
  'portrait', 'Santo Domingo · Estudio', false, 408, 1200, 1500
),
(
  'Babula_Shots_Rd_-19_s1czqc',
  'Retrato profesional para empresa en Santo Domingo, RD',
  'Professional corporate portrait in Santo Domingo, DR',
  'Retrato profesional para uso corporativo',
  'Professional portrait for corporate use',
  'Corporativo',
  'Corporate',
  'Retrato profesional con fondo neutral para uso en web corporativa',
  'Professional portrait with neutral backdrop for corporate web use',
  'portrait', 'Santo Domingo · Estudio', false, 409, 1200, 1500
),
(
  'Babula_Shots_Rd_-9_2_evh3fr',
  'Sesión de headshots profesionales en estudio Santo Domingo',
  'Professional headshot session in studio Santo Domingo',
  'Headshot estudio con iluminación profesional',
  'Studio headshot with professional lighting',
  'Headshot Estudio',
  'Studio Headshot',
  'Headshot profesional en estudio con dirección de pose y expresión',
  'Professional studio headshot with pose and expression direction',
  'portrait', 'Santo Domingo · Estudio', false, 410, 1200, 1500
),
(
  'Babula_Shots_Rd_-4_w5y6ot',
  'Retratos corporativos para ejecutivos — fotógrafo profesional RD',
  'Corporate portraits for executives — professional photographer DR',
  'Retrato corporativo con dirección creativa',
  'Corporate portrait with creative direction',
  'Corporativo · RD',
  'Corporate · DR',
  'Retrato corporativo con dirección de pose, expresión y luz',
  'Corporate portrait with pose, expression, and lighting direction',
  'portrait', 'Santo Domingo · Estudio', false, 411, 1200, 1500
),
(
  'Babula_Shots_Rd_-3_atumo9',
  'Fotos de marca personal para emprendedores — Santo Domingo, RD',
  'Personal-brand photos for entrepreneurs — Santo Domingo, DR',
  'Fotos de marca personal en estudio',
  'Personal-brand photos in studio',
  'Marca Personal · Emprendedor',
  'Personal Brand · Entrepreneur',
  'Sesión de marca personal para emprendedor en estudio profesional',
  'Personal-branding session for entrepreneur in professional studio',
  'portrait', 'Santo Domingo · Estudio', false, 412, 1200, 1500
),
-- ── OUTDOOR / LOCATION BUSINESS PORTRAITS (4) ────────────────
(
  'Babula_Shots_RD_retratos_profesonal_8_blkhrv',
  'Retrato de negocios en exteriores — Santo Domingo o Punta Cana',
  'Outdoor business portrait — Santo Domingo or Punta Cana',
  'Retrato corporativo en exteriores con luz natural',
  'Outdoor corporate portrait with natural light',
  'Corporativo · Exterior',
  'Corporate · Outdoor',
  'Retrato corporativo en locación exterior con dirección editorial y luz natural',
  'Outdoor corporate portrait with editorial direction and natural light',
  'portrait', 'Santo Domingo · Exterior', true, 413, 1500, 1200
),
(
  'Babula_Shots_RD_retratos_profesonal_5_chjpto',
  'Sesión de retratos corporativos en exteriores — República Dominicana',
  'Outdoor corporate portrait session — Dominican Republic',
  'Retratos corporativos en locación exterior',
  'Corporate portraits at outdoor location',
  'Corporativo · Locación',
  'Corporate · Location',
  'Retrato corporativo en locación elegida por el cliente con luz natural',
  'Corporate portrait at client-chosen location with natural light',
  'portrait', 'República Dominicana · Exterior', false, 414, 1500, 1200
),
(
  'Babula_Shots_Rd_-6_xeqivl',
  'Fotógrafo de retratos corporativos en exteriores — Santo Domingo',
  'Outdoor corporate portrait photographer — Santo Domingo',
  'Retrato corporativo al aire libre con look editorial',
  'Outdoor corporate portrait with editorial look',
  'Exterior · Editorial',
  'Outdoor · Editorial',
  'Retrato corporativo en exteriores con composición y dirección editorial',
  'Outdoor corporate portrait with editorial composition and direction',
  'portrait', 'Santo Domingo · Exterior', false, 415, 1500, 1200
),
(
  'Babula_Shots_Rd_-9_ja4tck',
  'Retrato corporativo en oficina o locación elegida — RD',
  'Corporate portrait at office or chosen location — DR',
  'Retrato corporativo en oficina del cliente',
  'Corporate portrait at client office',
  'Oficina · Cliente',
  'Office · Client',
  'Retrato corporativo en oficina del cliente o locación de elección',
  'Corporate portrait at client office or chosen location',
  'portrait', 'República Dominicana · Locación', false, 416, 1500, 1200
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
