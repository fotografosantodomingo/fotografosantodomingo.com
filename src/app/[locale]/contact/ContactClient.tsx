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
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('contact.title') || 'Contact Me'}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('contact.subtitle') || "Let's discuss your photography project and create something amazing together."}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.name') || 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={t('contact.form.namePlaceholder') || 'Your full name'}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.email') || 'Email'} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={t('contact.form.emailPlaceholder') || 'your@email.com'}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.phone') || 'Phone'} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={t('contact.form.phonePlaceholder') || '+1 (809) 555-0123'}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.service') || 'Service Type'} *
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.service ? 'border-red-300' : 'border-gray-300'
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
                      <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('contact.form.eventDate') || 'Event Date'}
                      </label>
                      <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('contact.form.location') || 'Location'}
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder={t('contact.form.locationPlaceholder') || 'Venue or location'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.message') || 'Message'} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.message ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={t('contact.form.messagePlaceholder') || 'Tell me about your project, vision, and any specific requirements...'}
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {t('contact.info.title') || 'Get in touch'}
              </h2>

              <div className="space-y-8">
                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('contact.info.phone') || 'Phone'}
                    </h3>
                    <p className="text-gray-600">{CONTACT_INFO.phone}</p>
                    <a
                      href={`tel:${CONTACT_INFO.phone}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {t('contact.info.call') || 'Call me'}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                    <p className="text-gray-600">{CONTACT_INFO.phone}</p>
                    <a
                      href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      {t('contact.info.whatsapp') || 'Send message'}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✉️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('contact.info.email') || 'Email'}
                    </h3>
                    <p className="text-gray-600">{CONTACT_INFO.email}</p>
                    <a
                      href={`mailto:${CONTACT_INFO.email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {t('contact.info.sendEmail') || 'Send email'}
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('contact.info.location') || 'Location'}
                    </h3>
                    <p className="text-gray-600">
                      {t('contact.info.locationDetail') || 'Santo Domingo, Dominican Republic'}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {t('contact.info.serviceArea') || 'Serving Punta Cana and surrounding areas'}
                    </p>
                  </div>
                </div>

                {/* Booking */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('contact.info.booking') || 'Book Consultation'}
                    </h3>
                    <p className="text-gray-600 mb-2">
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
              <div className="mt-8 p-6 bg-primary-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('contact.info.response') || 'Response Time'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('contact.info.responseDetail') || 'I typically respond to messages within 2-4 hours during business days.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="bg-white pb-16">
        <div className="container mx-auto px-4">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120960.31256939957!2d-70.02271!3d18.48607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eaf89ecf5f97d2f%3A0xf4be80f7ede2f8c8!2sSanto%20Domingo%2C%20Dominican%20Republic!5e0!3m2!1sen!2s!4v1712500000000!5m2!1sen!2s"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: '16px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Fotógrafo Santo Domingo — Ubicación"
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('contact.faq.title') || 'Frequently Asked Questions'}
              </h2>
              <p className="text-xl text-gray-600">
                {t('contact.faq.subtitle') || 'Common questions about working together'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('contact.faq.q1') || 'How far in advance should I book?'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('contact.faq.a1') || 'For weddings and events, I recommend booking 6-12 months in advance. For portraits and smaller sessions, 2-4 weeks is usually sufficient.'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('contact.faq.q2') || 'Do you travel for shoots?'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('contact.faq.a2') || 'Yes! I serve Santo Domingo, Punta Cana, and surrounding areas. Travel fees may apply for locations outside the main service area.'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('contact.faq.q3') || 'What is your editing process?'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('contact.faq.a3') || 'I use professional editing software to enhance colors, lighting, and composition while maintaining authenticity. Delivery typically takes 2-4 weeks.'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('contact.faq.q4') || 'Do you offer payment plans?'}
                </h3>
                <p className="text-gray-600 text-sm">
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