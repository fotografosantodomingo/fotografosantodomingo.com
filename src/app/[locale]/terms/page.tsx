import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = 'https://www.fotografosantodomingo.com'

type Props = { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isEs = locale === 'es'
  return {
    title: isEs
      ? 'Términos y Condiciones — Fotógrafo Santo Domingo'
      : 'Terms and Conditions — Photographer Santo Domingo',
    description: isEs
      ? 'Términos y condiciones de fotografosantodomingo.com. Reservas, depósitos, cancela­ciones, derechos de imagen y entrega de fotografías.'
      : 'Terms and conditions for fotografosantodomingo.com. Bookings, deposits, cancellations, image rights and photo delivery.',
    alternates: {
      canonical: `${BASE_URL}/${locale}/terms`,
      languages: {
        es: `${BASE_URL}/es/terms`,
        en: `${BASE_URL}/en/terms`,
        'x-default': `${BASE_URL}/es/terms`,
      },
    },
    robots: { index: true, follow: true },
  }
}

export default function TermsPage({ params: { locale } }: Props) {
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
          {isEs ? 'Términos y Condiciones' : 'Terms and Conditions'}
        </h1>
        <p className="text-gray-500 text-sm mb-10">
          {isEs ? 'Última actualización: 7 de abril de 2026' : 'Last updated: April 7, 2026'}
        </p>

        <div className="space-y-10">

          {/* 1 */}
          <Section title={isEs ? '1. Introducción y aceptación' : '1. Introduction and Acceptance'}>
            <p>{isEs
              ? 'Estos Términos y Condiciones rigen el uso del sitio web fotografosantodomingo.com y los servicios fotográficos prestados por Fotografo Santo Domingo, también conocido como Babula Shots RD, con sede en Santo Domingo, República Dominicana.'
              : 'These Terms and Conditions govern your use of the website fotografosantodomingo.com and any photography services provided by Fotografo Santo Domingo, also known as Babula Shots RD, based in Santo Domingo, Dominican Republic.'}
            </p>
            <p className="mt-3">{isEs
              ? 'Al acceder a este sitio web o contratar cualquier servicio fotográfico a través de él, confirmas que has leído, comprendido y aceptas estar vinculado por estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, por favor no utilices nuestro sitio web ni nuestros servicios.'
              : 'By accessing this website or booking any photography service through it, you confirm that you have read, understood and agree to be bound by these Terms and Conditions in their entirety. If you do not agree with any part of these terms, please do not use our website or services.'}
            </p>
            <p className="mt-3">{isEs
              ? 'Estos Términos y Condiciones se aplican a todos los clientes, visitantes y usuarios de fotografosantodomingo.com independientemente de su nacionalidad o ubicación.'
              : 'These Terms and Conditions apply to all clients, visitors and users of fotografosantodomingo.com regardless of nationality or location.'}
            </p>
          </Section>

          {/* 2 */}
          <Section title={isEs ? '2. Sobre nosotros' : '2. About Us'}>
            <p>{isEs
              ? 'Fotografo Santo Domingo es un servicio de fotografía profesional operado por Babula Shots RD, con sede en Santo Domingo, Distrito Nacional, República Dominicana. Ofrecemos servicios de fotografía profesional en todo el país, incluyendo Santo Domingo, Punta Cana, Bávaro, Cap Cana, Isla Saona, Tortuga Bay, Casa de Campo, La Romana, Santiago, San Pedro de Macorís, Puerto Plata y cualquier otro lugar acordado con el cliente.'
              : 'Fotografo Santo Domingo is a professional photography service operated by Babula Shots RD, based in Santo Domingo, Distrito Nacional, Dominican Republic. We provide professional photography services across the entire country including Santo Domingo, Punta Cana, Bávaro, Cap Cana, Isla Saona, Tortuga Bay, Casa de Campo, La Romana, Santiago, San Pedro de Macorís, Puerto Plata and any other location agreed upon with the client.'}
            </p>
            <p className="mt-3">{isEs
              ? <>Puedes contactarnos en <a href="mailto:info@fotografosantodomingo.com" className="text-sky-400 hover:text-sky-300">info@fotografosantodomingo.com</a> o por WhatsApp al <a href="https://wa.me/18097209547" className="text-sky-400 hover:text-sky-300">+1 809 720 9547</a>.</>
              : <>You can reach us at <a href="mailto:info@fotografosantodomingo.com" className="text-sky-400 hover:text-sky-300">info@fotografosantodomingo.com</a> or via WhatsApp at <a href="https://wa.me/18097209547" className="text-sky-400 hover:text-sky-300">+1 809 720 9547</a>.</>}
            </p>
          </Section>

          {/* 3 */}
          <Section title={isEs ? '3. Servicios' : '3. Services'}>
            <p>{isEs
              ? 'Ofrecemos los siguientes servicios de fotografía profesional en República Dominicana:'
              : 'We offer the following professional photography services in Dominican Republic:'}
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              {(isEs ? [
                'Fotografía de bodas y pre-bodas',
                'Sesiones de quinceañera',
                'Fotografía de cumpleaños y celebraciones',
                'Retratos en interiores y exteriores',
                'Fotografía de moda y pasarela',
                'Fotografía corporativa y empresarial',
                'Cobertura de eventos',
                'Fotografía y video aéreo con dron',
                'Sesiones de estudio con iluminación optical snoot',
                'Sesiones de destino en Punta Cana, Isla Saona, Tortuga Bay y otros lugares de República Dominicana',
              ] : [
                'Wedding photography and pre-wedding sessions',
                'Quinceañera photography',
                'Birthday and celebration sessions',
                'Portrait sessions in studio and outdoor locations',
                'Fashion and runway photography',
                'Corporate and business photography',
                'Event coverage',
                'Drone photography and aerial video',
                'Studio sessions with optical snoot lighting',
                'Destination sessions in Punta Cana, Isla Saona, Tortuga Bay and other locations across Dominican Republic',
              ]).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="mt-3">{isEs
              ? 'El alcance específico, la duración, los entregables y el precio de cada servicio se acuerdan entre el cliente y Fotografo Santo Domingo antes de confirmar la reserva. Cualquier servicio no incluido explícitamente en la reserva acordada no está cubierto y puede estar sujeto a cargos adicionales.'
              : 'The specific scope, duration, deliverables and pricing of each service are agreed upon between the client and Fotografo Santo Domingo prior to booking confirmation. Any service not explicitly included in the agreed booking is not covered and may be subject to additional charges.'}
            </p>
          </Section>

          {/* 4 */}
          <Section title={isEs ? '4. Reserva y depósito' : '4. Booking and Reservation'}>
            <p>{isEs
              ? 'Para reservar una sesión fotográfica o cobertura de evento con Fotografo Santo Domingo, el cliente debe enviar una solicitud de reserva a través del formulario de contacto de nuestro sitio web, WhatsApp o correo electrónico. Una reserva solo se confirma una vez que Fotografo Santo Domingo envía una confirmación escrita y se recibe el depósito requerido.'
              : 'To reserve a photography session or event coverage with Fotografo Santo Domingo, the client must submit a booking request through our website contact form, WhatsApp, or email. A booking is only confirmed once a written confirmation has been sent by Fotografo Santo Domingo and the required deposit has been received.'}
            </p>
            <p className="mt-4"><strong className="text-white">{isEs ? 'Depósito:' : 'Deposit:'}</strong> {isEs
              ? 'Se requiere un depósito no reembolsable del 50% del total acordado en el momento de confirmar la reserva. Este depósito reserva el tiempo y la disponibilidad del fotógrafo para la fecha y hora acordadas. Ninguna fecha o franja se reserva sin un depósito pagado.'
              : 'A non-refundable deposit of 50% of the total agreed service fee is required at the time of booking confirmation. This deposit reserves the photographer\'s time and availability for the agreed date and time. No date or slot is held without a paid deposit.'}
            </p>
            <p className="mt-3"><strong className="text-white">{isEs ? 'Saldo restante:' : 'Remaining balance:'}</strong> {isEs
              ? 'El 50% restante del servicio total debe pagarse el día de la sesión, antes de que comience. El incumplimiento del pago del saldo restante el día de la sesión puede resultar en la cancelación de la sesión sin reembolso del depósito.'
              : 'The remaining 50% of the total service fee is due on the day of the session, before the photography session begins. Failure to pay the remaining balance on the day of the session may result in cancellation of the session with no refund of the deposit.'}
            </p>
            <p className="mt-3"><strong className="text-white">{isEs ? 'Métodos de pago aceptados:' : 'Accepted payment methods:'}</strong> {isEs
              ? 'Efectivo en USD o pesos dominicanos al tipo de cambio acordado, transferencia bancaria y enlaces de pago en línea cuando estén disponibles.'
              : 'Cash in USD or Dominican pesos at the agreed exchange rate, bank transfer, and online payment links where available.'}
            </p>
          </Section>

          {/* 5 */}
          <Section title={isEs ? '5. Cancelaciones y reprogramaciones' : '5. Cancellations and Rescheduling'}>
            <p><strong className="text-white">{isEs ? 'Cancelaciones del cliente:' : 'Client cancellations:'}</strong> {isEs
              ? 'Si el cliente cancela la reserva por cualquier motivo, el depósito no es reembolsable en ninguna circunstancia. Según la proximidad a la fecha de la sesión, pueden aplicarse cargos adicionales por cancelación: cancelaciones realizadas con más de 7 días de antelación — se pierde el depósito, sin cargos adicionales. Cancelaciones dentro de los 7 días previos a la sesión — se pierde el depósito y puede cobrarse hasta el 25% del saldo restante. Cancelaciones el día de la sesión — puede requerirse el pago completo.'
              : 'If the client cancels the booking for any reason, the deposit is non-refundable in all circumstances. Depending on how close to the session date the cancellation occurs, additional cancellation fees may apply as follows: cancellations made more than 7 days before the session date — deposit is forfeited, no additional charges. Cancellations made within 7 days of the session date — deposit is forfeited and up to 25% of the remaining balance may be charged. Cancellations on the day of the session — full payment may be required.'}
            </p>
            <p className="mt-3"><strong className="text-white">{isEs ? 'Reprogramaciones:' : 'Rescheduling:'}</strong> {isEs
              ? 'El cliente puede solicitar reprogramar la sesión hasta 72 horas antes de la fecha y hora acordadas, sujeto a la disponibilidad de Fotografo Santo Domingo. Se permite una solicitud de reprogramación por reserva sin cargo adicional. Las solicitudes de reprogramación posteriores pueden estar sujetas a una tarifa administrativa.'
              : 'The client may request to reschedule the session up to 72 hours before the agreed date and time, subject to availability of Fotografo Santo Domingo. One rescheduling request is permitted per booking at no additional charge. Subsequent rescheduling requests may be subject to an administrative fee.'}
            </p>
            <p className="mt-3"><strong className="text-white">{isEs ? 'Cancelaciones del fotógrafo:' : 'Photographer cancellations:'}</strong> {isEs
              ? 'En el improbable caso de que Fotografo Santo Domingo deba cancelar una reserva confirmada por enfermedad, emergencia o fuerza mayor, al cliente se le ofrecerá un reembolso total del depósito o la opción de reprogramar sin costo adicional.'
              : 'In the unlikely event that Fotografo Santo Domingo must cancel a confirmed booking due to illness, emergency or force majeure, the client will be offered a full refund of the deposit or the option to reschedule at no additional cost.'}
            </p>
            <p className="mt-3"><strong className="text-white">{isEs ? 'Condiciones meteorológicas:' : 'Weather conditions:'}</strong> {isEs
              ? 'Para las sesiones al aire libre, si las condiciones climáticas adversas hacen imposible o inseguro realizar la sesión, la reprogramaremos sin costo adicional. La decisión de reprogramar por clima se toma conjuntamente entre el cliente y el fotógrafo.'
              : 'For outdoor sessions, if adverse weather conditions make it impossible or unsafe to proceed with the session, we will reschedule at no additional charge. The decision to reschedule due to weather is made jointly between the client and the photographer.'}
            </p>
          </Section>

          {/* 6 */}
          <Section title={isEs ? '6. Derechos de autor y derechos de imagen' : '6. Copyright and Image Rights'}>
            <p>{isEs
              ? 'Todas las fotografías y el material audiovisual creado por Fotografo Santo Domingo durante cualquier sesión fotográfica están protegidos por las leyes de derechos de autor. Los derechos de propiedad intelectual de todas las imágenes producidas pertenecen exclusiva y permanentemente a Fotografo Santo Domingo — Babula Shots RD.'
              : 'All photographs and audiovisual material created by Fotografo Santo Domingo during any photography session are protected by copyright law. The intellectual property rights of all images produced belong exclusively and permanently to Fotografo Santo Domingo — Babula Shots RD.'}
            </p>
            <p className="mt-3"><strong className="text-white">{isEs ? 'Derechos de uso del cliente:' : 'Client usage rights:'}</strong> {isEs
              ? 'Una vez realizado el pago completo del servicio acordado, el cliente recibe una licencia personal, no exclusiva e intransferible para utilizar las fotografías entregadas con fines personales, incluyendo impresión, publicación en redes sociales personales y conservación como recuerdos personales. Esta licencia no incluye el derecho de vender, licenciar o explotar comercialmente las imágenes sin el consentimiento previo y por escrito de Fotografo Santo Domingo.'
              : 'Upon full payment of the agreed service fee, the client receives a personal, non-exclusive, non-transferable license to use the delivered photographs for personal purposes including printing, sharing on personal social media, and keeping as personal memories. This license does not include the right to sell, license or commercially exploit the images without prior written consent from Fotografo Santo Domingo.'}
            </p>
            <p className="mt-3"><strong className="text-white">{isEs ? 'Derechos del fotógrafo:' : 'Photographer usage rights:'}</strong> {isEs
              ? 'Fotografo Santo Domingo se reserva el derecho pleno, irrevocable e ilimitado de utilizar, reproducir, publicar, mostrar, distribuir y comunicar públicamente cualquier imagen creada durante la sesión para fines comerciales, promocionales, publicitarios y artísticos sin requerir autorización adicional ni notificación al cliente. Esto incluye, entre otros, el uso en nuestro sitio web fotografosantodomingo.com, babulashotsrd.com, plataformas de redes sociales, portafolios fotográficos, campañas publicitarias, contenido editorial y material educativo.'
              : 'Fotografo Santo Domingo reserves the full, irrevocable and unlimited right to use, reproduce, publish, display, distribute and publicly communicate any images created during the session for commercial, promotional, advertising and artistic purposes without requiring additional authorization or notification to the client. This includes but is not limited to use on our official website fotografosantodomingo.com, babulashotsrd.com, social media platforms, photography portfolios, advertising campaigns, editorial content and educational material.'}
            </p>
            <p className="mt-3"><strong className="text-white">{isEs ? 'Exclusividad:' : 'Exclusivity:'}</strong> {isEs
              ? 'Si el cliente requiere derechos exclusivos sobre las imágenes o desea restringir la publicación pública por parte de Fotografo Santo Domingo, esto debe solicitarse por escrito antes de la sesión. Los acuerdos de exclusividad están sujetos a tarifas adicionales y deben acordarse por escrito antes de la fecha de la sesión.'
              : 'If the client requires exclusive rights to the images or wishes to restrict Fotografo Santo Domingo from publishing the images publicly, this must be requested in writing before the session. Exclusivity arrangements are subject to additional fees and must be agreed in writing before the session date.'}
            </p>
            <p className="mt-3"><strong className="text-white">{isEs ? 'Autorización de imagen:' : 'Model release:'}</strong> {isEs
              ? 'Al contratar una sesión fotográfica con Fotografo Santo Domingo, el cliente y todas las personas fotografiadas durante la sesión otorgan a Fotografo Santo Domingo el derecho a utilizar su imagen en fotografías como se describe en la sección de derechos del fotógrafo. Si alguna persona fotografiada no consiente el uso público de sus imágenes, esto debe comunicarse por escrito antes de la sesión.'
              : 'By booking a photography session with Fotografo Santo Domingo, the client and any persons photographed during the session grant Fotografo Santo Domingo the right to use their likeness in photographs as described in the photographer usage rights section above. If any person photographed does not consent to public use of their images, this must be communicated in writing before the session.'}
            </p>
          </Section>

          {/* 7 */}
          <Section title={isEs ? '7. Entrega de imágenes' : '7. Delivery of Images'}>
            <p>{isEs
              ? 'Las fotografías editadas se entregan digitalmente a través de una galería privada en línea en alta resolución dentro de 48 a 72 horas tras la fecha de la sesión, salvo acuerdo previo por escrito. Para bodas, eventos de gran envergadura o sesiones de larga duración, puede aplicarse un período de edición y entrega más largo, lo cual se comunicará al cliente antes de confirmar la reserva.'
              : 'Edited photographs are delivered digitally through a private online gallery in high resolution within 48 to 72 hours of the session date, unless otherwise agreed in writing before the session. For weddings, large events or sessions of extended duration, a longer editing and delivery period may apply — this will be communicated to the client before booking confirmation.'}
            </p>
            <p className="mt-3">{isEs
              ? 'El número de fotografías editadas entregadas corresponde al paquete o servicio acordado en la reserva. Fotografo Santo Domingo selecciona las mejores imágenes de la sesión para edición y entrega. El cliente no tiene derecho a solicitar archivos raw sin editar, salvo que esto haya sido acordado explícitamente e incluido en la reserva.'
              : 'The number of edited photographs delivered corresponds to the package or service agreed at booking. Fotografo Santo Domingo selects the best images from the session for editing and delivery. The client does not have the right to request unedited raw files unless this has been explicitly agreed and included in the booking.'}
            </p>
            <p className="mt-3">{isEs
              ? 'Las imágenes entregadas se proporcionan en formato digital de alta resolución apto para imprimir y compartir digitalmente. Las impresiones físicas, álbumes y productos adicionales no están incluidos salvo que se acuerde explícitamente como parte del paquete de servicio.'
              : 'Delivered images are provided in high resolution digital format suitable for printing and digital sharing. Physical prints, albums and additional products are not included unless explicitly agreed as part of the service package.'}
            </p>
          </Section>

          {/* 8 */}
          <Section title={isEs ? '8. Responsabilidades del cliente' : '8. Client Responsibilities'}>
            <p>{isEs ? 'El cliente es responsable de lo siguiente:' : 'The client is responsible for the following:'}</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              {(isEs ? [
                'Llegar al lugar acordado a tiempo para la sesión.',
                'Comunicar al fotógrafo cualquier requisito especial, solicitud o información importante antes de la sesión.',
                'Asegurarse de que todas las personas a fotografiar estén informadas y presentes para la sesión.',
                'Obtener los permisos o autorizaciones necesarios para acceder a ubicaciones privadas o restringidas elegidas por el cliente.',
                'Informar al fotógrafo de cualquier condición médica relevante, limitación de movilidad u otros factores que puedan afectar la sesión.',
              ] : [
                'Arriving at the agreed location on time for the session.',
                'Communicating any special requirements, requests or important information to the photographer before the session.',
                'Ensuring that all persons to be photographed are informed of and present for the session.',
                'Obtaining any necessary permissions or permits for private or restricted locations chosen by the client.',
                'Informing the photographer of any relevant medical conditions, mobility limitations or other factors that may affect the session.',
              ]).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="mt-3">{isEs
              ? 'Fotografo Santo Domingo no es responsable de los retrasos o limitaciones en la sesión causados por el incumplimiento de estas responsabilidades por parte del cliente.'
              : 'Fotografo Santo Domingo is not responsible for delays or limitations in the session caused by the client\'s failure to fulfill these responsibilities.'}
            </p>
          </Section>

          {/* 9 */}
          <Section title={isEs ? '9. Limitación de responsabilidad' : '9. Limitation of Liability'}>
            <p>{isEs
              ? 'Fotografo Santo Domingo ejercerá cuidado y habilidad profesional en la prestación de todos los servicios fotográficos. Sin embargo, nuestra responsabilidad ante el cliente en relación con cualquier sesión fotográfica se limita al importe total pagado por el cliente por esa sesión específica.'
              : 'Fotografo Santo Domingo will exercise professional care and skill in delivering all photography services. However, our liability to the client in connection with any photography session is limited to the total amount paid by the client for that specific session.'}
            </p>
            <p className="mt-3">{isEs ? 'No somos responsables de:' : 'We are not liable for:'}</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              {(isEs ? [
                'Pérdida de imágenes por fallos técnicos fuera de nuestro control razonable.',
                'Desastres naturales, robo o daño de equipos.',
                'Retrasos causados por terceros.',
                'La insatisfacción del cliente con fotografías entregadas de acuerdo con el servicio acordado.',
                'Daños indirectos, consecuentes o especiales derivados de nuestros servicios.',
              ] : [
                'Loss of images due to technical failures beyond our reasonable control.',
                'Natural disasters, theft or damage to equipment.',
                'Delays caused by third parties.',
                'The client\'s dissatisfaction with photographs that were delivered in accordance with the agreed service.',
                'Any indirect, consequential or special damages arising from our services.',
              ]).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="mt-3">{isEs
              ? 'En caso de fallo de equipo o error técnico que resulte en la pérdida de imágenes de una sesión, nuestra responsabilidad máxima es el reembolso completo del importe pagado. No seremos responsables de ninguna pérdida o daño adicional más allá de este importe.'
              : 'In the event of equipment failure or technical error that results in the loss of images from a session, our maximum liability is a full refund of the amount paid. We will not be liable for any additional losses or damages beyond this amount.'}
            </p>
          </Section>

          {/* 10 */}
          <Section title={isEs ? '10. Uso del sitio web' : '10. Website Use'}>
            <p>{isEs
              ? 'El contenido publicado en fotografosantodomingo.com, incluyendo todas las fotografías, textos, gráficos, logotipos y elementos de diseño, es propiedad intelectual de Fotografo Santo Domingo y está protegido por las leyes de derechos de autor. No puedes reproducir, copiar, distribuir ni utilizar ningún contenido de este sitio web con fines comerciales sin autorización previa y por escrito.'
              : 'The content published on fotografosantodomingo.com including all photographs, text, graphics, logos and design elements is the intellectual property of Fotografo Santo Domingo and is protected by copyright law. You may not reproduce, copy, distribute or use any content from this website for commercial purposes without prior written permission.'}
            </p>
            <p className="mt-3">{isEs
              ? 'Aceptas no utilizar este sitio web de ninguna manera que sea ilegal, dañina o que pueda perjudicar la reputación de Fotografo Santo Domingo. Nos reservamos el derecho de restringir el acceso a nuestro sitio web en cualquier momento y sin previo aviso.'
              : 'You agree not to use this website in any way that is unlawful, harmful, or that could damage the reputation of Fotografo Santo Domingo. We reserve the right to restrict access to our website at any time without notice.'}
            </p>
          </Section>

          {/* 11 */}
          <Section title={isEs ? '11. Enlaces a terceros' : '11. Third-Party Links'}>
            <p>{isEs
              ? 'Nuestro sitio web contiene enlaces a sitios web de terceros, incluidas plataformas de redes sociales, galerías en línea y nuestro sitio hermano babulashotsrd.com. Estos enlaces se proporcionan únicamente para tu comodidad. No tenemos control sobre el contenido de esos sitios y no aceptamos responsabilidad alguna por ellos ni por ninguna pérdida o daño que pueda derivarse de su uso.'
              : 'Our website contains links to third-party websites including social media platforms, online galleries and our sister website babulashotsrd.com. These links are provided for your convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.'}
            </p>
          </Section>

          {/* 12 */}
          <Section title={isEs ? '12. Ley aplicable' : '12. Governing Law'}>
            <p>{isEs
              ? 'Estos Términos y Condiciones se rigen e interpretan de conformidad con las leyes de la República Dominicana. Cualquier disputa derivada de estos términos o del uso de nuestros servicios estará sujeta a la jurisdicción exclusiva de los tribunales de Santo Domingo, República Dominicana.'
              : 'These Terms and Conditions are governed by and construed in accordance with the laws of the Dominican Republic. Any dispute arising from these terms or from the use of our services shall be subject to the exclusive jurisdiction of the courts of Santo Domingo, Dominican Republic.'}
            </p>
          </Section>

          {/* 13 */}
          <Section title={isEs ? '13. Cambios en los términos' : '13. Changes to These Terms'}>
            <p>{isEs
              ? 'Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios se publicarán en esta página con una fecha actualizada. Tu uso continuado de nuestro sitio web o servicios después de cualquier cambio constituye tu aceptación de los términos actualizados. Te recomendamos revisar estos términos periódicamente.'
              : 'We reserve the right to modify these Terms and Conditions at any time. Changes will be posted on this page with an updated date. Your continued use of our website or services after any changes constitutes your acceptance of the updated terms. We encourage you to review these terms periodically.'}
            </p>
          </Section>

          {/* 14 */}
          <Section title={isEs ? '14. Contáctanos' : '14. Contact Us'}>
            <p>{isEs
              ? 'Para cualquier pregunta, inquietud o disputa sobre estos Términos y Condiciones, contáctanos:'
              : 'For any questions, concerns or disputes regarding these Terms and Conditions, please contact us:'}
            </p>
            <address className="mt-4 not-italic text-gray-300 space-y-1">
              <p className="font-semibold text-white">Fotografo Santo Domingo — Babula Shots RD</p>
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
          <Link href={`/${locale}/privacy`} className="hover:text-gray-300 transition-colors">{isEs ? 'Política de Privacidad' : 'Privacy Policy'}</Link>
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
