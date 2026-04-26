# Canonical Seed — FINAL LOCKED v3

**Status**: locked · awaiting one final user audit before SQL is authored
**Produced**: 2026-04-26
**Supersedes**: `docs/canonical-seed-matrix-v2.md` (now historical)
**User-locked corrections applied**:
1. Quinceañera: dedicated tier `quinceanera-premium` inside renamed birthday family
2. Birthday family package slugs: `essential-event / signature-celebration / quinceanera-premium / custom-party`
3. Video production: stays inside `custom-specialty-photography` (no standalone family in Slice A)
4. Proposal slugs: `secret-beach-proposal / signature-proposal / luxury-drone-proposal / custom-proposal-planning`
5. Migration 015 amendments: add `legacy_aliases TEXT[] DEFAULT '{}'::text[]` AND `minimum_billable_hours INTEGER` (nullable) to `service_packages`
6. Descriptions: concise operational only, no marketing prose
7. Corporate-event hourly tiers: `minimum_billable_hours = 2`

This document is the **direct seed source** for migration 016. Every field below is final.

---

## 1 · Required schema amendments to migration 015

Migration 015 (committed but not yet applied) needs two additive column changes before seed migration 016 runs. These are appended to the existing `service_packages` CREATE TABLE block.

```sql
-- Amendment A: legacy_aliases (per user lock decision #4)
-- Captures multi-source mergers like family-beach-photography:essential
-- which receives 3 legacy slugs (family-session, maternity, children-session).
ALTER TABLE public.service_packages
  ADD COLUMN IF NOT EXISTS legacy_aliases TEXT[] NOT NULL DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_service_packages_legacy_aliases
  ON public.service_packages USING GIN (legacy_aliases);

-- Amendment B: minimum_billable_hours (per user lock decision #7)
-- Required for hourly packages (corporate-event-photography:hourly-standard
-- and :hourly-premium) where billing must enforce a 2-hour minimum.
-- NULL for fixed-price or RFQ packages.
ALTER TABLE public.service_packages
  ADD COLUMN IF NOT EXISTS minimum_billable_hours INTEGER
    CHECK (minimum_billable_hours IS NULL OR minimum_billable_hours > 0);
```

Both columns are NULLable / safely defaulted, so existing INSERTs (none yet, since 015 hasn't run on prod) and any future migration that targets the table remain compatible.

When migration 015 is applied to production, these two `ADD COLUMN` statements should be **appended in the same migration file** — not split into a new migration. The 015 file remains a single transactional structural change.

---

## 2 · `service_families` — 9 rows (UNCHANGED from v2)

```sql
INSERT INTO public.service_families
  (slug, title_en, title_es, tagline_en, tagline_es, icon, seo_parent_url, bookable, quoteable, active, sort_order)
VALUES
```

| family_slug | title_en | title_es | icon | seo_parent_url | bookable | quoteable | active | sort_order |
|---|---|---|---|---|---|---|---|---|
| `wedding-photography` | Wedding Photography | Bodas | 💍 | /services/wedding-photography | true | true | true | 10 |
| `proposal-photography` | Proposal Photography | Propuesta de Matrimonio | 🥷 | /services/proposal-photography | true | true | true | 20 |
| `family-beach-photography` | Family & Beach | Familia y Playa | 🏖️ | /services/family-beach-photography | true | true | true | 30 |
| `luxury-portrait-photography` | Luxury Portraits | Retratos de Lujo | 🧑‍💼 | /services/luxury-portrait-photography | true | true | true | 40 |
| `commercial-branding-photography` | Commercial & Branding | Comercial y Branding | 📸 | /services/commercial-branding-photography | true | true | true | 50 |
| `real-estate-drone-photography` | Real Estate & Drone | Bienes Raíces y Drone | 🏠 | /services/real-estate-drone-photography | true | true | true | 60 |
| `corporate-event-photography` | Corporate Events | Eventos Corporativos | 🏢 | /services/corporate-event-photography | true | true | true | 70 |
| `birthday-event-photography` | Birthday & Celebrations | Cumpleaños y Celebraciones | 🎂 | /services/birthday-event-photography | true | true | true | 80 |
| `custom-specialty-photography` | Custom Specialty | Especialidad Personalizada | ✨ | /services/custom-specialty-photography | false | true | true | 90 |

### Family taglines (locked, concise)

| family_slug | tagline_en | tagline_es |
|---|---|---|
| wedding-photography | 4h, 6h, or 8h wedding day coverage with edited gallery and album options. | Cobertura de boda de 4h, 6h u 8h con galería editada y opciones de álbum. |
| proposal-photography | Hidden coverage of marriage proposals using telephoto and drone techniques. | Cobertura oculta de propuestas de matrimonio con técnicas de teleobjetivo y drone. |
| family-beach-photography | Family sessions in studio, on location, and at premium DR beaches. | Sesiones familiares en estudio, locación y playas premium de RD. |
| luxury-portrait-photography | Editorial portraits for executives, artists, models, and creators. | Retratos editoriales para ejecutivos, artistas, modelos y creadores. |
| commercial-branding-photography | Product, restaurant, hotel, and brand photography with commercial-use rights. | Fotografía de productos, restaurantes, hoteles y marcas con derechos comerciales. |
| real-estate-drone-photography | Listing photos, drone aerials, twilight, and Matterport tours. | Fotos de listados, aéreas con drone, twilight y tours Matterport. |
| corporate-event-photography | Hourly or full-day coverage for conferences, launches, and awards. | Cobertura por hora o día completo de conferencias, lanzamientos y premiaciones. |
| birthday-event-photography | Graduations, baptisms, birthdays, and quinceañeras. | Graduaciones, bautizos, cumpleaños y quinceañeras. |
| custom-specialty-photography | Quote-only family for video, theatre, art, multi-day, and bespoke projects. | Familia solo cotización para video, teatro, arte, multi-día y proyectos a medida. |

---

## 3 · `service_packages` — 33 rows (FINAL LOCKED)

Each block below contains EVERY field migration 016 inserts. Fields not shown have these defaults: `deposit_percent=50`, `active=true`, `created_at=NOW()`, `updated_at=NOW()`. `inclusions_es` arrays are parallel to `inclusions_en` (same length, same semantics, indexed identically).

### 3.1 wedding-photography (4 packages)

| field | essential | premium | luxury | custom |
|---|---|---|---|---|
| **slug** | `essential` | `premium` | `luxury` | `custom` |
| **name_en** | Essential Wedding | Premium Wedding | Luxury Full Day | Custom Wedding |
| **name_es** | Boda Esencial | Boda Premium | Día Completo de Lujo | Boda Personalizada |
| **starting_price_usd** | 900.00 | 1500.00 | 2500.00 | 0.00 |
| **duration_min** | 240 | 360 | 480 | 240 |
| **photo_count** | 80 | 150 | 250 | NULL |
| **bookable_direct** | true | true | true | false |
| **custom_quote_allowed** | true | true | true | true |
| **featured** | false | true | false | false |
| **popular_badge** | best_value | most_booked | NULL | NULL |
| **sort_order** | 10 | 20 | 30 | 40 |
| **minimum_billable_hours** | NULL | NULL | NULL | NULL |
| **legacy_aliases** | `{weddings}` | `{}` | `{}` | `{}` |
| **description_short_en** | 4-hour wedding ceremony coverage. Edited high-res gallery. | 6-hour wedding coverage with engagement session and album. | 8-hour full-day coverage with second photographer option. | Multi-day, destination, or fully bespoke wedding coverage. |
| **description_short_es** | Cobertura de 4h de ceremonia. Galería editada en alta resolución. | Cobertura de 6h con sesión de compromiso y álbum. | 8h cobertura día completo con opción de segundo fotógrafo. | Bodas multi-día, destino o totalmente personalizadas. |

**Inclusions (parallel ES/EN arrays):**

| package | inclusions_en | inclusions_es |
|---|---|---|
| essential | `{"4 hours of ceremony coverage","Edited high-resolution photos","Private online gallery","14-day delivery"}` | `{"4h de cobertura de ceremonia","Fotos editadas en alta resolución","Galería online privada","Entrega en 14 días"}` |
| premium | `{"6 hours of wedding day coverage","1-hour engagement session","Designed photo album","Edited high-resolution photos","Private online gallery","14-day delivery"}` | `{"6h de cobertura del día","Sesión de compromiso de 1h","Álbum diseñado","Fotos editadas en alta resolución","Galería online privada","Entrega en 14 días"}` |
| luxury | `{"8 hours of full-day coverage","Engagement + bridal session","Premium photo album","Second photographer option","Same-day teaser delivery","Private online gallery"}` | `{"8h cobertura día completo","Sesión compromiso + bridal","Álbum premium","Opción de segundo fotógrafo","Teaser entregado mismo día","Galería online privada"}` |
| custom | `{"Custom-built scope by quote","Multi-day or destination support","Premium deliverables tailored to event"}` | `{"Alcance personalizado por cotización","Soporte multi-día o destino","Entregables premium a medida"}` |

### 3.2 proposal-photography (4 packages — slugs RENAMED per user lock)

| field | secret-beach-proposal | signature-proposal | luxury-drone-proposal | custom-proposal-planning |
|---|---|---|---|---|
| **slug** | `secret-beach-proposal` | `signature-proposal` | `luxury-drone-proposal` | `custom-proposal-planning` |
| **name_en** | Secret Beach Proposal | Signature Proposal | Luxury Drone Proposal | Custom Proposal Planning |
| **name_es** | Propuesta Playa Secreta | Propuesta Firma | Propuesta Lujo con Drone | Planificación de Propuesta Personalizada |
| **starting_price_usd** | 250.00 | 390.00 | 480.00 | 0.00 |
| **duration_min** | 120 | 180 | 240 | 240 |
| **photo_count** | 20 | 35 | 50 | NULL |
| **bookable_direct** | true | true | true | false |
| **custom_quote_allowed** | true | true | true | true |
| **featured** | false | true | false | false |
| **popular_badge** | best_value | most_booked | NULL | NULL |
| **sort_order** | 10 | 20 | 30 | 40 |
| **minimum_billable_hours** | NULL | NULL | NULL | NULL |
| **legacy_aliases** | `{proposal-photography}` | `{}` | `{}` | `{}` |
| **description_short_en** | 2-hour hidden proposal coverage with 400-600mm telephoto. | 3-hour proposal coverage with venue coordination. | 4-hour destination proposal with drone aerial coverage. | Multi-location, multi-day, or fully bespoke proposal coverage. |
| **description_short_es** | Cobertura oculta de 2h con teleobjetivo 400-600mm. | Cobertura de propuesta de 3h con coordinación del local. | 4h propuesta destino con cobertura aérea con drone. | Propuestas multi-ubicación, multi-día o totalmente personalizadas. |

| package | inclusions_en | inclusions_es |
|---|---|---|
| secret-beach-proposal | `{"2 hours of hidden coverage","400-600mm telephoto from 50-80m","Edited high-resolution gallery","Private gallery delivered within 24h"}` | `{"2h de cobertura oculta","Teleobjetivo 400-600mm desde 50-80m","Galería editada en alta resolución","Galería privada entregada en 24h"}` |
| signature-proposal | `{"3 hours of coverage","Restaurant or venue coordination","Telephoto + close-up shots","Same-night gallery delivery","Private online gallery"}` | `{"3h de cobertura","Coordinación con restaurante o local","Teleobjetivo + tomas cercanas","Galería entregada esa misma noche","Galería online privada"}` |
| luxury-drone-proposal | `{"4 hours of coverage","Drone aerial footage","Telephoto + close-up shots","Destination location support","Same-night gallery delivery","Private online gallery"}` | `{"4h de cobertura","Tomas aéreas con drone","Teleobjetivo + tomas cercanas","Soporte para ubicación destino","Galería entregada esa misma noche","Galería online privada"}` |
| custom-proposal-planning | `{"Custom-built scope by quote","Multi-day support","Destination coordination","Premium deliverables"}` | `{"Alcance personalizado por cotización","Soporte multi-día","Coordinación de destino","Entregables premium"}` |

### 3.3 family-beach-photography (4 packages)

| field | essential | premium | luxury | custom |
|---|---|---|---|---|
| **slug** | `essential` | `premium` | `luxury` | `custom` |
| **name_en** | Essential Family Session | Premium Beach Session | Luxury Exclusive Session | Custom Family Project |
| **name_es** | Sesión Familiar Esencial | Sesión Premium de Playa | Sesión Exclusiva de Lujo | Proyecto Familiar Personalizado |
| **starting_price_usd** | 350.00 | 480.00 | 650.00 | 0.00 |
| **duration_min** | 60 | 90 | 180 | 240 |
| **photo_count** | 20 | 30 | 40 | NULL |
| **bookable_direct** | true | true | true | false |
| **custom_quote_allowed** | true | true | true | true |
| **featured** | false | true | false | false |
| **popular_badge** | best_value | most_booked | NULL | NULL |
| **sort_order** | 10 | 20 | 30 | 40 |
| **minimum_billable_hours** | NULL | NULL | NULL | NULL |
| **legacy_aliases** | `{family-session,maternity,children-session}` | `{}` | `{}` | `{}` |
| **description_short_en** | 1-hour family session in studio or location. | 90-minute beach session at premium DR locations. | 3-hour exclusive Saona-class session with transport. | Multi-location, extended, or themed family project. |
| **description_short_es** | Sesión familiar de 1h en estudio o locación. | Sesión de 90 min en playas premium de RD. | 3h sesión exclusiva clase Saona con transporte. | Proyecto familiar multi-ubicación, extendido o temático. |

| package | inclusions_en | inclusions_es |
|---|---|---|
| essential | `{"1 hour of session time","Up to 5 people","20 edited high-resolution photos","Private online gallery","7-day delivery"}` | `{"1h de sesión","Hasta 5 personas","20 fotos editadas en alta resolución","Galería online privada","Entrega en 7 días"}` |
| premium | `{"90 minutes of session time","Up to 10 people","Premium beach location (Boca Chica, Juan Dolio, La Romana, Punta Cana, Puerto Plata)","30 edited high-resolution photos","Outfit and pose direction","Private online gallery"}` | `{"90 min de sesión","Hasta 10 personas","Playa premium (Boca Chica, Juan Dolio, La Romana, Punta Cana, Puerto Plata)","30 fotos editadas en alta resolución","Dirección de outfits y poses","Galería online privada"}` |
| luxury | `{"3 hours of session time","Saona/Catalina-class location","Boat or catamaran transport included","Lunch and beverages included","40 edited high-resolution photos","Private online gallery"}` | `{"3h de sesión","Ubicación clase Saona/Catalina","Transporte en lancha o catamarán incluido","Almuerzo y bebidas incluidos","40 fotos editadas en alta resolución","Galería online privada"}` |
| custom | `{"Custom-built scope by quote","Multi-location support","Themed concepts available","Premium deliverables"}` | `{"Alcance personalizado por cotización","Soporte multi-ubicación","Conceptos temáticos disponibles","Entregables premium"}` |

### 3.4 luxury-portrait-photography (4 packages)

| field | essential | premium | signature | custom |
|---|---|---|---|---|
| **slug** | `essential` | `premium` | `signature` | `custom` |
| **name_en** | Essential Portrait | Premium Editorial | Signature Studio | Custom Portrait Concept |
| **name_es** | Retrato Esencial | Editorial Premium | Sesión Firma | Concepto de Retrato Personalizado |
| **starting_price_usd** | 250.00 | 390.00 | 550.00 | 0.00 |
| **duration_min** | 60 | 90 | 120 | 240 |
| **photo_count** | 15 | 25 | 40 | NULL |
| **bookable_direct** | true | true | true | false |
| **custom_quote_allowed** | true | true | true | true |
| **featured** | false | true | false | false |
| **popular_badge** | best_value | most_booked | NULL | NULL |
| **sort_order** | 10 | 20 | 30 | 40 |
| **minimum_billable_hours** | NULL | NULL | NULL | NULL |
| **legacy_aliases** | `{portrait,corporate-portrait,engagement-session}` | `{}` | `{}` | `{}` |
| **description_short_en** | 1-hour portrait session in studio or location. | 90-minute editorial portrait with multiple looks. | 2-hour signature studio session for branding or model book. | Concept-driven portrait projects (theatre, fashion, art). |
| **description_short_es** | Sesión de retratos de 1h en estudio o locación. | Sesión editorial de 90 min con múltiples looks. | 2h sesión firma estudio para branding o book de modelo. | Proyectos de retrato conceptual (teatro, moda, arte). |

| package | inclusions_en | inclusions_es |
|---|---|---|
| essential | `{"1 hour of session time","Studio or location of choice","15 edited high-resolution photos","1 outfit change","Private gallery delivery within 48h"}` | `{"1h de sesión","Estudio o locación a elección","15 fotos editadas en alta resolución","1 cambio de outfit","Galería privada entregada en 48h"}` |
| premium | `{"90 minutes of session time","Up to 3 outfit changes","Editorial-style direction","25 edited high-resolution photos","Premium retouching","Private gallery delivery within 48h"}` | `{"90 min de sesión","Hasta 3 cambios de outfit","Dirección estilo editorial","25 fotos editadas en alta resolución","Retoque premium","Galería privada entregada en 48h"}` |
| signature | `{"2 hours of studio time","Up to 4 outfit changes","Multiple lighting setups (Snoot, beauty, editorial)","40 edited high-resolution photos","Premium retouching","Commercial usage rights"}` | `{"2h de estudio","Hasta 4 cambios de outfit","Múltiples setups de iluminación (Snoot, beauty, editorial)","40 fotos editadas en alta resolución","Retoque premium","Derechos de uso comercial"}` |
| custom | `{"Custom-built scope by quote","Concept development support","Multi-look productions","Premium deliverables"}` | `{"Alcance personalizado por cotización","Soporte de desarrollo de concepto","Producciones multi-look","Entregables premium"}` |

### 3.5 commercial-branding-photography (4 packages)

| field | essential | premium | luxury | custom |
|---|---|---|---|---|
| **slug** | `essential` | `premium` | `luxury` | `custom` |
| **name_en** | Essential Commercial | Premium Branding | Luxury Campaign | Custom Commercial Project |
| **name_es** | Comercial Esencial | Branding Premium | Campaña de Lujo | Proyecto Comercial Personalizado |
| **starting_price_usd** | 400.00 | 700.00 | 1200.00 | 0.00 |
| **duration_min** | 60 | 180 | 360 | 240 |
| **photo_count** | 15 | 30 | 60 | NULL |
| **bookable_direct** | true | true | true | false |
| **custom_quote_allowed** | true | true | true | true |
| **featured** | false | true | false | false |
| **popular_badge** | best_value | most_booked | NULL | NULL |
| **sort_order** | 10 | 20 | 30 | 40 |
| **minimum_billable_hours** | NULL | NULL | NULL | NULL |
| **legacy_aliases** | `{commercial,food-and-beverage}` | `{}` | `{}` | `{}` |
| **description_short_en** | 1-hour product or location photo session. | 3-hour branding session with products and lifestyle. | Full-day campaign for hotel or brand multi-asset deliverable. | Multi-day shoots, ad campaigns, complex productions. |
| **description_short_es** | Sesión de productos o locación de 1h. | Sesión de branding de 3h con productos y lifestyle. | Campaña día completo para hotel o marca con múltiples assets. | Rodajes multi-día, campañas publicitarias, producciones complejas. |

| package | inclusions_en | inclusions_es |
|---|---|---|
| essential | `{"1 hour of session time","Studio or location","15 edited high-resolution images","Commercial usage rights","48h delivery"}` | `{"1h de sesión","Estudio o locación","15 imágenes editadas en alta resolución","Derechos de uso comercial","Entrega en 48h"}` |
| premium | `{"3 hours of session time","Products + lifestyle/team shots","30 edited high-resolution images","Premium retouching","Commercial usage rights","Web + print formats"}` | `{"3h de sesión","Productos + lifestyle/equipo","30 imágenes editadas en alta resolución","Retoque premium","Derechos de uso comercial","Formatos web + impresión"}` |
| luxury | `{"6+ hours of shoot time","Multiple looks/scenes","60 edited high-resolution images","Drone aerial option","Premium retouching","Commercial usage rights","Multiple format deliverables"}` | `{"6+ horas de rodaje","Múltiples looks/escenas","60 imágenes editadas en alta resolución","Opción de drone aéreo","Retoque premium","Derechos de uso comercial","Entregables en múltiples formatos"}` |
| custom | `{"Custom-built scope by quote","Multi-day production support","Ad campaign coordination","Premium deliverables"}` | `{"Alcance personalizado por cotización","Soporte de producción multi-día","Coordinación de campaña publicitaria","Entregables premium"}` |

### 3.6 real-estate-drone-photography (4 packages)

| field | essential | premium | luxury | custom |
|---|---|---|---|---|
| **slug** | `essential` | `premium` | `luxury` | `custom` |
| **name_en** | Essential Listing | Premium Property | Luxury Estate | Custom Property Coverage |
| **name_es** | Listado Esencial | Propiedad Premium | Finca de Lujo | Cobertura Personalizada de Propiedad |
| **starting_price_usd** | 200.00 | 400.00 | 600.00 | 0.00 |
| **duration_min** | 90 | 180 | 240 | 240 |
| **photo_count** | 20 | 35 | 50 | NULL |
| **bookable_direct** | true | true | true | false |
| **custom_quote_allowed** | true | true | true | true |
| **featured** | false | true | false | false |
| **popular_badge** | best_value | most_booked | NULL | NULL |
| **sort_order** | 10 | 20 | 30 | 40 |
| **minimum_billable_hours** | NULL | NULL | NULL | NULL |
| **legacy_aliases** | `{real-estate,drone-aerial}` | `{}` | `{}` | `{}` |
| **description_short_en** | Interior + exterior photos for residential listing. | Interior + exterior + drone aerial for properties up to 500m². | Full-property coverage with 4K drone video and Matterport. | Commercial properties, multi-building, or extended drone work. |
| **description_short_es** | Fotos interior + exterior para listado residencial. | Interior + exterior + drone aéreo para propiedades hasta 500m². | Cobertura completa con video 4K con drone y tour Matterport. | Propiedades comerciales, multi-edificio o trabajos de dron extendidos. |

| package | inclusions_en | inclusions_es |
|---|---|---|
| essential | `{"Up to 90 minutes on-site","Up to 200m² property size","20 edited high-resolution photos","Interior + exterior coverage","48h delivery"}` | `{"Hasta 90 min en sitio","Hasta 200m² de propiedad","20 fotos editadas en alta resolución","Cobertura interior + exterior","Entrega en 48h"}` |
| premium | `{"Up to 3 hours on-site","Up to 500m² property size","35 edited high-resolution photos","Drone aerial photos","Twilight option available","Same-week delivery"}` | `{"Hasta 3h en sitio","Hasta 500m² de propiedad","35 fotos editadas en alta resolución","Fotos aéreas con drone","Opción de twilight disponible","Entrega en la misma semana"}` |
| luxury | `{"Up to 4 hours on-site","Unlimited property size","50+ edited high-resolution photos","4K drone aerial video","Matterport 3D virtual tour","Twilight session","Premium retouching"}` | `{"Hasta 4h en sitio","Tamaño de propiedad ilimitado","50+ fotos editadas en alta resolución","Video aéreo 4K con drone","Tour virtual 3D Matterport","Sesión twilight","Retoque premium"}` |
| custom | `{"Custom-built scope by quote","Commercial property support","Multi-building coordination","Extended drone work"}` | `{"Alcance personalizado por cotización","Soporte de propiedades comerciales","Coordinación multi-edificio","Trabajo de dron extendido"}` |

### 3.7 corporate-event-photography (4 packages — TWO have minimum_billable_hours=2)

⚠️ Hourly tiers display "$X/h, 2-hour minimum" in UI. Booking flow must enforce minimum_billable_hours when calculating deposit/total.

| field | hourly-standard | hourly-premium | full-day | custom |
|---|---|---|---|---|
| **slug** | `hourly-standard` | `hourly-premium` | `full-day` | `custom` |
| **name_en** | Hourly Standard | Hourly Premium | Full Day | Custom Corporate Event |
| **name_es** | Por Hora Estándar | Por Hora Premium | Día Completo | Evento Corporativo Personalizado |
| **starting_price_usd** | 100.00 | 200.00 | 550.00 | 0.00 |
| **duration_min** | 60 | 60 | 480 | 240 |
| **photo_count** | NULL | NULL | NULL | NULL |
| **bookable_direct** | true | true | true | false |
| **custom_quote_allowed** | true | true | true | true |
| **featured** | false | false | true | false |
| **popular_badge** | best_value | most_booked | NULL | NULL |
| **sort_order** | 10 | 20 | 30 | 40 |
| **minimum_billable_hours** | **2** | **2** | NULL | NULL |
| **legacy_aliases** | `{}` | `{corporate-event}` | `{}` | `{}` |
| **description_short_en** | $100/hour. 2-hour minimum. Conferences, awards, smaller corporate gatherings. | $200/hour. 2-hour minimum. Senior photographer with same-day teaser. | 8-hour fixed-rate corporate event coverage with same-day teaser. | Multi-day conferences, conventions, corporate retreats. |
| **description_short_es** | $100/hora. Mínimo 2h. Conferencias, premiaciones, eventos corporativos pequeños. | $200/hora. Mínimo 2h. Fotógrafo senior con teaser mismo día. | 8h cobertura evento corporativo a precio fijo con teaser mismo día. | Conferencias multi-día, convenciones, retiros corporativos. |

| package | inclusions_en | inclusions_es |
|---|---|---|
| hourly-standard | `{"$100 per hour, 2-hour minimum","Documentary-style coverage","Edited high-resolution photos","48h delivery","Commercial usage rights"}` | `{"$100 por hora, mínimo 2h","Cobertura estilo documental","Fotos editadas en alta resolución","Entrega en 48h","Derechos de uso comercial"}` |
| hourly-premium | `{"$200 per hour, 2-hour minimum","Senior-level photographer","Same-day teaser (5 images)","Edited high-resolution gallery","24h full delivery","Commercial usage rights"}` | `{"$200 por hora, mínimo 2h","Fotógrafo nivel senior","Teaser mismo día (5 imágenes)","Galería editada en alta resolución","Entrega completa 24h","Derechos de uso comercial"}` |
| full-day | `{"8 hours of coverage","Same-day teaser (10 images)","Edited high-resolution gallery","48h full delivery","Commercial usage rights","Multiple format deliverables"}` | `{"8h de cobertura","Teaser mismo día (10 imágenes)","Galería editada en alta resolución","Entrega completa 48h","Derechos de uso comercial","Entregables en múltiples formatos"}` |
| custom | `{"Custom-built scope by quote","Multi-day support","Convention coordination","Premium deliverables"}` | `{"Alcance personalizado por cotización","Soporte multi-día","Coordinación de convenciones","Entregables premium"}` |

### 3.8 birthday-event-photography (4 packages — slugs RENAMED per user lock)

| field | essential-event | signature-celebration | quinceanera-premium | custom-party |
|---|---|---|---|---|
| **slug** | `essential-event` | `signature-celebration` | `quinceanera-premium` | `custom-party` |
| **name_en** | Essential Event Coverage | Signature Celebration | Premium Quinceañera | Custom Party Project |
| **name_es** | Cobertura Esencial de Evento | Celebración Firma | Quinceañera Premium | Proyecto de Fiesta Personalizada |
| **starting_price_usd** | 200.00 | 350.00 | 500.00 | 0.00 |
| **duration_min** | 60 | 120 | 240 | 240 |
| **photo_count** | 20 | 30 | 60 | NULL |
| **bookable_direct** | true | true | true | false |
| **custom_quote_allowed** | true | true | true | true |
| **featured** | false | true | false | false |
| **popular_badge** | best_value | most_booked | NULL | NULL |
| **sort_order** | 10 | 20 | 30 | 40 |
| **minimum_billable_hours** | NULL | NULL | NULL | NULL |
| **legacy_aliases** | `{graduation,baptism}` | `{birthday-party}` | `{quinceaneras}` | `{}` |
| **description_short_en** | 1-hour coverage for graduations, baptisms, small ceremonies. | 2-hour celebration coverage including decoration and group photos. | 4-hour quinceañera coverage: ceremony, waltz, reception, designed album. | Extended quinceañeras, multi-day celebrations, themed events. |
| **description_short_es** | 1h cobertura para graduaciones, bautizos, ceremonias pequeñas. | 2h cobertura de celebración con decoración y fotos grupales. | 4h cobertura quinceañera: ceremonia, vals, recepción, álbum diseñado. | Quinceañeras extendidas, celebraciones multi-día, eventos temáticos. |

| package | inclusions_en | inclusions_es |
|---|---|---|
| essential-event | `{"1 hour of coverage","Group photos + key moments","20 edited high-resolution photos","Private online gallery","7-day delivery"}` | `{"1h de cobertura","Fotos grupales + momentos clave","20 fotos editadas en alta resolución","Galería online privada","Entrega en 7 días"}` |
| signature-celebration | `{"2 hours of coverage","Decoration and details","Organized group photos","30 edited high-resolution photos","Private online gallery","7-day delivery"}` | `{"2h de cobertura","Decoración y detalles","Fotos grupales organizadas","30 fotos editadas en alta resolución","Galería online privada","Entrega en 7 días"}` |
| quinceanera-premium | `{"4 hours of coverage","Ceremony + church + waltz + reception","60 edited high-resolution photos","Designed photo album","Private online gallery","14-day delivery"}` | `{"4h de cobertura","Ceremonia + iglesia + vals + recepción","60 fotos editadas en alta resolución","Álbum diseñado","Galería online privada","Entrega en 14 días"}` |
| custom-party | `{"Custom-built scope by quote","Multi-day celebration support","Themed concepts","Premium deliverables"}` | `{"Alcance personalizado por cotización","Soporte de celebración multi-día","Conceptos temáticos","Entregables premium"}` |

### 3.9 custom-specialty-photography (1 package — RFQ-only family)

| field | rfq |
|---|---|
| **slug** | `rfq` |
| **name_en** | Custom Specialty Project |
| **name_es** | Proyecto Especializado Personalizado |
| **starting_price_usd** | 0.00 |
| **duration_min** | 240 |
| **photo_count** | NULL |
| **bookable_direct** | false |
| **custom_quote_allowed** | true |
| **featured** | false |
| **popular_badge** | NULL |
| **sort_order** | 10 |
| **minimum_billable_hours** | NULL |
| **legacy_aliases** | `{video-production}` |
| **description_short_en** | RFQ-only destination for video production, theatre, art, music videos, multi-day productions. |
| **description_short_es** | Destino solo cotización para producción de video, teatro, arte, videos musicales, producciones multi-día. |

| package | inclusions_en | inclusions_es |
|---|---|---|
| rfq | `{"Custom-built scope by quote","Video production support","Theatre / art / music video projects","Multi-day production support","Premium deliverables"}` | `{"Alcance personalizado por cotización","Soporte de producción de video","Proyectos de teatro / arte / video musical","Soporte de producción multi-día","Entregables premium"}` |

---

## 4 · Legacy → Canonical backfill rollup (FINAL)

Reverse view: every legacy slug → its destination. This is what migration 016's UPDATE block on `bookings` consumes.

| legacy slug | dest. family | dest. package | live bookings | notes |
|---|---|---|---|---|
| `weddings` | wedding-photography | essential | **2 CONFIRMED** | legacy $1000 → new $900; package_snapshot freezes $1000 historic |
| `engagement-session` | luxury-portrait-photography | essential | 0 | merged with portrait + corporate-portrait |
| `quinceaneras` | birthday-event-photography | **quinceanera-premium** | 0 | dedicated tier per user lock decision #1; legacy $800 → new $500 entry, package_snapshot freezes $800 historic |
| `baptism` | birthday-event-photography | essential-event | 0 | merged with graduation |
| `graduation` | birthday-event-photography | essential-event | 0 | merged with baptism |
| `birthday-party` | birthday-event-photography | signature-celebration | 0 | direct match |
| `portrait` | luxury-portrait-photography | essential | **1 CANCELLED** | merged with corporate-portrait + engagement-session |
| `family-session` | family-beach-photography | essential | 0 | merged with maternity + children |
| `maternity` | family-beach-photography | essential | 0 | merged into family essential |
| `children-session` | family-beach-photography | essential | 0 | merged into family essential |
| `corporate-portrait` | luxury-portrait-photography | essential | 0 | merged with portrait + engagement |
| `corporate-event` | corporate-event-photography | hourly-premium | 0 | $300/2h ≈ $150/h aligns mid-band; routes to premium tier |
| `commercial` | commercial-branding-photography | essential | 0 | merged with food-and-beverage |
| `food-and-beverage` | commercial-branding-photography | essential | 0 | merged with commercial |
| `real-estate` | real-estate-drone-photography | essential | 0 | merged with drone-aerial |
| `drone-aerial` | real-estate-drone-photography | essential | 0 | merged with real-estate (legacy $250/2h fits between $200 essential and $400 premium; routes to essential) |
| `video-production` | custom-specialty-photography | **rfq** | 0 | per user lock decision #3; no standalone family in Slice A |
| `proposal-photography` | proposal-photography | **secret-beach-proposal** | 0 | per user lock decision (renamed from "ninja") |

**Total live-booking exposure**: 3 rows. All backfill cleanly:

| booking id | legacy service | → family_id | → package_id | package_snapshot price (historic) |
|---|---|---|---|---|
| `e7ae1c19-…df1c` | weddings | wedding-photography | essential | $1,000.00 |
| (other CONFIRMED weddings UUID) | weddings | wedding-photography | essential | $1,000.00 |
| (CANCELLED portrait UUID) | portrait | luxury-portrait-photography | essential | $100.00 |

---

## 5 · Sanity check

| family | direct-bookable | RFQ | total | featured count | best_value | most_booked |
|---|---|---|---|---|---|---|
| wedding-photography | 3 | 1 | 4 | 1 (premium) | essential | premium |
| proposal-photography | 3 | 1 | 4 | 1 (signature-proposal) | secret-beach-proposal | signature-proposal |
| family-beach-photography | 3 | 1 | 4 | 1 (premium) | essential | premium |
| luxury-portrait-photography | 3 | 1 | 4 | 1 (premium) | essential | premium |
| commercial-branding-photography | 3 | 1 | 4 | 1 (premium) | essential | premium |
| real-estate-drone-photography | 3 | 1 | 4 | 1 (premium) | essential | premium |
| corporate-event-photography | 3 | 1 | 4 | 1 (full-day) | hourly-standard | hourly-premium |
| birthday-event-photography | 3 | 1 | 4 | 1 (signature-celebration) | essential-event | signature-celebration |
| custom-specialty-photography | 0 | 1 | 1 | 0 | — | — |
| **TOTAL** | **24** | **9** | **33** | **8** | **8** | **8** |

Aggregate verifications:
- ✅ 33 packages, every family has 4 except custom-specialty (1)
- ✅ Every direct-bookable family has exactly 1 `featured`, 1 `best_value`, 1 `most_booked`
- ✅ Every legacy slug from the 18 production rows has exactly one destination package (no orphans)
- ✅ Every `legacy_aliases` array sums correctly: weddings + engagement + quinceaneras + baptism + graduation + birthday-party + portrait + family-session + maternity + children + corporate-portrait + corporate-event + commercial + food-bev + real-estate + drone + video + proposal = 18 ✓
- ✅ `minimum_billable_hours = 2` set on exactly 2 packages (corporate-event-photography:hourly-standard + :hourly-premium); NULL elsewhere
- ✅ `bookable_direct=false` on exactly 9 packages (one per family's "custom" tier + custom-specialty-photography:rfq)

---

## 6 · What this lock does NOT include (still pending)

- **No SQL written**. Migration 016 is still skeleton; it gets authored AFTER user does the final audit on this doc.
- **No prod migration applied**. Migration 015 still hasn't run on production; needs to be amended with the two new columns from §1 first, then applied.
- **No code changes to /book wizard, admin UI, public family pages**. Slice A code starts only after migration 016 lands.

---

## 7 · Nothing to confirm — every locked decision merged in

The seven user-supplied lock decisions are all reflected above:

| User lock | Where it appears |
|---|---|
| 1. Quinceañera dedicated tier | §3.8 birthday-event-photography:`quinceanera-premium` + §4 backfill row |
| 2. Birthday slugs (essential-event / signature-celebration / quinceanera-premium / custom-party) | §3.8 |
| 3. Video production stays in custom-specialty as RFQ | §3.9 + §4 backfill row |
| 4. Proposal slugs (secret-beach / signature / luxury-drone / custom-proposal-planning) | §3.2 |
| 5. legacy_aliases TEXT[] DEFAULT '{}' | §1 amendment A |
| 6. Concise operational descriptions | every description_short_en/es throughout §3 |
| 7. minimum_billable_hours = 2 for corporate hourly | §1 amendment B + §3.7 (only hourly-standard + hourly-premium have value 2) |

---

**End of FINAL LOCKED canonical seed v3. 9 families. 33 packages. 18 legacy slugs reconciled. Two migration 015 amendments specified. Awaiting your final audit before SQL is written.**
