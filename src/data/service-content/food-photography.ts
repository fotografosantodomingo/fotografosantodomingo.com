/**
 * Rich SEO content for the food-photography family page.
 *
 * New family (added 2026-09-01). Flagship real client work: Restaurante
 * Capitán Cook, a seafood restaurant on the beach strip in Punta Cana —
 * full-day content shoot covering fresh catch, open-kitchen grilling,
 * bar service, plated dishes, and dining-room ambiance. All gallery
 * images below are real photos from that session (Cloudinary, verified
 * by direct inspection — not stock, not placeholders).
 */

import type { ServiceContent } from './types'

export const foodPhotographyContent: ServiceContent = {
  seo: {
    title: {
      es: 'Fotografía Gastronómica para Restaurantes en RD | Menú, Redes y Publicidad',
      en: 'Restaurant Food Photography in the Dominican Republic | Menu, Social & Ads',
    },
    description: {
      es: 'Fotografía y video para restaurantes en Santo Domingo y Punta Cana — platos, cocina en acción, bar y ambiente. Contenido listo para menú, redes sociales y publicidad.',
      en: 'Restaurant photo and video content in Santo Domingo and Punta Cana — dishes, kitchen in action, bar, and ambiance. Content ready for menus, social media, and advertising.',
    },
    keywords: {
      es: 'fotografo gastronomico republica dominicana, fotografia de restaurantes punta cana, contenido para menu de restaurante, fotografo de comida santo domingo, fotos para redes sociales restaurante, video para restaurante rd',
      en: 'food photographer dominican republic, restaurant photography punta cana, restaurant menu content photography, food photographer santo domingo, restaurant social media photos, restaurant video content DR',
    },
  },
  schemaAdditionalType: 'https://schema.org/ProfessionalService',

  // ── HERO GALLERY ────────────────────────────────────────────────────
  // Real Capitán Cook shoot — grill action + fresh catch + finished plate.
  heroGallery: [
    'https://res.cloudinary.com/dwewurxla/image/upload/v1788232682/Babula_Shots_RD_-4_k7szey.webp',
    'https://res.cloudinary.com/dwewurxla/image/upload/v1788232682/Babula_Shots_RD_-2_yejurk.webp',
    'https://res.cloudinary.com/dwewurxla/image/upload/v1788232703/Babula_Shots_RD_-22_vbsv9i.webp',
  ],

  // ── LONG-FORM GALLERY ────────────────────────────────────────────────
  longFormGallery: [
    {
      src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788232682/Babula_Shots_RD_-2_yejurk.webp',
      alt: { es: 'Bartender sirviendo una copa de vino blanco en el bar de un restaurante en Punta Cana', en: 'Bartender pouring a glass of white wine at a Punta Cana restaurant bar' },
    },
    {
      src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788232690/Babula_Shots_RD_-12_m19p23.webp',
      alt: { es: 'Bartender preparando un cóctel, sirviendo desde una coctelera', en: 'Bartender preparing a cocktail, pouring from a shaker' },
    },
    {
      src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788232695/Babula_Shots_RD_-14_xdn5wu.webp',
      alt: { es: 'Mesero anotando una orden en una mesa bajo un techo de palapa', en: 'Waiter taking an order tableside under a palapa roof' },
    },
    {
      src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788232697/Babula_Shots_RD_-18_wa9uuc.webp',
      alt: { es: 'Cortando jamón serrano a mano en la mesa de un restaurante', en: 'Hand-carving Serrano ham tableside at a restaurant' },
    },
    {
      src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788232705/Babula_Shots_RD_-25_fmiqbq.webp',
      alt: { es: 'Comensales disfrutando el almuerzo en un restaurante frente a la playa', en: 'Guests enjoying lunch at a beachfront restaurant' },
    },
    {
      src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788232710/Babula_Shots_RD_-28_wo2pgt.webp',
      alt: { es: 'Grupo de amigos compartiendo vino y platos de mariscos en la mesa', en: 'Group of friends sharing wine and seafood dishes at the table' },
    },
  ],

  // ── PRE-PROCESS GALLERY (behind-the-scenes, before "Cómo trabajamos") ──
  preProcessGallery: [
    {
      src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788232683/Babula_Shots_RD_-5_u1yiqx.webp',
      alt: { es: 'Chef sosteniendo una langosta recién sacada de la parrilla en la cocina abierta', en: 'Chef holding a lobster fresh off the grill in the open kitchen' },
    },
    {
      src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788232688/Babula_Shots_RD_-9_qb1bjc.webp',
      alt: { es: 'Chef cocinando paellas de mariscos en varias sartenes a la vez', en: 'Chef cooking seafood paellas across several pans at once' },
    },
  ],

  // ── GEO COVERAGE ────────────────────────────────────────────────────
  // 2 markets: Punta Cana (real flagship client — Restaurante Capitán
  // Cook, verified) and Santo Domingo (general restaurant market —
  // written distinctly from commercial-branding-photography's existing
  // Santo Domingo restaurant copy, not restated).
  geoCoverage: [
    {
      citySlug: 'punta-cana',
      cityName: { es: 'Punta Cana', en: 'Punta Cana' },
      image: {
        src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788232685/Babula_Shots_RD_-7_a1psxm.webp',
        alt: { es: 'Dos chefs preparando langosta y cangrejo frescos sobre una mesa de trabajo', en: 'Two chefs preparing fresh lobster and crab on a prep table' },
      },
      intro: {
        es: 'Punta Cana vive de su oferta gastronómica frente al mar — restaurantes de mariscos, cocinas abiertas y bares de playa donde la comida es tan parte de la experiencia como la vista. Ya trabajamos con Restaurante Capitán Cook, cubriendo su cocina de mariscos en un solo día: langosta y pescado fresco sobre hielo, la parrilla en plena acción, el bar preparando cócteles, y el salón lleno bajo el techo de palapa. El resultado es una librería de contenido real que el restaurante puede usar en menú, redes y campañas — no fotos de stock genéricas.',
        en: "Punta Cana lives on its beachfront dining scene — seafood restaurants, open kitchens, and beach bars where the food is as much a part of the experience as the view. We've already worked with Restaurante Capitán Cook, covering their seafood kitchen in a single day: fresh lobster and fish on ice, the grill in full swing, the bar mixing cocktails, and a full dining room under the palapa roof. The result is a real content library the restaurant can use across menu, social, and campaigns — not generic stock photography.",
      },
      venues: {
        es: [
          'Restaurante Capitán Cook — cocina de mariscos frente al mar, cliente real',
          'Restaurantes de playa con cocina abierta — parrilla y preparación a la vista',
          'Bares de resort y beach clubs — cócteles y ambiente',
          'Restaurantes dentro de hoteles — cobertura de menú completo',
        ],
        en: [
          'Restaurante Capitán Cook — beachfront seafood kitchen, real client',
          'Beachfront restaurants with open kitchens — grill and prep in full view',
          'Resort bars and beach clubs — cocktails and ambiance',
          'In-hotel restaurants — full menu coverage',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Ya han fotografiado algún restaurante en Punta Cana?',
            en: 'Have you already photographed a restaurant in Punta Cana?',
          },
          answer: {
            es: 'Sí — Restaurante Capitán Cook, un restaurante de mariscos en la zona hotelera. Cubrimos cocina, parrilla, bar, platos servidos y ambiente del salón en una sola sesión. Las fotos de esta página son de ese trabajo real.',
            en: "Yes — Restaurante Capitán Cook, a seafood restaurant in the hotel zone. We covered the kitchen, grill, bar, plated dishes, and dining room ambiance in a single session. The photos on this page are from that real shoot.",
          },
        },
      ],
    },
    {
      citySlug: 'santo-domingo',
      cityName: { es: 'Santo Domingo', en: 'Santo Domingo' },
      intro: {
        es: 'En Santo Domingo trabajamos con restaurantes que necesitan renovar su contenido visual para delivery, redes sociales o un rediseño de menú — sin depender de fotos tomadas con el celular en un turno ocupado. Coordinamos el rodaje según el horario del restaurante (antes de abrir o entre turnos) para no interrumpir el servicio, y entregamos un set organizado por categoría de plato listo para subir directo a Uber Eats, Instagram o el menú impreso.',
        en: 'In Santo Domingo we work with restaurants that need to refresh their visual content for delivery apps, social media, or a menu redesign — without relying on phone photos snapped during a busy shift. We schedule the shoot around the restaurant\'s hours (before opening or between shifts) so service isn\'t interrupted, and deliver a set organized by dish category, ready to upload straight to Uber Eats, Instagram, or a printed menu.',
      },
      venues: {
        es: [
          'Restaurantes independientes — renovación de contenido para menú y delivery',
          'Cafés y brunch spots — contenido para redes sociales',
          'Bares y coctelerías — fotografía de bebidas y ambiente nocturno',
          'Cadenas locales — cobertura consistente entre varias sucursales',
        ],
        en: [
          'Independent restaurants — menu and delivery content refresh',
          'Cafés and brunch spots — social media content',
          'Bars and cocktail lounges — drink photography and nighttime ambiance',
          'Local chains — consistent coverage across multiple locations',
        ],
      },
      miniFaq: [
        {
          question: {
            es: '¿Pueden fotografiar antes de que abra el restaurante?',
            en: "Can you shoot before the restaurant opens?",
          },
          answer: {
            es: 'Sí — es lo más común. Coordinamos el rodaje en horario de preparación o entre turnos para no afectar el servicio a comensales reales.',
            en: "Yes — that's the most common setup. We schedule the shoot during prep hours or between shifts so real diners are never affected.",
          },
        },
      ],
    },
  ],

  differentiators: [
    {
      title: { es: 'Trabajo real, no solo un portafolio de muestra', en: 'Real work, not just a sample portfolio' },
      proof: { es: 'Las fotos de esta página son de un cliente real — Restaurante Capitán Cook — no un shoot de práctica.', en: "The photos on this page are from a real client — Restaurante Capitán Cook — not a practice shoot." },
    },
    {
      title: { es: 'Cobertura completa en una sola sesión', en: 'Full coverage in a single session' },
      proof: { es: 'Cocina, bar, platos servidos y ambiente del salón — todo en el mismo día, sin sesiones separadas.', en: 'Kitchen, bar, plated dishes, and dining room ambiance — all in the same day, no separate sessions.' },
    },
    {
      title: { es: 'Horario que no interrumpe el servicio', en: "Scheduling that doesn't interrupt service" },
      proof: { es: 'Coordinamos el rodaje en horas de preparación o entre turnos.', en: 'We schedule the shoot during prep hours or between shifts.' },
    },
  ],

  processSteps: [
    {
      title: { es: 'Conversación con el chef o el equipo', en: 'Conversation with the chef or team' },
      description: { es: 'Definimos qué platos, bebidas y espacios son prioridad antes de llegar — no improvisamos la lista el día del rodaje.', en: "We define which dishes, drinks, and spaces are the priority before we arrive — the shot list isn't improvised on the day." },
    },
    {
      title: { es: 'Rodaje en horario del restaurante', en: "Shoot on the restaurant's schedule" },
      description: { es: 'Cubrimos cocina en acción, platos recién montados, bar y ambiente, coordinando con el flujo real de servicio.', en: 'We cover the kitchen in action, freshly plated dishes, the bar, and ambiance, working around the real flow of service.' },
    },
    {
      title: { es: 'Selección y edición', en: 'Selection and editing' },
      description: { es: 'Entregamos las mejores tomas editadas, organizadas por categoría (platos, bebidas, cocina, ambiente) para que el equipo las use directo.', en: 'We deliver the best edited shots, organized by category (dishes, drinks, kitchen, ambiance) so the team can use them directly.' },
    },
    {
      title: { es: 'Entrega lista para usar', en: 'Delivery ready to use' },
      description: { es: 'Galería privada con fotos en alta resolución, listas para menú, redes, delivery y publicidad.', en: 'Private gallery with high-resolution photos, ready for menu, social, delivery apps, and advertising.' },
    },
  ],

  trust: {
    expertBio: {
      es: 'Fotografía gastronómica pensada para uso real: menú, redes sociales, plataformas de delivery y campañas publicitarias — no solo imágenes bonitas sin propósito comercial.',
      en: 'Food photography built for real use: menu, social media, delivery platforms, and ad campaigns — not just pretty images with no commercial purpose.',
    },
    authoritySignals: {
      es: ['Cobertura completa: platos, cocina, bar y ambiente en una sesión', 'Coordinación de horario para no afectar el servicio', 'Entrega organizada por categoría, lista para usar'],
      en: ['Full coverage: dishes, kitchen, bar, and ambiance in one session', 'Schedule coordination so service is never affected', 'Delivery organized by category, ready to use'],
    },
    testimonials: [],
    caseStudy: {
      title: { es: 'Caso real: Restaurante Capitán Cook, Punta Cana', en: 'Real case: Restaurante Capitán Cook, Punta Cana' },
      challenge: { es: 'El restaurante necesitaba contenido visual real —no solo fotos de celular— para menú, redes sociales y material promocional.', en: "The restaurant needed real visual content — not phone photos — for its menu, social media, and promotional material." },
      solution: { es: 'Cobertura de un día completo: langosta y pescado fresco sobre hielo, la parrilla en acción, el bar preparando cócteles, platos servidos y el salón bajo la palapa con comensales reales.', en: 'A full-day shoot: fresh lobster and fish on ice, the grill in action, the bar mixing cocktails, plated dishes, and the dining room under the palapa with real guests.' },
      result: { es: 'Una librería de contenido organizada por categoría — platos, cocina, bar, ambiente — lista para menú, redes sociales y publicidad, sin depender de fotos de stock.', en: 'A content library organized by category — dishes, kitchen, bar, ambiance — ready for menu, social media, and advertising, with no reliance on stock photography.' },
    },
  },

  // ── CUISINE SHOWCASE GALLERIES ──────────────────────────────────────
  // Fixed-grid portfolio work by cuisine type, rendered before the FAQ.
  cuisineGalleries: [
    {
      id: 'mexican',
      title: { es: 'Fotografía de comida mexicana', en: 'Mexican food photography' },
      intro: {
        es: 'No todo restaurante es de mariscos frente al mar. Este set muestra el mismo nivel de cobertura aplicado a cocina mexicana — platos fuertes, antojitos y coctelería — con la iluminación y composición que un menú o una campaña de redes necesita.',
        en: "Not every restaurant is beachfront seafood. This set shows the same level of coverage applied to Mexican cuisine — mains, antojitos, and cocktails — with the lighting and composition a menu or social campaign needs.",
      },
      images: [
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239237/fotografo_alimentos_y_bebida_dg6vsn.webp', width: 1433, height: 1843, alt: { es: 'Quesadillas cortadas en triángulos con guacamole, crema y pico de gallo en un plato de barro sobre mantel mexicano de rayas', en: 'Sliced quesadilla triangles with guacamole, sour cream, and pico de gallo on a clay plate over a striped Mexican tablecloth' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239238/servicio_de_fotografia_alimentos_la_romana_k5as2c.webp', width: 1433, height: 1843, alt: { es: 'Chiles rellenos gratinados con queso derretido, servidos en plato pintado a mano', en: 'Cheese-smothered stuffed poblano peppers (chiles rellenos) on a hand-painted plate' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239239/servicio_de_fotografia_alimentos_punta_cana_ggcttz.webp', width: 1433, height: 1843, alt: { es: 'Copa de coctel de camarones con limón y salsa, sobre mantel artesanal tejido', en: 'Shrimp cocktail in a glass with lime and sauce, on a handwoven placemat' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239242/servicio_de_fotografia_alimentos_rd_zfja7l.webp', width: 1433, height: 1843, alt: { es: 'Michelada con borde de sal y limón junto a totopos', en: 'Michelada beer cocktail with a salted rim and lime, served with tortilla chips' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239243/servicio_de_fotografia_alimentos_republica_dominicana_pwplv7.webp', width: 1433, height: 1843, alt: { es: 'Chiles poblanos rellenos de queso fresco sobre cama de frijoles refritos, decorados con tomate y aguacate', en: 'Poblano peppers stuffed with fresh cheese over a bed of refried beans, garnished with tomato and avocado' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239244/servicio_de_fotografia_alimentos_santo_domingo_qzixag.webp', width: 1433, height: 1843, alt: { es: 'Camarones a la diabla en salsa roja picante servidos en tazón de barro', en: 'Shrimp in spicy red "a la diabla" sauce served in a clay bowl' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239246/servicio_de_fotografia_alimentos_y_bebida_t1mnfm.webp', width: 1433, height: 1843, alt: { es: 'Margarita con borde de sal junto a chiles frescos y tomates cherry', en: 'Salt-rimmed margarita next to fresh chiles and cherry tomatoes' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239247/servicio_de_fotografia_alimentos_wwk4fq.webp', width: 1433, height: 1843, alt: { es: 'Burrito cortado a la mitad relleno de carne y vegetales sobre tabla de madera', en: 'Burrito sliced in half, filled with meat and vegetables, on a wooden board' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239248/servicio_de_fotografia_para_restaurantes_puerto_plata_sret4f.webp', width: 1433, height: 1843, alt: { es: 'Tacos de carne en tortillas de maíz con guacamole y pico de gallo, sobre tabla de madera', en: 'Meat tacos on corn tortillas with guacamole and pico de gallo, on a wooden board' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239251/servicio_de_fotografia_para_restaurantes_punta_cana_bavaro_ecg7dd.webp', width: 1433, height: 1843, alt: { es: 'Burrito envuelto con lechuga, tomate y cebolla morada asomando por el corte', en: 'Wrapped burrito with lettuce, tomato, and red onion visible at the cut' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239251/servicio_de_fotografia_para_restaurantes_punt_cana_zlakqa.webp', width: 1433, height: 1843, alt: { es: 'Taco servido en concha crujiente de tortilla con carne guisada y pico de gallo', en: 'Taco served in a crispy tortilla shell with stewed meat and pico de gallo' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239481/servicio_de_fotografia_para_restaurantes_rd_ci0vol.webp', width: 1433, height: 1843, alt: { es: 'Fajitas de res salteadas con pimientos verdes en sartén de hierro fundido', en: 'Sizzling beef fajitas with green peppers in a cast-iron skillet' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239482/servicio_de_fotografia_para_restaurantes_republica_domincicana_lyhttp.webp', width: 1433, height: 1843, alt: { es: 'Fajitas de res con pimientos rojos, verdes y amarillos servidas en plato de hierro', en: 'Beef fajitas with red, green, and yellow peppers served on a cast-iron platter' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239484/servicio_de_fotografia_para_restaurantes_santiago_de_loos_caballeros_gduebb.webp', width: 1433, height: 1843, alt: { es: 'Burrito relleno servido junto a limón y tomates cherry sobre plato de barro', en: 'Filled burrito served with lime and cherry tomatoes on a clay plate' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788239485/servicio_de_fotografia_para_restaurantes_santo_domingo_raubyz.webp', width: 1433, height: 1843, alt: { es: 'Margarita con borde de sal decorada con una rodaja de limón', en: 'Salt-rimmed margarita garnished with a lime wheel' } },
      ],
    },
    {
      id: 'italian',
      title: { es: 'Fotografía de comida italiana', en: 'Italian food photography' },
      intro: {
        es: 'Pastas, pizzas y postres necesitan su propio lenguaje visual — texturas, vapor, el brillo del aceite. Este set cubre desde platos de autor hasta pizza al horno de leña, con la misma consistencia de iluminación en toda la sesión.',
        en: 'Pastas, pizzas, and desserts need their own visual language — texture, steam, the sheen of good oil. This set covers everything from plated fine-dining pasta to wood-fired pizza, with the same lighting consistency across the whole session.',
      },
      images: [
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238762/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_3_llz0gw.webp', width: 716, height: 921, alt: { es: 'Pasta tubular con vegetales verdes y salsa ligera, servida en plato azul oscuro', en: 'Tube pasta with green vegetables in a light sauce, served on a dark blue plate' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238762/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_1_ampvii.webp', width: 716, height: 921, alt: { es: 'Berenjenas a la parmesana gratinadas con queso sobre pasta y salsa de tomate', en: 'Eggplant parmesan gratinated with cheese over pasta in tomato sauce' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238763/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_4_du3eoz.webp', width: 716, height: 921, alt: { es: 'Pasta tubular con tomates cherry, albahaca fresca y salsa de tomate', en: 'Tube pasta with cherry tomatoes, fresh basil, and tomato sauce' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238763/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_2_y9pnmz.webp', width: 716, height: 921, alt: { es: 'Torre de berenjena y calabacín gratinado con queso parmesano y albahaca', en: 'Stacked eggplant and zucchini gratin topped with parmesan cheese and basil' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238766/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_6_jeryrb.webp', width: 716, height: 921, alt: { es: 'Prosciutto y rúcula con parmesano en plato hondo blanco', en: 'Prosciutto and arugula salad with shaved parmesan in a white bowl' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238766/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_5_zw808r.webp', width: 716, height: 921, alt: { es: 'Torre de pasta fresca enrollada sobre salsa de albahaca verde', en: 'Rolled fresh pasta tower plated over a green basil sauce' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238767/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_7_ki9bqp.webp', width: 716, height: 921, alt: { es: 'Ensalada de rúcula con jamón serrano y parmesano en plato hondo', en: 'Arugula salad with Serrano ham and shaved parmesan in a shallow bowl' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238769/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_9_pzyxlf.webp', width: 716, height: 921, alt: { es: 'Pasta carbonara con panceta y queso parmesano en plato negro', en: 'Carbonara pasta with pancetta and parmesan cheese on a black plate' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238770/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_10_s3cv6z.webp', width: 716, height: 921, alt: { es: 'Pasta al huevo con jamón serrano y parmesano, acompañada de una copa de vino blanco', en: 'Egg pasta with Serrano ham and parmesan, served alongside a glass of white wine' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238772/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_11_gmmxuu.webp', width: 716, height: 921, alt: { es: 'Ravioles rellenos servidos en plato oscuro sobre mesa de madera', en: 'Stuffed ravioli served on a dark plate over a wooden table' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238773/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_13_ghdpoq.webp', width: 716, height: 921, alt: { es: 'Fettuccine con jamón serrano en plato rojo decorado', en: 'Fettuccine with Serrano ham on a decorated red plate' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238775/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_14_cn4vpl.webp', width: 716, height: 921, alt: { es: 'Copa de vino blanco junto a un plato de pasta con jamón serrano y parmesano', en: 'A glass of white wine beside a plate of pasta with Serrano ham and parmesan' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238777/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_16_j1ar8e.webp', width: 716, height: 921, alt: { es: 'Ravioles de espinaca y queso servidos en bowl junto a utensilios de cocina', en: 'Spinach and cheese ravioli served in a bowl next to kitchen utensils' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238779/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_17_vbjpo9.webp', width: 716, height: 921, alt: { es: 'Penne en salsa de tomate con albahaca fresca y parmesano rallado', en: 'Penne in tomato sauce with fresh basil and grated parmesan' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238781/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_19_epiy2x.webp', width: 716, height: 921, alt: { es: 'Pizza margarita horneada en horno de leña con mozzarella y albahaca', en: 'Wood-fired margherita pizza with mozzarella and basil' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238782/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_21_iobnuu.webp', width: 716, height: 921, alt: { es: 'Ravioles de espinaca y verdes con albahaca fresca en plato azul', en: 'Spinach and green ravioli with fresh basil on a blue plate' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238782/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_20_fyyjki.webp', width: 716, height: 921, alt: { es: 'Pizza de pepperoni horneada en molde de hierro sobre mesa rústica', en: 'Pepperoni pizza baked in a cast-iron pan on a rustic table' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238783/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_22_tms6ny.webp', width: 716, height: 921, alt: { es: 'Ravioles verdes y rojos servidos en plato blanco con especias', en: 'Green and red ravioli served on a white plate with spices' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238785/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_23_fvx7o0.webp', width: 716, height: 921, alt: { es: 'Porción de cheesecake decorada con flores comestibles junto a una copa de vino tinto', en: 'A slice of cheesecake garnished with edible flowers, served beside a glass of red wine' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238786/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_24_lkyphr.webp', width: 716, height: 921, alt: { es: 'Cheesecake entero decorado con hoja de menta sobre mesa de madera oscura', en: 'Whole cheesecake garnished with a mint leaf on a dark wood table' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238788/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_26_z7wdrb.webp', width: 716, height: 921, alt: { es: 'Camarones y vieiras a la plancha sobre calabacín en plato hondo', en: 'Grilled shrimp and scallops over zucchini in a shallow bowl' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238789/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_27_puj2bz.webp', width: 716, height: 921, alt: { es: 'Camarones grandes a la plancha servidos sobre puré verde', en: 'Large grilled shrimp served over a green purée' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238791/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_29_fgibru.webp', width: 716, height: 921, alt: { es: 'Camarones y vieiras salteados con hierbas en plato azul', en: 'Sautéed shrimp and scallops with herbs on a blue plate' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238792/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_30_ud6gq5.webp', width: 716, height: 921, alt: { es: 'Tagliatelle con jamón serrano, tomates cherry y albahaca en plato hondo', en: 'Tagliatelle with Serrano ham, cherry tomatoes, and basil in a shallow bowl' } },
        { src: 'https://res.cloudinary.com/dwewurxla/image/upload/v1788238794/Fotografo_para_restaurantes_y_comida_en_Santo_Domingo_Republica_Dominicana_31_xxuluh.webp', width: 716, height: 921, alt: { es: 'Pappardelle en salsa cremosa con hierbas, servida junto a cubiertos', en: 'Pappardelle in a creamy herb sauce, served with cutlery' } },
      ],
    },
  ],

  faqs: [
    {
      question: { es: '¿Cuánto cuesta la fotografía gastronómica para un restaurante?', en: 'How much does restaurant food photography cost?' },
      answer: { es: 'Desde $350 para una sesión de 90 minutos enfocada en platos y bebidas. La cobertura completa (cocina, bar, platos y ambiente) comienza en $700 por 3 horas.', en: 'Starting at $350 for a 90-minute session focused on dishes and drinks. Full coverage (kitchen, bar, dishes, and ambiance) starts at $700 for 3 hours.' },
    },
    {
      question: { es: '¿Incluyen video además de fotos?', en: 'Do you include video in addition to photos?' },
      answer: { es: 'El paquete "Contenido Total" incluye video en bruto horizontal y vertical, ideal para reels e Instagram Stories. Los paquetes más pequeños son solo fotografía.', en: 'The "Total Content" package includes raw horizontal and vertical video, ideal for reels and Instagram Stories. Smaller packages are photography only.' },
    },
    {
      question: { es: '¿Necesito cerrar el restaurante para el rodaje?', en: 'Do I need to close the restaurant for the shoot?' },
      answer: { es: 'No. Coordinamos el horario según la operación del restaurante — antes de abrir, entre turnos, o durante un servicio real si el objetivo es capturar el ambiente con comensales.', en: "No. We schedule around the restaurant's actual operation — before opening, between shifts, or during real service if the goal is capturing ambiance with guests present." },
    },
    {
      question: { es: '¿Trabajan con food stylist?', en: 'Do you work with a food stylist?' },
      answer: { es: 'Para la mayoría de restaurantes fotografiamos los platos tal como los sirve la cocina. Si el proyecto necesita food styling adicional, lo coordinamos como parte de un proyecto personalizado.', en: "For most restaurants we photograph dishes exactly as the kitchen plates them. If a project needs additional food styling, we coordinate that as part of a custom project." },
    },
    {
      question: { es: '¿En cuánto tiempo entregan las fotos?', en: 'How soon do you deliver the photos?' },
      answer: { es: '48 horas para los paquetes Esencial y Restaurante Completo. 72 horas para Contenido Total, que incluye más volumen y video.', en: '48 hours for the Essential and Full Restaurant Coverage packages. 72 hours for Total Content, which includes higher volume and video.' },
    },
  ],

  internalLinks: [
    {
      href: '/portfolio?category=food',
      label: { es: 'Ver fotografía gastronómica', en: 'See food photography work' },
      description: { es: 'Trabajo real de Restaurante Capitán Cook y otros proyectos.', en: 'Real work from Restaurante Capitán Cook and other projects.' },
    },
    {
      href: '/get-quote',
      label: { es: 'Solicitar cotización', en: 'Request a quote' },
      description: { es: 'Cuéntanos sobre tu restaurante y armamos una propuesta.', en: 'Tell us about your restaurant and we\'ll put together a proposal.' },
    },
  ],
}
