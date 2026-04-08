'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendContactNotification, sendContactConfirmation } from '@/lib/email/resend'

interface ContactFormData {
  fullName: string
  email: string
  phone?: string
  serviceId?: string
  locationId?: string
  message: string
  preferredDate?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export async function submitContactForm(formData: ContactFormData, locale: string = 'es') {
  const supabase = await createSupabaseServerClient()
  
  try {
    // 1. Save to Supabase database
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        service_id: formData.serviceId,
        location_id: formData.locationId,
        message: formData.message,
        preferred_date: formData.preferredDate ? new Date(formData.preferredDate) : null,
        source_page: `/contact`,
        utm_source: formData.utmSource,
        utm_medium: formData.utmMedium,
        utm_campaign: formData.utmCampaign,
        status: 'new'
      })
      .select()
      .single()

    if (error) throw error

    // 2. Send notification email to admin
    const adminEmailSent = await sendContactNotification({
      id: String(inquiry?.id ?? 'unknown'),
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      service: formData.serviceId,
      location: formData.locationId,
      message: formData.message,
      eventDate: formData.preferredDate,
      submittedAt: new Date().toISOString(),
      locale,
    })

    // 3. Send confirmation email to client
    const clientEmailSent = await sendContactConfirmation({
      id: String(inquiry?.id ?? 'unknown'),
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      service: formData.serviceId,
      location: formData.locationId,
      message: formData.message,
      eventDate: formData.preferredDate,
      submittedAt: new Date().toISOString(),
      locale,
    })

    // 4. Revalidate contact page cache
    revalidatePath(`/${locale}/contact`)

    return {
      success: true,
      inquiryId: inquiry.id,
      message: locale === 'es' 
        ? '¡Gracias! Te responderemos dentro de 24 horas.' 
        : 'Thank you! We\'ll get back to you within 24 hours.',
      emailsSent: {
        admin: adminEmailSent,
        client: clientEmailSent,
      }
    }

  } catch (error) {
    console.error('Contact form submission error:', error)
    
    return {
      success: false,
      message: locale === 'es'
        ? 'Hubo un error. Por favor intenta de nuevo o contáctanos por WhatsApp.'
        : 'An error occurred. Please try again or contact us via WhatsApp.'
    }
  }
}