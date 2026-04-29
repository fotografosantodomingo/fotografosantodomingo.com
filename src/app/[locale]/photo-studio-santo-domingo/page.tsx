import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const BASE_URL = 'https://www.fotografosantodomingo.com'

const HERO_DESKTOP = 'https://res.cloudinary.com/dwewurxla/image/upload/v1777431039/editorial_sesioon_de_fotos_santoo_domingo_fotografo_profesional_republica_dominicana_neupwn.webp'
const HERO_MOBILE = 'https://res.cloudinary.com/dwewurxla/image/upload/v1777431069/sesion_de_fotos_en_estudio_fotografico_santo_domingo_h0b3ap.webp'

const GALLERY_DESKTOP = [
  'https://res.cloudinary.com/dwewurxla/image/upload/v1777431479/retratos_sesion_de_fotos_en_santo_domingo_izdpba.webp',
  'https://res.cloudinary.com/dwewurxla/image/upload/v1777431479/sesion_de_fotos_estudio_santo_domingo_px3n1o.webp',
  'https://res.cloudinary.com/dwewurxla/image/upload/v1777431479/servicio_de_fotografia_santo_domingo_babula_f1jcqd.webp',
  'https://res.cloudinary.com/dwewurxla/image/upload/v1777431479/fotoografia_estudi_fotografico_santo_domingo_republica_dominicana_phehpw.webp',
]

const GALLERY_MOBILE = [
  'https://res.cloudinary.com/dwewurxla/image/upload/v1777431697/sesion_de_fotos_en_estudio_fotografic_en_santo_domingo_kxuxer.webp',
  'https://res.cloudinary.com/dwewurxla/image/upload/v1777431696/estudio_fotografico_santo_domingoo_zp2fcq.webp',
]

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  if (locale !== 'es' && locale !== 'en') return { title: 'Not found' }
  const isEs = locale === 'es'
  const title = isEs
    ? 'Estudio Fotográfico en Santo Domingo · Fashion, Editorial y Arte | Babula Shots'
    : 'Photo Studio in Santo Domingo · Fashion, Editorial & Fine Art | Babula Shots'
  const description = isEs
    ? 'Sesión de fotos en estudio profesional en Santo Domingo, RD. Especialistas en fashion editorial, retratos creativos y fotografía artística. Iluminación profesional, fondos editoriales y dirección creativa. Desde $100 USD.'
    : 'Professional photo studio sessions in Santo Domingo, DR. Specialists in fashion editorial, creative portraits, and fine art photography. Pro lighting, editorial backdrops, and creative direction. From $100 USD.'
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/photo-studio-santo-domingo`,
      languages: {
        es: `${BASE_URL}/es/photo-studio-santo-domingo`,
        en: `${BASE_URL}/en/photo-studio-santo-domingo`,
        'x-default': `${BASE_URL}/es/photo-studio-santo-domingo`,
      },
    },
    openGraph: {
      type: 'website',
      url: `${BASE_URL}/${locale}/photo-studio-santo-domingo`,
      title,
      description,
      siteName: 'Babula Shots',
      images: [{ url: HERO_DESKTOP, width: 1600, height: 900, alt: title }],
      locale: isEs ? 'es_DO' : 'en_US',
    },
  }
}

export default function PhotoStudioPage({ params: { locale } }: Props) {
  if (locale !== 'es' && locale !== 'en') notFound()
  const isEs = locale === 'es'

  const pricesUrl = `${BASE_URL}/${locale}/prices`
  const familyUrl = `/${locale}/services/luxury-portrait-photography`
  const quoteUrl = `/${locale}/get-quote?family=luxury-portrait-photography&from=studio`
  const bookUrl = `/${locale}/services/luxury-portrait-photography`

  // JSON-LD Service + BreadcrumbList for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: isEs ? 'Inicio' : 'Home', item: `${BASE_URL}/${locale}` },
          { '@type': 'ListItem', position: 2, name: isEs ? 'Servicios' : 'Services', item: `${BASE_URL}/${locale}/services` },
          { '@type': 'ListItem', position: 3, name: isEs ? 'Retratos de Lujo' : 'Luxury Portraits', item: `${BASE_URL}/${locale}/services/luxury-portrait-photography` },
          { '@type': 'ListItem', position: 4, name: isEs ? 'Estudio Fotográfico' : 'Photo Studio' },
        ],
      },
      {
        '@type': 'Service',
        name: isEs ? 'Sesión de Fotos en Estudio — Fashion Editorial y Arte' : 'Studio Photo Session — Fashion Editorial & Fine Art',
        serviceType: 'Photography',
        areaServed: { '@type': 'City', name: 'Santo Domingo' },
        provider: { '@id': `${BASE_URL}/#business` },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: 100,
          availability: 'https://schema.org/InStock',
          url: `${BASE_URL}/${locale}/photo-studio-santo-domingo`,
        },
        description: isEs
          ? 'Sesión de fotos en estudio profesional en Santo Domingo. Fashion editorial, retratos creativos y fotografía artística con iluminación controlada y dirección de arte.'
          : 'Professional studio photo session in Santo Domingo. Fashion editorial, creative portraits, and fine-art photography with controlled lighting and art direction.',
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-canvas text-ink">
        {/* ── HERO ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <nav className="mb-8 flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-ink-muted">
              <Link href={`/${locale}/services`} className="hover:text-ink">{isEs ? 'Servicios' : 'Services'}</Link>
              <span aria-hidden="true">/</span>
              <Link href={familyUrl} className="hover:text-ink">{isEs ? 'Retratos de Lujo' : 'Luxury Portraits'}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-ink">{isEs ? 'Estudio' : 'Studio'}</span>
            </nav>
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-4">
              {isEs ? 'Estudio Fotográfico · Santo Domingo, RD' : 'Photo Studio · Santo Domingo, DR'}
            </p>
            <h1
              className="font-display uppercase text-ink"
              style={{ fontSize: 'clamp(36px, 7vw, 112px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}
            >
              {isEs ? 'Estudio · Fashion Editorial' : 'Studio · Fashion Editorial'}
            </h1>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mt-6 leading-relaxed">
              {isEs
                ? 'Sesiones controladas en estudio profesional en Santo Domingo: fashion editorial, retrato creativo y fotografía artística. Iluminación de calidad cinematográfica, fondos seamless y dirección de arte para construir cada imagen como una pieza editorial.'
                : 'Controlled sessions in a professional Santo Domingo studio: fashion editorial, creative portraiture, and fine-art photography. Cinema-grade lighting, seamless backdrops, and art direction to build every frame like an editorial piece.'}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={bookUrl}
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-canvas hover:opacity-90 transition-opacity"
              >
                {isEs ? 'Reservar sesión' : 'Book a session'}
              </Link>
              <Link
                href={quoteUrl}
                className="inline-flex items-center justify-center rounded-full border border-hairline px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink hover:bg-ink hover:text-canvas transition-colors"
              >
                {isEs ? 'Pedir cotización' : 'Get a quote'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── HERO IMAGE — responsive desktop / mobile ── */}
        <section className="border-b border-hairline-soft bg-canvas">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_DESKTOP}
            alt={isEs ? 'Sesión editorial en estudio fotográfico — Santo Domingo, República Dominicana' : 'Editorial studio photo session — Santo Domingo, Dominican Republic'}
            className="hidden md:block w-full h-auto"
            loading="eager"
            fetchPriority="high"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_MOBILE}
            alt={isEs ? 'Sesión de fotos en estudio fotográfico — Santo Domingo' : 'Photo studio session — Santo Domingo'}
            className="block md:hidden w-full h-auto"
            loading="eager"
            fetchPriority="high"
          />
        </section>

        {/* ── WHAT IS THE STUDIO ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? '¿Qué es el estudio?' : 'What is the studio?'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Un espacio diseñado para construir la imagen' : 'A space designed to build the image'}
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl">
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'El estudio es un set de fotografía profesional con control total sobre la luz, el fondo y la dirección. A diferencia del exterior, donde la luz dicta el resultado, en el estudio cada parámetro se decide: temperatura de color, dureza de la sombra, separación entre sujeto y fondo, profundidad de campo. Eso se traduce en imágenes consistentes, repetibles y con la calidad técnica que demandan campañas, lookbooks y editoriales.'
                  : 'The studio is a professional photo set with total control over light, backdrop, and direction. Unlike outdoor work where the available light dictates the outcome, every parameter in the studio is chosen: color temperature, shadow hardness, subject-to-backdrop separation, depth of field. That translates into consistent, repeatable images with the technical quality campaigns, lookbooks, and editorials demand.'}
              </p>
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Nuestro estudio en Santo Domingo cuenta con flashes de estudio, modeladores (softboxes, beauty dishes, octabox), grids para haz controlado, fondos seamless en colores neutrales y editoriales, y soportes para producto y retrato. Trabajamos con tethering en vivo para revisar cada toma en pantalla grande durante el shoot — esto permite ajustar pose, expresión y luz sin esperar a la entrega.'
                  : 'Our Santo Domingo studio has full studio strobes, modifiers (softboxes, beauty dishes, octabox), grids for controlled beam, seamless backdrops in neutral and editorial colors, and product and portrait supports. We shoot tethered to a large monitor so every frame is reviewed live during the session — pose, expression, and light are tuned in real time, not at delivery.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── FASHION EDITORIAL FOCUS ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Especialidad' : 'Specialty'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Fashion Editorial' : 'Fashion Editorial'}
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl">
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Concentramos nuestro trabajo de estudio en fashion editorial: la imagen que cuenta una historia visual con la pieza de ropa, el accesorio o el cuerpo como protagonista. Es la estética de revistas como Vogue, Harper\'s Bazaar o ID — composiciones limpias, dirección creativa fuerte, manejo intencional del color y del contraste. Ideal para diseñadores que lanzan colección, marcas de moda que arman lookbook de temporada, modelos que construyen book profesional o portfolio para agencias.'
                  : 'Our studio work concentrates on fashion editorial: imagery that tells a visual story with the garment, accessory, or body as the protagonist. The aesthetic of magazines like Vogue, Harper\'s Bazaar, or ID — clean composition, strong creative direction, intentional color and contrast. Ideal for designers launching a collection, fashion brands shooting a seasonal lookbook, models building a pro book, or portfolio work for agencies.'}
              </p>
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Cada sesión editorial empieza con un mood board y un shot list — definimos referencias visuales, paleta, peinado y maquillaje (HMU), y el styling antes de encender una sola luz. Coordinamos con MUA y stylist cuando el proyecto lo requiere, o trabajamos con tu equipo creativo directamente. La entrega incluye RAW selects, retoque editorial completo y archivos optimizados para impresión, web y redes — listos para campaña.'
                  : 'Every editorial session starts with a mood board and shot list — visual references, palette, hair-and-makeup (HMU), and styling are locked before a single light goes up. We coordinate MUA and stylist when the project calls for it, or work directly with your creative team. Delivery includes RAW selects, full editorial retouching, and optimized files for print, web, and social — campaign-ready.'}
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 border-t border-l border-hairline-soft max-w-5xl">
              {(isEs
                ? [
                    { num: '01', title: 'Lookbook de temporada', body: 'Cobertura de colección con consistencia de luz y composición.' },
                    { num: '02', title: 'Book de modelo', body: 'Polaroids, beauty, full-body y editorial para agencia o portfolio.' },
                    { num: '03', title: 'Campaña de marca', body: 'Imágenes hero para lanzamiento, web y prensa con retoque profesional.' },
                  ]
                : [
                    { num: '01', title: 'Seasonal lookbook', body: 'Collection coverage with consistent light and composition.' },
                    { num: '02', title: 'Model book', body: 'Polaroids, beauty, full-body, and editorial for agency or portfolio.' },
                    { num: '03', title: 'Brand campaign', body: 'Hero imagery for launch, web, and press with editorial retouching.' },
                  ]
              ).map((item) => (
                <div key={item.num} className="border-r border-b border-hairline-soft p-7 md:p-8">
                  <span className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">{item.num}</span>
                  <h3 className="font-display uppercase text-ink mt-3" style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: '1.1' }}>
                    {item.title}
                  </h3>
                  <p className="text-ink-muted text-sm leading-relaxed mt-3">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MID-PAGE GALLERY (desktop = 4 photos, mobile = 2) ── */}
        <section className="border-b border-hairline-soft bg-canvas">
          <div className="hidden md:block">
            {GALLERY_DESKTOP.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`d-${i}`}
                src={src}
                alt={isEs ? `Sesión de fotos en estudio fotográfico Santo Domingo ${i + 1}` : `Photo studio session Santo Domingo ${i + 1}`}
                className="block h-auto w-full"
                loading="lazy"
              />
            ))}
          </div>
          <div className="block md:hidden">
            {GALLERY_MOBILE.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`m-${i}`}
                src={src}
                alt={isEs ? `Estudio fotográfico Santo Domingo ${i + 1}` : `Photo studio Santo Domingo ${i + 1}`}
                className="block h-auto w-full"
                loading="lazy"
              />
            ))}
          </div>
        </section>

        {/* ── ART / FINE-ART PHOTOGRAPHY ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'También fotografía artística' : 'Also fine-art photography'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Arte · Conceptual · Personal' : 'Art · Conceptual · Personal'}
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl">
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Fuera de la pauta editorial, el estudio se presta para proyectos artísticos: retratos conceptuales, series temáticas, autorretrato dirigido, cuerpo, claroscuro y luz dura, juegos de color y textura, doble exposición y composición pictórica. Si tienes una idea visual y quieres construirla con luz controlada, esto es para ti.'
                  : 'Beyond editorial assignments, the studio lends itself to art projects: conceptual portraits, thematic series, directed self-portraits, body work, chiaroscuro and hard light, color and texture studies, double exposure, and painterly composition. If you have a visual idea and want to build it with controlled light, this is the place.'}
              </p>
              <p className="text-ink/85 text-base md:text-lg leading-relaxed">
                {isEs
                  ? 'Trabajamos a sesión libre con dirección creativa colaborativa, o como fotógrafo de cabina para artistas que tienen su propio concepto y solo necesitan un técnico que materialice la luz que ven en la cabeza. Entregamos archivos en alta resolución listos para impresión fine art (Hahnemühle, Canson) y exposición.'
                  : 'We work as an open session with collaborative creative direction, or as a hired-gun shooter for artists who already have their concept and only need a technician to render the light they see in their head. Files are delivered in high resolution ready for fine-art printing (Hahnemühle, Canson) and exhibition.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── PRICES ── must mirror /prices and luxury-portrait-photography family ── */}
        <section className="border-b border-hairline-soft py-16 md:py-24">
          <div className="container mx-auto px-4">
            <p className="font-mono uppercase tracking-widest text-[11px] text-ink-muted mb-6">
              {isEs ? 'Precios' : 'Pricing'}
            </p>
            <h2
              className="font-display uppercase text-ink mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.0' }}
            >
              {isEs ? 'Mismas tarifas que la página de precios' : 'Same rates as the pricing page'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
              <article className="border border-hairline-soft p-7">
                <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">{isEs ? 'Sesión base' : 'Base session'}</p>
                <h3 className="font-display uppercase text-ink mt-3" style={{ fontSize: 'clamp(22px, 2.4vw, 30px)', lineHeight: '1.1' }}>
                  {isEs ? 'Retratos · 1 hora' : 'Portrait · 1 hour'}
                </h3>
                <p className="mt-4 text-ink text-3xl font-display">$100 USD</p>
                <ul className="mt-5 space-y-2 text-ink/80 text-sm leading-relaxed">
                  <li>• {isEs ? 'Sesión en estudio o locación' : 'Studio or location session'}</li>
                  <li>• {isEs ? '15 fotos editadas en alta resolución' : '15 edited high-res photos'}</li>
                  <li>• {isEs ? 'Entrega en 48 horas' : '48-hour delivery'}</li>
                </ul>
              </article>
              <article className="border border-hairline-soft p-7">
                <p className="font-mono uppercase tracking-widest text-[10px] text-ink-muted">{isEs ? 'Editorial / Campaña' : 'Editorial / Campaign'}</p>
                <h3 className="font-display uppercase text-ink mt-3" style={{ fontSize: 'clamp(22px, 2.4vw, 30px)', lineHeight: '1.1' }}>
                  {isEs ? 'Cotización personalizada' : 'Custom quote'}
                </h3>
                <p className="mt-4 text-ink-muted text-base leading-relaxed">
                  {isEs
                    ? 'Lookbooks, campañas y proyectos editoriales se cotizan según horas de estudio, número de looks, MUA, retoque y entregables.'
                    : 'Lookbooks, campaigns, and editorial projects are quoted by studio hours, number of looks, MUA, retouching, and deliverables.'}
                </p>
                <Link href={quoteUrl} className="mt-5 inline-flex font-mono uppercase tracking-widest text-[11px] text-ink hover:opacity-70">
                  {isEs ? 'Pedir cotización →' : 'Get a quote →'}
                </Link>
              </article>
            </div>
            <p className="mt-8 max-w-3xl text-ink-muted text-sm leading-relaxed">
              {isEs ? 'Ver el catálogo completo en la ' : 'See the full catalog on the '}
              <Link href={`/${locale}/prices`} className="underline hover:text-ink">
                {isEs ? 'página de precios' : 'pricing page'}
              </Link>
              {isEs ? ', o explora todos los paquetes de retrato en ' : ', or browse all portrait packages on '}
              <Link href={familyUrl} className="underline hover:text-ink">
                {isEs ? 'Retratos de Lujo' : 'Luxury Portraits'}
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h2
              className="font-display uppercase text-ink mb-6"
              style={{ fontSize: 'clamp(28px, 5vw, 72px)', lineHeight: '1.0' }}
            >
              {isEs ? '¿Listo para tu sesión?' : 'Ready for your session?'}
            </h2>
            <p className="text-ink-muted text-base md:text-lg max-w-2xl mx-auto mb-10">
              {isEs
                ? 'Cuéntanos la idea, la fecha y el alcance. Volvemos con plan de luz, mood board y cotización en menos de 24 horas.'
                : 'Tell us the idea, date, and scope. We come back with a lighting plan, mood board, and quote in under 24 hours.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={bookUrl}
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-canvas hover:opacity-90 transition-opacity"
              >
                {isEs ? 'Reservar sesión' : 'Book a session'}
              </Link>
              <Link
                href={quoteUrl}
                className="inline-flex items-center justify-center rounded-full border border-hairline px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink hover:bg-ink hover:text-canvas transition-colors"
              >
                {isEs ? 'Pedir cotización' : 'Get a quote'}
              </Link>
              <Link
                href={`/${locale}/prices`}
                className="inline-flex items-center justify-center rounded-full border border-hairline-soft px-7 py-3.5 font-mono uppercase tracking-widest text-[12px] md:text-[13px] text-ink-muted hover:text-ink hover:border-hairline transition-colors"
              >
                {isEs ? 'Ver todos los precios' : 'See all pricing'}
              </Link>
            </div>
            <p className="mt-10 text-ink-muted text-sm">
              <Link href={`/${locale}/contact`} className="underline hover:text-ink">
                {isEs ? 'Contactar al fotógrafo' : 'Contact the photographer'}
              </Link>
              {' · '}
              <a href="https://wa.me/18097209547" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                WhatsApp +1 (809) 720-9547
              </a>
            </p>
            <p className="mt-3 text-ink-muted text-xs">
              {isEs ? 'Referencia rápida para precios: ' : 'Quick price reference: '}
              <a href={pricesUrl} className="underline hover:text-ink">{pricesUrl}</a>
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
