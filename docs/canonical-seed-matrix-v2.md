# Canonical Seed Matrix v2

**Status**: developer-ready seed source for migration 016 · awaiting user approval before SQL is authored
**Produced**: 2026-04-26
**Supersedes**: the family architecture in `docs/service-reconciliation.md` (which is now demoted to legacy backfill reference per user message 2026-04-26)
**Pricing source**: locked premium architecture from chat (Weddings 900/1500/2500/custom, Proposals 250/390/480/custom, Family Beach 350/480/650/custom, Luxury Portraits 250/390/550/custom, Commercial Branding 400/700/1200/custom, Real Estate Drone 200/400/600/custom, Corporate Events $100/h / $200/h / $550 / custom, Birthday Events 200/350/500/custom, Custom Specialty = RFQ only)

---

## 0 · Conventions used in this matrix

| User-supplied field name | DB column name | Notes |
|---|---|---|
| `direct_book` | `bookable_direct` | boolean — appears on /book wizard? |
| `badge` | `popular_badge` | enum: `most_booked` / `best_value` / NULL |
| `legacy_booking_service_slug_source` | `legacy_aliases` (proposed `TEXT[]`) | array — multiple legacy slugs may converge on one canonical package |

**Custom (RFQ-only) packages**:
- `bookable_direct = false`, `custom_quote_allowed = true`
- `starting_price_usd = 0` — UI must render "Custom quote" / "Cotización personalizada" instead of "$0"
- `duration_min = 240` (placeholder; actual duration determined when admin builds the formal quote)

**Inclusions / short descriptions**:
- Provisional values below mark the SHAPE of the data. Final wording will be overwritten by the canonical XLS when it lands.
- Tagged with `[provisional]` so the migration 016 author knows what's locked vs what's draft.

**Field defaults** (apply to every package row unless overridden):
- `deposit_percent = 50`
- `active = true`
- `created_at / updated_at` = NOW() at insertion time

---

## 1 · `service_families` — 9 rows

| # | family_slug | title_en | title_es | icon | seo_parent_url | bookable | quoteable | active | sort_order |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `wedding-photography` | Wedding Photography | Bodas | 💍 | /services/wedding-photography | true | true | true | 10 |
| 2 | `proposal-photography` | Proposal Photography | Propuesta de Matrimonio | 🥷 | /services/proposal-photography | true | true | true | 20 |
| 3 | `family-beach-photography` | Family & Beach | Familia y Playa | 🏖️ | /services/family-beach-photography | true | true | true | 30 |
| 4 | `luxury-portrait-photography` | Luxury Portraits | Retratos de Lujo | 🧑‍💼 | /services/luxury-portrait-photography | true | true | true | 40 |
| 5 | `commercial-branding-photography` | Commercial & Branding | Comercial y Branding | 📸 | /services/commercial-branding-photography | true | true | true | 50 |
| 6 | `real-estate-drone-photography` | Real Estate & Drone | Bienes Raíces y Drone | 🏠 | /services/real-estate-drone-photography | true | true | true | 60 |
| 7 | `corporate-event-photography` | Corporate Events | Eventos Corporativos | 🏢 | /services/corporate-event-photography | true | true | true | 70 |
| 8 | `birthday-event-photography` | Birthday & Celebrations | Cumpleaños y Celebraciones | 🎂 | /services/birthday-event-photography | true | true | true | 80 |
| 9 | `custom-specialty-photography` | Custom Specialty | Especialidad Personalizada | ✨ | /services/custom-specialty-photography | false | true | true | 90 |

**Family-level taglines** (provisional, per locale):

| family_slug | tagline_en `[provisional]` | tagline_es `[provisional]` |
|---|---|---|
| wedding-photography | Capture every moment of your wedding day with cinematic care. | Capturamos cada momento mágico del día más importante. |
| proposal-photography | Hidden ninja-mode coverage of the moment she says yes. | Cobertura sigilosa del momento exacto en que ella dice sí. |
| family-beach-photography | Natural family stories in studio, on location, and at the sea. | Historias familiares naturales en estudio, locación y playa. |
| luxury-portrait-photography | Editorial-quality portraits for executives, artists, and creators. | Retratos editoriales para ejecutivos, artistas y creadores. |
| commercial-branding-photography | Photography that sells — restaurants, hotels, products, brands. | Fotografía que vende: restaurantes, hoteles, productos, marcas. |
| real-estate-drone-photography | Aerial + ground photography for properties that need to move fast. | Fotografía aérea y terrestre para propiedades que se venden rápido. |
| corporate-event-photography | Conferences, launches, awards. Hourly or full-day coverage. | Conferencias, lanzamientos, premiaciones. Por hora o día completo. |
| birthday-event-photography | Quinceañeras, baptisms, graduations, birthdays — all in one family. | Quinceañeras, bautizos, graduaciones, cumpleaños — todo en una sola familia. |
| custom-specialty-photography | Anything outside the standard catalog. We design it together. | Cualquier proyecto fuera del catálogo estándar. Lo diseñamos juntos. |

**Family with `bookable=false`** (per master-file architecture + Decision 6 alignment):
- `custom-specialty-photography` — **publicly visible** as a family card on `/services` AND `/prices` (per the "9 families" canonical list), but **none of its packages are direct-bookable**. Customer can only request a quote. This is a small evolution from the previous Decision 6 which had this family at `active=false`; the new architecture promotes it to public visibility but keeps it RFQ-only.

---

## 2 · `service_packages` — 33 rows

Each family below shows its 3 direct-bookable tiers + 1 custom RFQ tier (custom-specialty has only 1 RFQ-only package).

### 2.1 wedding-photography — 4 packages

| # | slug | name_en | name_es | $USD | min | deposit% | direct_book | featured | badge | sort | legacy_aliases |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1.1 | `essential` | Essential Wedding | Boda Esencial | 900 | 240 | 50 | true | false | best_value | 10 | `{weddings}` |
| 1.2 | `premium` | Premium Wedding | Boda Premium | 1500 | 360 | 50 | true | true | most_booked | 20 | `{}` |
| 1.3 | `luxury` | Luxury Full Day | Día Completo de Lujo | 2500 | 480 | 50 | true | false | NULL | 30 | `{}` |
| 1.4 | `custom` | Custom Wedding | Boda Personalizada | 0 | 240 | 50 | false | false | NULL | 40 | `{}` |

**Provisional descriptions / inclusions** (per package, ES + EN):

| slug | short_description_en `[provisional]` | short_description_es `[provisional]` | inclusions_en (TBD by XLS) | inclusions_es (TBD by XLS) |
|---|---|---|---|---|
| essential | 4-hour ceremony coverage with edited gallery delivery. | Cobertura de 4 horas de la ceremonia con entrega editada. | 4h coverage; edited high-res photos; private online gallery; 14-day delivery | 4h cobertura; fotos editadas en alta resolución; galería online privada; entrega 14 días |
| premium | 6-hour coverage including engagement session and album. | 6 horas de cobertura con sesión de compromiso y álbum. | 6h coverage; engagement session; designed album; private gallery; 14-day delivery | 6h cobertura; sesión de compromiso; álbum diseñado; galería privada; entrega 14 días |
| luxury | 8-hour deluxe day-of coverage with second photographer option. | 8 horas día completo con opción de segundo fotógrafo. | 8h coverage; engagement + bridal session; premium album; second photographer option; same-day teaser | 8h cobertura; sesión compromiso + bridal; álbum premium; opción segundo fotógrafo; teaser mismo día |
| custom | Multi-day, destination, or fully bespoke wedding coverage. | Bodas multi-día, destino o totalmente a medida. | Custom-built scope by quote | Alcance personalizado por cotización |

### 2.2 proposal-photography — 4 packages

| # | slug | name_en | name_es | $USD | min | deposit% | direct_book | featured | badge | sort | legacy_aliases |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2.1 | `ninja` | Ninja Standard | Ninja Estándar | 250 | 120 | 50 | true | false | best_value | 10 | `{proposal-photography}` |
| 2.2 | `premium` | Premium Coordinated | Premium Coordinada | 390 | 180 | 50 | true | true | most_booked | 20 | `{}` |
| 2.3 | `luxury` | Luxury Destination | Destino de Lujo | 480 | 240 | 50 | true | false | NULL | 30 | `{}` |
| 2.4 | `custom` | Custom Proposal | Propuesta Personalizada | 0 | 240 | 50 | false | false | NULL | 40 | `{}` |

| slug | short_description_en `[provisional]` | short_description_es `[provisional]` |
|---|---|---|
| ninja | 100% hidden 2h proposal coverage with 400-600mm telephoto. | Cobertura 100% oculta de 2h con teleobjetivo 400-600mm. |
| premium | 3h coverage with venue coordination + same-night gallery. | 3h cobertura con coordinación del local + galería esa misma noche. |
| luxury | Destination proposal: full-day shadow coverage + private after-shoot. | Propuesta destino: cobertura sombra día completo + sesión privada posterior. |
| custom | Multi-location, multi-day, or destination proposals. | Propuestas multi-ubicación, multi-día o destino. |

### 2.3 family-beach-photography — 4 packages

| # | slug | name_en | name_es | $USD | min | deposit% | direct_book | featured | badge | sort | legacy_aliases |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 3.1 | `essential` | Essential Family Session | Sesión Familiar Esencial | 350 | 60 | 50 | true | false | best_value | 10 | `{family-session,maternity,children-session}` |
| 3.2 | `premium` | Premium Beach Session | Sesión Premium de Playa | 480 | 90 | 50 | true | true | most_booked | 20 | `{}` |
| 3.3 | `luxury` | Luxury Exclusive Session | Sesión Exclusiva de Lujo | 650 | 180 | 50 | true | false | NULL | 30 | `{}` |
| 3.4 | `custom` | Custom Family Project | Proyecto Familiar Personalizado | 0 | 240 | 50 | false | false | NULL | 40 | `{}` |

| slug | short_description_en `[provisional]` | short_description_es `[provisional]` |
|---|---|---|
| essential | Studio or location family session with edited gallery. | Sesión familiar en estudio o locación con galería editada. |
| premium | 90-min beach session at premium DR locations with golden-hour timing. | Sesión de 90 min en playas premium de RD en golden hour. |
| luxury | 3h exclusive Saona/Catalina-style session with transport included. | 3h sesión exclusiva tipo Saona/Catalina con transporte incluido. |
| custom | Multi-location, extended, or themed family session. | Sesión familiar multi-ubicación, extendida o temática. |

### 2.4 luxury-portrait-photography — 4 packages

| # | slug | name_en | name_es | $USD | min | deposit% | direct_book | featured | badge | sort | legacy_aliases |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 4.1 | `essential` | Essential Portrait | Retrato Esencial | 250 | 60 | 50 | true | false | best_value | 10 | `{portrait,corporate-portrait,engagement-session}` |
| 4.2 | `premium` | Premium Editorial | Editorial Premium | 390 | 90 | 50 | true | true | most_booked | 20 | `{}` |
| 4.3 | `signature` | Signature Studio | Sesión Firma | 550 | 120 | 50 | true | false | NULL | 30 | `{}` |
| 4.4 | `custom` | Custom Portrait Concept | Concepto de Retrato Personalizado | 0 | 240 | 50 | false | false | NULL | 40 | `{}` |

| slug | short_description_en `[provisional]` | short_description_es `[provisional]` |
|---|---|---|
| essential | 1h studio or location portrait with editorial direction. | 1h sesión retratos en estudio o locación con dirección editorial. |
| premium | 90-min editorial portrait with multiple looks and premium retouching. | 90 min sesión editorial con múltiples looks y retoque premium. |
| signature | 2h signature studio session — model book, branding, premium products. | 2h sesión firma — book de modelo, branding, productos premium. |
| custom | Concept-driven portrait projects (theatre, fashion, art). | Proyectos de retrato conceptual (teatro, moda, arte). |

### 2.5 commercial-branding-photography — 4 packages

| # | slug | name_en | name_es | $USD | min | deposit% | direct_book | featured | badge | sort | legacy_aliases |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 5.1 | `essential` | Essential Commercial | Comercial Esencial | 400 | 60 | 50 | true | false | best_value | 10 | `{commercial,food-and-beverage}` |
| 5.2 | `premium` | Premium Branding | Branding Premium | 700 | 180 | 50 | true | true | most_booked | 20 | `{}` |
| 5.3 | `luxury` | Luxury Campaign | Campaña de Lujo | 1200 | 360 | 50 | true | false | NULL | 30 | `{}` |
| 5.4 | `custom` | Custom Commercial Project | Proyecto Comercial Personalizado | 0 | 240 | 50 | false | false | NULL | 40 | `{}` |

| slug | short_description_en `[provisional]` | short_description_es `[provisional]` |
|---|---|---|
| essential | 1h product or restaurant photo session with commercial-use rights. | 1h sesión de producto o restaurante con derechos comerciales. |
| premium | 3h branding session — products + lifestyle + premium retouching. | 3h sesión branding — productos + lifestyle + retoque premium. |
| luxury | Full-day campaign — multi-asset deliverable for hotel/brand. | Campaña día completo — múltiples assets para hotel/marca. |
| custom | Multi-day shoots, ad campaigns, complex productions. | Producciones multi-día, campañas publicitarias, proyectos complejos. |

### 2.6 real-estate-drone-photography — 4 packages

| # | slug | name_en | name_es | $USD | min | deposit% | direct_book | featured | badge | sort | legacy_aliases |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 6.1 | `essential` | Essential Listing | Listado Esencial | 200 | 90 | 50 | true | false | best_value | 10 | `{real-estate,drone-aerial}` |
| 6.2 | `premium` | Premium Property | Propiedad Premium | 400 | 180 | 50 | true | true | most_booked | 20 | `{}` |
| 6.3 | `luxury` | Luxury Estate | Finca de Lujo | 600 | 240 | 50 | true | false | NULL | 30 | `{}` |
| 6.4 | `custom` | Custom Property Coverage | Cobertura Personalizada de Propiedad | 0 | 240 | 50 | false | false | NULL | 40 | `{}` |

| slug | short_description_en `[provisional]` | short_description_es `[provisional]` |
|---|---|---|
| essential | Interior + exterior photos for residential listing under 200m². | Fotos interior + exterior para listado residencial menor a 200m². |
| premium | Interior + exterior + drone aerial for properties up to 500m². | Interior + exterior + dron aéreo para propiedades hasta 500m². |
| luxury | Full-property coverage with 4K drone video and Matterport tour. | Cobertura completa con video 4K y tour Matterport. |
| custom | Commercial properties, multi-building, or extended drone work. | Propiedades comerciales, multi-edificio o trabajos de dron extendidos. |

### 2.7 corporate-event-photography — 4 packages

⚠️ Note: tiers 1 & 2 are **hourly rates** (1h minimum), not fixed prices. UI must clearly label "/hour" suffix on these cards.

| # | slug | name_en | name_es | $USD | min | deposit% | direct_book | featured | badge | sort | legacy_aliases |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 7.1 | `hourly-standard` | Hourly Standard | Por Hora Estándar | 100 | 60 | 50 | true | false | best_value | 10 | `{}` |
| 7.2 | `hourly-premium` | Hourly Premium | Por Hora Premium | 200 | 60 | 50 | true | false | most_booked | 20 | `{corporate-event}` |
| 7.3 | `full-day` | Full Day | Día Completo | 550 | 480 | 50 | true | true | NULL | 30 | `{}` |
| 7.4 | `custom` | Custom Corporate Event | Evento Corporativo Personalizado | 0 | 240 | 50 | false | false | NULL | 40 | `{}` |

| slug | short_description_en `[provisional]` | short_description_es `[provisional]` |
|---|---|---|
| hourly-standard | $100/hour. Conferences, awards, smaller corporate gatherings. | $100/hora. Conferencias, premiaciones, eventos corporativos pequeños. |
| hourly-premium | $200/hour. Senior coverage with documentary editing style. | $200/hora. Cobertura senior con estilo documental editado. |
| full-day | 8-hour fixed-rate full-day event coverage with same-day teaser. | 8h cobertura completa precio fijo con teaser mismo día. |
| custom | Multi-day conferences, conventions, corporate retreats. | Conferencias multi-día, convenciones, retiros corporativos. |

### 2.8 birthday-event-photography — 4 packages

| # | slug | name_en | name_es | $USD | min | deposit% | direct_book | featured | badge | sort | legacy_aliases |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 8.1 | `essential` | Essential Birthday | Cumpleaños Esencial | 200 | 60 | 50 | true | false | best_value | 10 | `{graduation,baptism}` |
| 8.2 | `standard` | Standard Celebration | Celebración Estándar | 350 | 120 | 50 | true | true | most_booked | 20 | `{birthday-party}` |
| 8.3 | `premium` | Premium Quinceañera | Quinceañera Premium | 500 | 240 | 50 | true | false | NULL | 30 | `{}` |
| 8.4 | `custom` | Custom Celebration | Celebración Personalizada | 0 | 240 | 50 | false | false | NULL | 40 | `{quinceaneras}` |

| slug | short_description_en `[provisional]` | short_description_es `[provisional]` |
|---|---|---|
| essential | 1-hour coverage for graduations, baptisms, small ceremonies. | 1h cobertura para graduaciones, bautizos, ceremonias pequeñas. |
| standard | 2-hour coverage for birthday parties + group photos + decoration. | 2h cobertura para fiestas + fotos grupales + decoración. |
| premium | 4-hour quinceañera with mass + waltz + reception + designed album. | 4h quinceañera con misa + vals + recepción + álbum diseñado. |
| custom | Extended quinceañeras, multi-day celebrations, themed events. | Quinceañeras extendidas, celebraciones multi-día, eventos temáticos. |

**Note on `quinceaneras` legacy alias placement**: at $800 the legacy quinceañera price exceeds the $500 premium tier, suggesting it was pre-priced for higher-touch coverage. Mapped to `custom` for safety — historic customers paid above-tier prices. Open question: should the premium tier be $800 instead of $500? Awaiting XLS.

### 2.9 custom-specialty-photography — 1 package (RFQ-only family)

| # | slug | name_en | name_es | $USD | min | deposit% | direct_book | featured | badge | sort | legacy_aliases |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 9.1 | `rfq` | Custom Specialty Project | Proyecto Especializado Personalizado | 0 | 240 | 50 | false | false | NULL | 10 | `{video-production}` |

| slug | short_description_en `[provisional]` | short_description_es `[provisional]` |
|---|---|---|
| rfq | Anything outside the standard catalog: video, theatre, art, music videos, multi-day productions. | Cualquier proyecto fuera del catálogo estándar: video, teatro, arte, videos musicales, producciones multi-día. |

⚠️ Note on `video-production` legacy alias: there's no dedicated video-production family in the new architecture. Live legacy slug `video-production` (existed at $800/6h, currently has 0 live bookings) folds into `custom-specialty-photography:rfq` as historical RFQ. If you want a dedicated `video-production` family later, this can be split out — but per the locked 9-family canonical list, video projects are RFQ-only for v2.

---

## 3 · Legacy → Canonical backfill rollup

Reverse view: every legacy slug shown with its destination, alongside live-booking exposure.

| legacy slug | dest. family | dest. package | live bookings | risk |
|---|---|---|---|---|
| `weddings` | wedding-photography | essential | **2 CONFIRMED** | LOW — legacy $1000 → new $900 essential, package_snapshot preserves $1000 historic |
| `engagement-session` | luxury-portrait-photography | essential | 0 | none |
| `quinceaneras` | birthday-event-photography | custom | 0 | none — historic $800 was above-tier; routes to RFQ for safety |
| `baptism` | birthday-event-photography | essential | 0 | none |
| `graduation` | birthday-event-photography | essential | 0 | none |
| `birthday-party` | birthday-event-photography | standard | 0 | none |
| `portrait` | luxury-portrait-photography | essential | **1 CANCELLED** | LOW — CANCELLED rows back-fill for accounting only |
| `family-session` | family-beach-photography | essential | 0 | none |
| `maternity` | family-beach-photography | essential | 0 | none |
| `children-session` | family-beach-photography | essential | 0 | none |
| `corporate-portrait` | luxury-portrait-photography | essential | 0 | none |
| `corporate-event` | corporate-event-photography | hourly-premium | 0 | none — legacy $300/2h ≈ $150/h aligns mid-band between $100/h std and $200/h prem |
| `commercial` | commercial-branding-photography | essential | 0 | none |
| `food-and-beverage` | commercial-branding-photography | essential | 0 | none |
| `real-estate` | real-estate-drone-photography | essential | 0 | none |
| `drone-aerial` | real-estate-drone-photography | essential | 0 | none — legacy $250/2h fits between $200 essential ($90 min) and $400 premium |
| `video-production` | custom-specialty-photography | rfq | 0 | none |
| `proposal-photography` | proposal-photography | ninja | 0 | none |

**Total live-booking exposure**: 3 rows (2 weddings CONFIRMED + 1 portrait CANCELLED). Both back-fill cleanly to `essential` tier of their destination families. `package_snapshot` JSONB freezes the historical price the customer actually paid so accounting + receipts remain accurate.

---

## 4 · Distribution sanity check

| family | direct-bookable count | RFQ count | total |
|---|---|---|---|
| wedding-photography | 3 | 1 | 4 |
| proposal-photography | 3 | 1 | 4 |
| family-beach-photography | 3 | 1 | 4 |
| luxury-portrait-photography | 3 | 1 | 4 |
| commercial-branding-photography | 3 | 1 | 4 |
| real-estate-drone-photography | 3 | 1 | 4 |
| corporate-event-photography | 3 | 1 | 4 |
| birthday-event-photography | 3 | 1 | 4 |
| custom-specialty-photography | 0 | 1 | 1 |
| **Total** | **24** | **9** | **33** |

Aggregate price band on `/book` wizard (only `direct_book=true` packages):
- Min: $100/hour (corporate-event-photography:hourly-standard)
- Max: $2,500 (wedding-photography:luxury)
- 24 directly-bookable packages across 9 families

---

## 5 · Schema compatibility check vs migration 015

The 015 migration's `service_packages` table provides every column needed by this matrix. No schema changes required EXCEPT one optional addition:

### Recommended addition to migration 015 (to support multi-legacy aliases)

The user requested `legacy_booking_service_slug_source` as a single nullable field, but the matrix above shows multiple legacy slugs converging on the same canonical package (e.g., `family-beach-photography:essential` ← family-session + maternity + children-session). One scalar field cannot represent this.

**Three options**:

| Option | Pros | Cons |
|---|---|---|
| (a) `legacy_aliases TEXT[]` column on `service_packages` (default `'{}'`) | Simple, idempotent, queryable via `WHERE 'family-session' = ANY(legacy_aliases)` | Diverges slightly from user's exact wording |
| (b) New junction table `package_legacy_aliases (package_id, legacy_slug)` | Strictly normalized, supports indexing per legacy slug | New table to maintain; overkill for ~18 rows |
| (c) Keep as scalar; pick one "primary" legacy slug per package | Matches user wording verbatim | Loses information about merging; backfill has to reconstruct multi-source mapping |

**Recommendation**: option (a) — add `legacy_aliases TEXT[]` to `service_packages`. Trivial change to migration 015 (one `ADD COLUMN`). Captures the merging cleanly.

---

## 6 · Open items requiring user lock-in

| # | Item | Default if no input |
|---|---|---|
| 1 | Should `quinceaneras` ($800 legacy) backfill to `birthday-event-photography:custom` (safest) or to a renamed `birthday-event-photography:premium-quinceanera` at $800 fixed? | Custom (safest) |
| 2 | Should `video-production` get its own family later, or stay RFQ inside `custom-specialty-photography`? | Stay RFQ until separate decision |
| 3 | Tier names for proposal-photography: `ninja / premium / luxury` (proposed) vs uniform `essential / premium / luxury` for consistency across families? | `ninja / premium / luxury` (preserves brand voice) |
| 4 | Should `legacy_aliases` be added to `service_packages` (recommendation above)? | Yes |
| 5 | Are the provisional taglines + descriptions acceptable, or do you want to overwrite each one before SQL is written? | Use provisional, XLS overrides later |

---

## 7 · What this matrix does NOT do

- It does NOT contain SQL.
- It does NOT touch the live `booking_services` table.
- It does NOT propose final inclusions arrays — those wait for XLS.
- It does NOT prescribe sort order beyond "bookable tiers in price-ascending sequence; custom always last".

---

## 8 · Machine-readable summary (for migration 016 author)

When migration 016 is finally written, the seed inserts will follow this exact ordering:

```
9 families   → INSERT INTO service_families  (sort order matches §1 table)
33 packages  → INSERT INTO service_packages  (one block per family, sort order matches §2 tables)
3 bookings   → UPDATE bookings SET family_id, package_id, package_snapshot
                WHERE service_id IN (legacy weddings, legacy weddings, legacy portrait)
1 view       → DROP TABLE booking_services; CREATE VIEW booking_services
                (per migration 016 skeleton steps 5-7)
```

**Only after user approves this matrix** does the seed migration get authored.

---

**End of canonical seed matrix v2. 9 families, 33 packages, 18 legacy slugs reconciled. Awaiting user lock-in on §6 open items + final inclusions wording before SQL is written.**
