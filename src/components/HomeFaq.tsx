'use client'

import { useState } from 'react'

const faqData = {
  es: [
    {
      question: '¿Cuánto cuesta una sesión de fotos en Santo Domingo?',
      answer: 'Las sesiones comienzan desde $75 USD para sesiones en estudio con snoot óptico (10 fotos), sesiones en Punta Cana desde $300 USD, y paquetes de boda con diferentes niveles: Essential, Signature y Luxury. Contáctanos para un presupuesto personalizado según tu evento.',
    },
    {
      question: '¿Qué servicios de fotografía ofrecen en República Dominicana?',
      answer: 'Ofrecemos fotografía de bodas, sesiones pre boda, quinceañeras, cumpleaños, retratos exteriores e interiores, fotografía de moda y pasarela, fotografía corporativa, cobertura de eventos, sesiones en estudio con snoot óptico, fotografía con drone certificado, fotografía en Isla Saona, Punta Cana, Tortuga Bay y toda República Dominicana.',
    },
    {
      question: '¿Cubren bodas y sesiones en Punta Cana y el resto del país?',
      answer: 'Sí — cubrimos toda República Dominicana. Trabajamos en Santo Domingo, Punta Cana, Bávaro, Playa Macao, Cap Cana, Isla Saona, Tortuga Bay, Casa de Campo, La Romana, Santiago, San Pedro de Macorís, Puerto Plata, Zona Colonial y cualquier locación que elijas para tu sesión.',
    },
    {
      question: '¿Cuándo recibo las fotos después de la sesión?',
      answer: 'Las fotos editadas en alta resolución se entregan en 48–72 horas a través de una galería online privada lista para descargar y compartir. Para bodas y eventos de mayor duración el plazo puede extenderse — lo coordinamos contigo antes de la sesión.',
    },
    {
      question: '¿Se requiere un depósito para reservar?',
      answer: 'Sí — requerimos un depósito no reembolsable del 50% del costo total al momento de reservar para asegurar tu fecha y hora. El 50% restante se paga el día de la sesión antes de comenzar. Aceptamos efectivo, transferencia bancaria y pago online.',
    },
    {
      question: '¿Puedo cambiar o cancelar mi reserva?',
      answer: 'Permitimos cambios de fecha u hora hasta 72 horas antes de la sesión, siempre que haya disponibilidad. En caso de cancelación el depósito no es reembolsable. Si hay condiciones climáticas adversas que afecten la sesión, la reprogramamos sin costo adicional.',
    },
    {
      question: '¿Trabajan con clientes internacionales que viajan a República Dominicana?',
      answer: 'Sí — la mayoría de nuestros clientes de bodas, sesiones pre boda y Punta Cana son internacionales. Hablamos español e inglés. Toda la coordinación se puede hacer online antes de tu llegada al país — videollamada, WhatsApp o email.',
    },
    {
      question: '¿Hacen fotografía de moda y trabajos con diseñadores dominicanos?',
      answer: 'Sí — tenemos amplia experiencia en fotografía de moda editorial, pasarelas y lookbooks. Hemos trabajado con diseñadores dominicanos reconocidos como Leonel Lirio y Angel Sanchez, y cubrimos eventos como Fashion Week Santo Domingo.',
    },
    {
      question: '¿Tienen servicio de drone para fotos y videos aéreos?',
      answer: 'Sí — contamos con piloto de drone certificado para fotografía y video aéreo en toda República Dominicana. Ideal para bodas en la playa, real estate, eventos y proyectos de drone en Punta Cana. Visita dron.babulashotsrd.com para más información.',
    },
    {
      question: '¿Cómo puedo ver ejemplos de su trabajo antes de reservar?',
      answer: 'Puedes ver nuestro portafolio completo en la sección de galería de este sitio, en nuestra galería online en pic-time, y en nuestro Instagram @babulashotsrd donde publicamos sesiones recientes de bodas, moda, retratos y más.',
    },
  ],
  en: [
    {
      question: 'How much does a photo session in Santo Domingo cost?',
      answer: 'Sessions start from $75 USD for studio sessions with optical snoot (10 photos), Punta Cana sessions from $300 USD, and wedding packages at different levels: Essential, Signature and Luxury. Contact us for a custom quote based on your event.',
    },
    {
      question: 'What photography services do you offer in Dominican Republic?',
      answer: 'We offer wedding photography, pre-wedding sessions, quinceañeras, birthday sessions, outdoor and indoor portraits, fashion and runway photography, corporate photography, event coverage, studio sessions with optical snoot, certified drone photography, sessions at Saona Island, Punta Cana, Tortuga Bay and all of Dominican Republic.',
    },
    {
      question: 'Do you cover weddings and sessions in Punta Cana and the rest of the country?',
      answer: 'Yes — we cover all of Dominican Republic. We work in Santo Domingo, Punta Cana, Bavaro, Macao Beach, Cap Cana, Saona Island, Tortuga Bay, Casa de Campo, La Romana, Santiago, San Pedro de Macorís, Puerto Plata, Zona Colonial and any location you choose for your session.',
    },
    {
      question: 'When do I receive the photos after the session?',
      answer: 'Edited high-resolution photos are delivered within 48–72 hours through a private online gallery ready to download and share. For weddings and longer events the timeframe may be extended — we coordinate this with you before the session.',
    },
    {
      question: 'Is a deposit required to book?',
      answer: 'Yes — we require a non-refundable deposit of 50% of the total cost at the time of booking to secure your date and time. The remaining 50% is paid on the day of the session before we begin. We accept cash, bank transfer and online payment.',
    },
    {
      question: 'Can I change or cancel my booking?',
      answer: 'We allow date or time changes up to 72 hours before the session, subject to availability. In case of cancellation the deposit is non-refundable. If adverse weather conditions affect the session, we reschedule at no additional cost.',
    },
    {
      question: 'Do you work with international clients traveling to Dominican Republic?',
      answer: 'Yes — most of our wedding, pre-wedding and Punta Cana clients are international. We speak Spanish and English. All coordination can be done online before your arrival — video call, WhatsApp or email.',
    },
    {
      question: 'Do you do fashion photography and work with Dominican designers?',
      answer: 'Yes — we have extensive experience in editorial fashion photography, runway shows and lookbooks. We have worked with recognized Dominican designers including Leonel Lirio and Angel Sanchez, and covered events such as Fashion Week Santo Domingo.',
    },
    {
      question: 'Do you offer drone photography and aerial video services?',
      answer: 'Yes — we have a certified drone pilot for aerial photography and video across all of Dominican Republic. Ideal for beach weddings, real estate, events and drone projects in Punta Cana. Visit dron.babulashotsrd.com for more information.',
    },
    {
      question: 'How can I see examples of your work before booking?',
      answer: 'You can view our full portfolio in the gallery section of this site, in our online gallery on pic-time, and on our Instagram @babulashotsrd where we regularly post recent wedding, fashion, portrait and event sessions.',
    },
  ],
}

export function getFaqData(locale: string) {
  return faqData[locale as 'es' | 'en'] ?? faqData.es
}

export default function HomeFaq({ locale }: { locale: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqs = getFaqData(locale)
  const isEs = locale === 'es'

  return (
    <section className="py-24 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-block text-primary-400 text-sm font-semibold tracking-widest uppercase mb-3">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-gray-400 text-lg">
              {isEs
                ? 'Todo lo que necesitas saber antes de reservar tu sesión en Santo Domingo'
                : 'Everything you need to know before booking your session in Santo Domingo'}
            </p>
          </div>

          {/* Accordion */}
          <div className="divide-y divide-gray-800">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div key={index}>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-start justify-between gap-6 py-5 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-base font-medium leading-snug transition-colors ${isOpen ? 'text-primary-400' : 'text-white group-hover:text-primary-300'}`}>
                      {faq.question}
                    </span>
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all mt-0.5 ${
                      isOpen
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400 rotate-45'
                        : 'border-gray-700 text-gray-500 group-hover:border-primary-600 group-hover:text-primary-400'
                    }`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pb-5 pr-10">
                      <p className="text-gray-400 leading-relaxed text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-4">
              {isEs ? '¿Tienes otra pregunta?' : 'Have another question?'}
            </p>
            <a
              href={`https://wa.me/18097209547?text=${encodeURIComponent(isEs ? 'Hola! Tengo una pregunta sobre sus servicios.' : 'Hi! I have a question about your services.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              {isEs ? 'Pregúntanos por WhatsApp' : 'Ask us on WhatsApp'}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
