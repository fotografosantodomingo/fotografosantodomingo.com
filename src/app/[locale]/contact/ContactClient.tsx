'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CONTACT_INFO, BOOKING_LINKS } from '@/lib/utils/constants'
import { submitContactForm } from '@/lib/actions/contact'

type FormData = {
  name: string
  email: string
  phone: string
  service: string
  message: string
  eventDate?: string
  location?: string
}

type FormErrors = {
  [K in keyof FormData]?: string
}

export default function ContactPage() {
  const t = useTranslations()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    eventDate: '',
    location: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const services = [
    { value: 'wedding', label: t('services.wedding.title') || 'Wedding Photography' },
    { value: 'corporate', label: t('services.corporate.title') || 'Corporate Portraits' },
    { value: 'drone', label: t('services.drone.title') || 'Drone Photography' },
    { value: 'event', label: t('services.event.title') || 'Special Events' },
    { value: 'family', label: t('services.family.title') || 'Family Sessions' },
    { value: 'commercial', label: t('services.commercial.title') || 'Commercial Photography' },
    { value: 'other', label: t('contact.form.service.other') || 'Other' },
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('contact.form.errors.name') || 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.form.errors.email') || 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contact.form.errors.emailInvalid') || 'Please enter a valid email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('contact.form.errors.phone') || 'Phone is required'
    }

    if (!formData.service) {
      newErrors.service = t('contact.form.errors.service') || 'Please select a service'
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.form.errors.message') || 'Message is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const result = await submitContactForm(formData)

      if (result.success) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: '',
          eventDate: '',
          location: '',
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative bg-gray-950 py-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('contact.title') || 'Contact Me'}
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              {t('contact.subtitle') || "Let's discuss your photography project and create something amazing together."}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">
                {t('contact.form.title') || 'Send me a message'}
              </h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 text-lg mr-2">✓</span>
                    <p className="text-green-800 font-medium">
                      {t('contact.form.success') || 'Thank you! Your message has been sent successfully.'}
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-600 text-lg mr-2">✕</span>
                    <p className="text-red-800 font-medium">
                      {t('contact.form.error') || 'Sorry, there was an error sending your message. Please try again.'}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('contact.form.name') || 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 ${
                        errors.name ? '!border-red-500' : ''
                      }`}
                      placeholder={t('contact.form.namePlaceholder') || 'Your full name'}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('contact.form.email') || 'Email'} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 ${
                        errors.email ? '!border-red-500' : ''
                      }`}
                      placeholder={t('contact.form.emailPlaceholder') || 'your@email.com'}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('contact.form.phone') || 'Phone'} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 ${
                        errors.phone ? '!border-red-500' : ''
                      }`}
                      placeholder={t('contact.form.phonePlaceholder') || '+1 (809) 555-0123'}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('contact.form.service.label') || 'Service Type'} *
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-900 border-gray-700 text-white ${
                        errors.service ? '!border-red-500' : ''
                      }`}
                    >
                      <option value="">
                        {t('contact.form.servicePlaceholder') || 'Select a service'}
                      </option>
                      {services.map(service => (
                        <option key={service.value} value={service.value}>
                          {service.label}
                        </option>
                      ))}
                    </select>
                    {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
                  </div>
                </div>

                {(formData.service === 'wedding' || formData.service === 'event') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="eventDate" className="block text-sm font-medium text-gray-300 mb-2">
                        {t('contact.form.eventDate') || 'Event Date'}
                      </label>
                      <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-900 text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                        {t('contact.form.location') || 'Location'}
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-900 text-white placeholder:text-gray-500"
                        placeholder={t('contact.form.locationPlaceholder') || 'Venue or location'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('contact.form.message') || 'Message'} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 ${
                      errors.message ? '!border-red-500' : ''
                    }`}
                    placeholder={t('contact.form.messagePlaceholder') || 'Tell me about your project, vision, and any specific requirements...'}
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('contact.form.sending') || 'Sending...'}
                    </>
                  ) : (
                    t('contact.form.send') || 'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">
                {t('contact.info.title') || 'Get in touch'}
              </h2>

              <div className="space-y-8">
                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {t('contact.info.phone') || 'Phone'}
                    </h3>
                    <p className="text-gray-400">{CONTACT_INFO.phone}</p>
                    <a
                      href={`tel:${CONTACT_INFO.phone}`}
                      className="text-sky-400 hover:text-sky-300 font-medium"
                    >
                      {t('contact.info.call') || 'Call me'}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✉️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {t('contact.info.email') || 'Email'}
                    </h3>
                    <p className="text-gray-400">{CONTACT_INFO.email}</p>
                    <a
                      href={`mailto:${CONTACT_INFO.email}`}
                      className="text-sky-400 hover:text-sky-300 font-medium"
                    >
                      {t('contact.info.sendEmail') || 'Send email'}
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {t('contact.info.location') || 'Location'}
                    </h3>
                    <p className="text-gray-400">C. El Conde 142</p>
                    <p className="text-gray-400">Santo Domingo 11111</p>
                    <p className="text-gray-500 text-sm">{t('contact.info.locationDetail')}</p>
                  </div>
                </div>

                {/* Booking */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {t('contact.info.booking') || 'Book Consultation'}
                    </h3>
                    <p className="text-gray-400 mb-2">
                      {t('contact.info.bookingDesc') || 'Schedule a free 30-minute consultation'}
                    </p>
                    <a
                      href={BOOKING_LINKS.calendly}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      {t('contact.info.bookNow') || 'Book Now'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="mt-8 p-6 bg-sky-500/10 border border-sky-500/20 rounded-lg">
                <h3 className="font-semibold text-white mb-2">
                  {t('contact.info.response') || 'Response Time'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('contact.info.responseDetail') || 'I typically respond to messages within 2-4 hours during business days.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="bg-gray-950 pb-16">
        <div className="container mx-auto px-4">
          <iframe
            src="https://maps.google.com/maps?q=Calle+El+Conde+142+Santo+Domingo+Dominican+Republic&output=embed&hl=es"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: '16px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Fotografo en Santo Domingo — C. El Conde 142, Zona Colonial"
          />
        </div>
      </section>

      {/* Setmore Online Booking */}
      <section className="py-20 bg-gray-900 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-6">📅</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('contact.booking.title') || 'Reserve tu sesión online'}
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              {t('contact.booking.subtitle') || 'Elige el día y hora que mejor se adapte a tu agenda. Reserva en minutos, confirmación inmediata.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={BOOKING_LINKS.setmore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-white text-sky-600 hover:bg-gray-100 font-bold text-lg px-10 py-4 rounded-xl transition-colors shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('contact.booking.cta') || 'Reservar Ahora'}
              </a>
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent('Hola! Quiero reservar una sesión fotográfica.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold text-lg px-10 py-4 rounded-xl transition-colors shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </a>
            </div>
            <p className="mt-6 text-sm opacity-75">
              {t('contact.booking.note') || 'Disponible lunes–sábado · Respuesta en menos de 4 horas'}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('contact.faq.title') || 'Frequently Asked Questions'}
              </h2>
              <p className="text-xl text-gray-400">
                {t('contact.faq.subtitle') || 'Common questions about working together'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-900 p-6 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-3">
                  {t('contact.faq.q1') || 'How far in advance should I book?'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('contact.faq.a1') || 'For weddings and events, I recommend booking 6-12 months in advance. For portraits and smaller sessions, 2-4 weeks is usually sufficient.'}
                </p>
              </div>

              <div className="bg-gray-900 p-6 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-3">
                  {t('contact.faq.q2') || 'Do you travel for shoots?'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('contact.faq.a2') || 'Yes! I serve Santo Domingo, Punta Cana, and surrounding areas. Travel fees may apply for locations outside the main service area.'}
                </p>
              </div>

              <div className="bg-gray-900 p-6 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-3">
                  {t('contact.faq.q3') || 'What is your editing process?'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('contact.faq.a3') || 'I use professional editing software to enhance colors, lighting, and composition while maintaining authenticity. Delivery typically takes 2-4 weeks.'}
                </p>
              </div>

              <div className="bg-gray-900 p-6 rounded-lg border border-white/10">
                <h3 className="font-semibold text-white mb-3">
                  {t('contact.faq.q4') || 'Do you offer payment plans?'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {t('contact.faq.a4') || 'Yes, I offer flexible payment plans for larger projects. A deposit is required to secure your date, with remaining balance due before delivery.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}