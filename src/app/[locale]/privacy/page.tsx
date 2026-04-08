import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  const title = isEs
    ? 'Política de Privacidad — Fotógrafo Santo Domingo'
    : 'Privacy Policy — Photographer Santo Domingo'
  const description = isEs
    ? 'Política de privacidad de fotografosantodomingo.com. Cómo recopilamos, usamos y protegemos tu información personal.'
    : 'Privacy policy for fotografosantodomingo.com. How we collect, use and protect your personal information.'
  return {
    title,
    description,
    keywords: isEs
      ? 'política privacidad fotografía santo domingo, protección datos fotografosantodomingo, GDPR fotografía RD'
      : 'privacy policy photography santo domingo, data protection fotografosantodomingo, photography DR privacy',
    alternates: {
      canonical: `${BASE_URL}/${locale}/privacy`,
      languages: { es: `${BASE_URL}/es/privacy`, en: `${BASE_URL}/en/privacy`, 'x-default': `${BASE_URL}/es/privacy` },
    },
    openGraph: {
      type: 'website',
      siteName: 'Fotografo Santo Domingo | Babula Shots',
      title,
      description,
      url: `${BASE_URL}/${locale}/privacy`,
      locale: isEs ? 'es_DO' : 'en_US',
      images: [{ url: `${BASE_URL}/api/og`, width: 1200, height: 630, alt: 'Fotografo Santo Domingo | Babula Shots' }],
    },
    twitter: {
      card: 'summary',
      site: '@babulashots',
      title,
      description,
    },
    robots: { index: true, follow: true },
  }
}

export default function PrivacyPage({ params: { locale } }: Props) {
  const isEs = locale === 'es'

  return (
    <main className="min-h-screen bg-gray-950 text-gray-200 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-sky-400 hover:text-sky-300 text-sm mb-10 transition-colors"
        >
          ← {isEs ? 'Volver al inicio' : 'Back to home'}
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">
          {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
        </h1>
        <p className="text-gray-500 text-sm mb-10">
          {isEs ? 'Última actualización: 7 de abril de 2026' : 'Last updated: April 7, 2026'}
        </p>

        <div className="space-y-10 prose-policy">

          {/* 1 */}
          <Section title={isEs ? '1. Introducción' : '1. Introduction'}>
            {isEs ? (
              <>
                <p>Bienvenido a fotografosantodomingo.com. Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando visitas nuestro sitio web o nos contactas para contratar una sesión fotográfica en Santo Domingo, República Dominicana.</p>
                <p className="mt-3">Al utilizar este sitio web aceptas los términos descritos en esta Política de Privacidad. Si no estás de acuerdo, por favor no utilices nuestro sitio web.</p>
                <p className="mt-3">Este sitio web es operado por Fotografo Santo Domingo, un servicio de fotografía profesional con sede en Santo Domingo, República Dominicana. Para cualquier consulta relacionada con privacidad puedes contactarnos en <a href="mailto:info@fotografosantodomingo.com" className="text-sky-400 hover:text-sky-300">info@fotografosantodomingo.com</a> o por WhatsApp al <a href="https://wa.me/18097209547" className="text-sky-400 hover:text-sky-300">+1 809 720 9547</a>.</p>
              </>
            ) : (
              <>
                <p>Welcome to fotografosantodomingo.com. This Privacy Policy explains how we collect, use, store and protect your personal information when you visit our website or contact us to book a photography session in Santo Domingo, Dominican Republic.</p>
                <p className="mt-3">By using this website you agree to the terms described in this Privacy Policy. If you do not agree, please do not use our website.</p>
                <p className="mt-3">This website is operated by Fotografo Santo Domingo, a professional photography service based in Santo Domingo, Dominican Republic. For any privacy-related questions you can contact us at <a href="mailto:info@fotografosantodomingo.com" className="text-sky-400 hover:text-sky-300">info@fotografosantodomingo.com</a> or via WhatsApp at <a href="https://wa.me/18097209547" className="text-sky-400 hover:text-sky-300">+1 809 720 9547</a>.</p>
              </>
            )}
          </Section>

          {/* 2 */}
          <Section title={isEs ? '2. Información que recopilamos' : '2. Information We Collect'}>
            {isEs ? (
              <>
                <p><strong className="text-white">Información que proporcionas directamente:</strong><br />Cuando rellenas nuestro formulario de contacto, recopilamos tu nombre, dirección de correo electrónico, número de teléfono, el tipo de servicio fotográfico que te interesa y el mensaje que nos escribes. Esta información se utiliza exclusivamente para responder a tu consulta y coordinar tu sesión fotográfica.</p>
                <p className="mt-3">Cuando te suscribes a nuestro boletín, recopilamos tu dirección de correo electrónico para enviarte actualizaciones, promociones y consejos de fotografía. Puedes darte de baja en cualquier momento.</p>
                <p className="mt-4"><strong className="text-white">Información recopilada automáticamente:</strong><br />Cuando visitas nuestro sitio web, podemos recopilar automáticamente cierta información técnica, incluida tu dirección IP, tipo de navegador, sistema operativo, páginas visitadas, tiempo dedicado a cada página y la fuente que te refirió a nuestro sitio. Esta información se recopila a través de Google Analytics y se utiliza únicamente para entender cómo los visitantes usan nuestro sitio web y así mejorar la experiencia.</p>
                <p className="mt-4"><strong className="text-white">Información de servicios de terceros:</strong><br />Nuestro sitio utiliza Cloudinary para alojar y entregar imágenes del portafolio fotográfico. Al ver imágenes en nuestro sitio, tu navegador puede interactuar con los servidores de Cloudinary. También utilizamos Supabase para almacenar de forma segura los envíos del formulario de contacto y los datos del portafolio.</p>
              </>
            ) : (
              <>
                <p><strong className="text-white">Information you provide directly:</strong><br />When you fill out our contact form, we collect your name, email address, phone number, the type of photography service you are interested in, and the message you write to us. This information is used exclusively to respond to your inquiry and coordinate your photography session.</p>
                <p className="mt-3">When you sign up for our newsletter, we collect your email address to send you updates, promotions and photography tips. You can unsubscribe at any time.</p>
                <p className="mt-4"><strong className="text-white">Information collected automatically:</strong><br />When you visit our website, we may automatically collect certain technical information including your IP address, browser type, operating system, pages visited, time spent on each page, and the source that referred you to our site. This information is collected through Google Analytics and is used only to understand how visitors use our website so we can improve it.</p>
                <p className="mt-4"><strong className="text-white">Information from third-party services:</strong><br />Our website uses Cloudinary to host and deliver photography portfolio images. When you view images on our site, your browser may interact with Cloudinary&apos;s servers. We also use Supabase to store contact form submissions and portfolio data securely.</p>
              </>
            )}
          </Section>

          {/* 3 */}
          <Section title={isEs ? '3. Cómo usamos tu información' : '3. How We Use Your Information'}>
            <p>{isEs
              ? 'Usamos la información que recopilamos para los siguientes fines:'
              : 'We use the information we collect for the following purposes:'}
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              {(isEs ? [
                'Responder a tus consultas a través del formulario de contacto y coordinar sesiones fotográficas en Santo Domingo y toda República Dominicana.',
                'Enviarte un correo electrónico de confirmación cuando envíes el formulario de contacto.',
                'Enviarte nuestro boletín si te has suscrito, del que puedes darte de baja en cualquier momento.',
                'Analizar el tráfico y el comportamiento de los usuarios en el sitio web a través de Google Analytics para mejorar la experiencia.',
                'Cumplir con las obligaciones legales aplicables en República Dominicana.',
              ] : [
                'To respond to your contact form inquiries and coordinate photography sessions in Santo Domingo and across Dominican Republic.',
                'To send you a confirmation email when you submit a contact form.',
                'To send you our newsletter if you have subscribed, which you can unsubscribe from at any time.',
                'To analyze website traffic and user behavior through Google Analytics in order to improve the website experience.',
                'To comply with legal obligations applicable in Dominican Republic.',
              ]).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="mt-3">{isEs
              ? 'No utilizamos tu información personal para la toma de decisiones automatizada ni para perfilado.'
              : 'We do not use your personal information for automated decision-making or profiling.'}
            </p>
          </Section>

          {/* 4 */}
          <Section title={isEs ? '4. Cómo almacenamos tu información' : '4. How We Store Your Information'}>
            <p>{isEs
              ? 'Los envíos del formulario de contacto se almacenan de forma segura en nuestra base de datos Supabase, alojada en la infraestructura de Amazon Web Services en los Estados Unidos. Estos datos están protegidos por Row Level Security, lo que significa que solo los administradores autorizados de fotografosantodomingo.com pueden acceder a ellos. Los visitantes anónimos no pueden leer ni acceder a ningún dato de contacto almacenado.'
              : 'Contact form submissions are stored securely in our Supabase database hosted on Amazon Web Services infrastructure in the United States. This data is protected by Row Level Security — meaning only authorized administrators of fotografosantodomingo.com can access it. Anonymous visitors cannot read or access any stored contact data.'}
            </p>
            <p className="mt-3">{isEs
              ? 'Tus datos se conservan durante el tiempo necesario para cumplir el propósito para el que fueron recopilados, normalmente durante la duración de nuestra relación comercial más un período razonable posterior para fines contables y legales.'
              : 'Your data is retained for as long as necessary to fulfill the purpose for which it was collected — typically for the duration of our business relationship plus a reasonable period thereafter for accounting and legal purposes.'}
            </p>
          </Section>

          {/* 5 */}
          <Section title={isEs ? '5. Con quién compartimos tu información' : '5. Who We Share Your Information With'}>
            <p>{isEs
              ? 'No vendemos, intercambiamos ni alquilamos tu información personal a terceros. Compartimos tu información únicamente con los siguientes proveedores de servicios que nos ayudan a operar este sitio web, y solo en la medida necesaria:'
              : 'We do not sell, trade or rent your personal information to any third parties. We share your information only with the following service providers who help us operate this website, and only to the extent necessary:'}
            </p>
            <ul className="mt-3 space-y-3 list-disc list-inside">
              <li><strong className="text-white">Google Analytics</strong> — {isEs ? 'para el análisis del tráfico del sitio web. Google puede procesar tus datos en los Estados Unidos. Puedes optar por no participar en el seguimiento de Google Analytics instalando el complemento de exclusión del navegador de Google Analytics disponible en tools.google.com/dlpage/gaoptout.' : 'for website traffic analysis. Google may process your data in the United States. You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on available at tools.google.com/dlpage/gaoptout.'}</li>
              <li><strong className="text-white">Resend</strong> — {isEs ? 'el servicio de entrega de correo electrónico que utilizamos para enviar confirmaciones y notificaciones del formulario de contacto. Tu nombre y dirección de correo electrónico se transmiten a través de la infraestructura de Resend únicamente para la entrega de correos.' : 'the email delivery service we use to send contact form confirmations and notifications. Your name and email address are transmitted through Resend\'s infrastructure solely for the purpose of delivering emails.'}</li>
              <li><strong className="text-white">Cloudinary</strong> — {isEs ? 'la plataforma de alojamiento y entrega de imágenes que utilizamos para nuestro portafolio fotográfico. Cloudinary puede procesar datos técnicos cuando las imágenes se cargan en tu navegador.' : 'the image hosting and delivery platform we use for our photography portfolio. Cloudinary may process technical data when images are loaded in your browser.'}</li>
              <li><strong className="text-white">Supabase</strong> — {isEs ? 'nuestro proveedor de base de datos donde los envíos del formulario de contacto se almacenan de forma segura.' : 'our database provider where contact form submissions are stored securely.'}</li>
            </ul>
            <p className="mt-3">{isEs
              ? 'Todos los proveedores de servicios de terceros mencionados anteriormente están sujetos a sus propias políticas de privacidad y acuerdos de protección de datos.'
              : 'All third-party service providers listed above are bound by their own privacy policies and data protection agreements. We encourage you to review their respective privacy policies.'}
            </p>
          </Section>

          {/* 6 */}
          <Section title={isEs ? '6. Cookies y rastreo' : '6. Cookies and Tracking'}>
            <p>{isEs ? 'Nuestro sitio web utiliza cookies y tecnologías de seguimiento similares para los siguientes fines:' : 'Our website uses cookies and similar tracking technologies for the following purposes:'}</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong className="text-white">{isEs ? 'Cookies esenciales' : 'Essential cookies'}</strong> — {isEs ? 'necesarias para que el sitio web funcione correctamente. No se pueden desactivar.' : 'necessary for the website to function properly. These cannot be disabled.'}</li>
              <li><strong className="text-white">{isEs ? 'Cookies analíticas' : 'Analytics cookies'}</strong> — {isEs ? 'utilizadas por Google Analytics para recopilar información anónima sobre cómo los visitantes usan nuestro sitio web. Estos datos son agregados y no te identifican personalmente.' : 'used by Google Analytics to collect anonymous information about how visitors use our website. This data is aggregated and does not identify you personally.'}</li>
            </ul>
            <p className="mt-3">{isEs
              ? 'Puedes controlar y desactivar las cookies a través de la configuración de tu navegador. Ten en cuenta que desactivar ciertas cookies puede afectar la funcionalidad de nuestro sitio.'
              : 'You can control and disable cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our website.'}
            </p>
          </Section>

          {/* 7 */}
          <Section title={isEs ? '7. Tus derechos' : '7. Your Rights'}>
            <p>{isEs ? 'Según tu ubicación y la ley aplicable, puedes tener los siguientes derechos sobre tus datos personales:' : 'Depending on your location and applicable law, you may have the following rights regarding your personal data:'}</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              {(isEs ? [
                'El derecho a acceder a los datos personales que tenemos sobre ti.',
                'El derecho a solicitar la corrección de datos personales inexactos.',
                'El derecho a solicitar la eliminación de tus datos personales, sujeto a ciertas excepciones legales.',
                'El derecho a retirar el consentimiento en cualquier momento cuando nos basamos en el consentimiento para procesar tus datos.',
                'El derecho a oponerte al tratamiento de tus datos personales.',
                'El derecho a la portabilidad de datos.',
              ] : [
                'The right to access the personal data we hold about you.',
                'The right to request correction of inaccurate personal data.',
                'The right to request deletion of your personal data, subject to certain legal exceptions.',
                'The right to withdraw consent at any time where we rely on consent to process your data.',
                'The right to object to processing of your personal data.',
                'The right to data portability.',
              ]).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="mt-3">{isEs
              ? 'Para ejercer cualquiera de estos derechos, contáctanos en info@fotografosantodomingo.com. Responderemos a tu solicitud en un plazo de 30 días.'
              : 'To exercise any of these rights, please contact us at info@fotografosantodomingo.com. We will respond to your request within 30 days.'}
            </p>
            {!isEs && <p className="mt-3">If you are located in the European Union or European Economic Area, you also have the right to lodge a complaint with your local data protection authority.</p>}
          </Section>

          {/* 8 */}
          <Section title={isEs ? '8. Privacidad de menores' : "8. Children's Privacy"}>
            <p>{isEs
              ? 'Nuestro sitio web no está dirigido a menores de 13 años. No recopilamos conscientemente información personal de niños. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información personal, contáctanos de inmediato en info@fotografosantodomingo.com y eliminaremos esa información de inmediato.'
              : 'Our website is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at info@fotografosantodomingo.com and we will delete that information promptly.'}
            </p>
          </Section>

          {/* 9 */}
          <Section title={isEs ? '9. Enlaces externos' : '9. External Links'}>
            <p>{isEs
              ? 'Nuestro sitio web puede contener enlaces a sitios web de terceros, incluidos nuestros perfiles en redes sociales y galerías en línea. No somos responsables de las prácticas de privacidad de estos sitios externos y te recomendamos revisar sus respectivas políticas de privacidad antes de proporcionar cualquier información personal.'
              : 'Our website may contain links to third-party websites including our social media profiles and online galleries. We are not responsible for the privacy practices of these external sites and encourage you to review their respective privacy policies before providing any personal information.'}
            </p>
          </Section>

          {/* 10 */}
          <Section title={isEs ? '10. Seguridad' : '10. Security'}>
            <p>{isEs
              ? 'Nos tomamos muy en serio la seguridad de tu información personal. Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Estas medidas incluyen conexiones de base de datos cifradas, políticas de Row Level Security en nuestra base de datos y cifrado HTTPS en todo nuestro sitio web.'
              : 'We take the security of your personal information seriously. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure or destruction. These measures include encrypted database connections, Row Level Security policies in our database, and HTTPS encryption across our entire website.'}
            </p>
            <p className="mt-3">{isEs
              ? 'Sin embargo, ningún método de transmisión por Internet o método de almacenamiento electrónico es 100% seguro. Aunque nos esforzamos por utilizar medios comercialmente aceptables para proteger tu información personal, no podemos garantizar su seguridad absoluta.'
              : 'However, no method of transmission over the internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.'}
            </p>
          </Section>

          {/* 11 */}
          <Section title={isEs ? '11. Cambios en esta Política' : '11. Changes to This Privacy Policy'}>
            <p>{isEs
              ? 'Podemos actualizar esta Política de Privacidad de vez en cuando para reflejar cambios en nuestras prácticas o en la ley aplicable. Cuando realicemos cambios, actualizaremos la fecha en la parte superior de esta página. Te recomendamos revisar esta Política de Privacidad periódicamente. Tu uso continuado de nuestro sitio web después de cualquier cambio constituye tu aceptación de la política actualizada.'
              : 'We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. When we make changes we will update the date at the top of this page. We encourage you to review this Privacy Policy periodically. Your continued use of our website after any changes constitutes your acceptance of the updated policy.'}
            </p>
          </Section>

          {/* 12 */}
          <Section title={isEs ? '12. Contáctanos' : '12. Contact Us'}>
            <p>{isEs
              ? 'Si tienes alguna pregunta, inquietud o solicitud sobre esta Política de Privacidad o la forma en que gestionamos tus datos personales, contáctanos:'
              : 'If you have any questions, concerns or requests regarding this Privacy Policy or the way we handle your personal data, please contact us:'}
            </p>
            <address className="mt-4 not-italic text-gray-300 space-y-1">
              <p className="font-semibold text-white">Fotografo Santo Domingo</p>
              <p>Santo Domingo, Distrito Nacional, República Dominicana</p>
              <p>Email: <a href="mailto:info@fotografosantodomingo.com" className="text-sky-400 hover:text-sky-300">info@fotografosantodomingo.com</a></p>
              <p>WhatsApp: <a href="https://wa.me/18097209547" className="text-sky-400 hover:text-sky-300">+1 809 720 9547</a></p>
              <p>Web: <a href="https://www.fotografosantodomingo.com" className="text-sky-400 hover:text-sky-300">www.fotografosantodomingo.com</a></p>
            </address>
          </Section>

        </div>

        {/* Footer nav */}
        <div className="mt-14 pt-8 border-t border-gray-800 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href={`/${locale}`} className="hover:text-gray-300 transition-colors">{isEs ? 'Inicio' : 'Home'}</Link>
          <Link href={`/${locale}/terms`} className="hover:text-gray-300 transition-colors">{isEs ? 'Términos y Condiciones' : 'Terms & Conditions'}</Link>
          <Link href={`/${locale}/contact`} className="hover:text-gray-300 transition-colors">{isEs ? 'Contacto' : 'Contact'}</Link>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-3 pb-2 border-b border-gray-800">{title}</h2>
      <div className="text-gray-300 leading-relaxed">{children}</div>
    </section>
  )
}
