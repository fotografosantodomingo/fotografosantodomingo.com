import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { CONTACT_INFO, SOCIAL_LINKS, BOOKING_LINKS } from '@/lib/utils/constants'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Fotografo Santo Domingo</h3>
            <p className="text-gray-300 mb-4">
              {t('description')}
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📍 {t('contact.info.office')}</p>
              <p>📞 {CONTACT_INFO.phone}</p>
              <p>✉️ {CONTACT_INFO.email}</p>
              <p>⏰ {t('contact.info.response_time')}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><Link href="/services" className="text-gray-300 hover:text-white transition-colors">Servicios</Link></li>
              <li><Link href="/portfolio" className="text-gray-300 hover:text-white transition-colors">Portafolio</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">Nosotros</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Services & Booking */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2">
              <li><a href={BOOKING_LINKS.setmore} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Reservar Sesión</a></li>
              <li><a href={BOOKING_LINKS.calendly} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Consultoría Gratuita</a></li>
              <li><a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">WhatsApp</a></li>
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  Instagram
                </a>
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-2">{t('newsletter.title')}</h4>
            <p className="text-gray-300 mb-4">{t('newsletter.subtitle')}</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
              />
              <button className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-r-lg transition-colors">
                Suscribirse
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Fotografo Santo Domingo. {t('common.made_with_love')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}