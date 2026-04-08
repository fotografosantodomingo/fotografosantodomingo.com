'use server'

import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { sendContactNotification, sendContactConfirmation } from '@/lib/email/resend'

type ContactFormData = {
  name: string
  email: string
  phone?: string
  service?: string
  message: string
  eventDate?: string
  location?: string
}

export async function submitContactForm(formData: ContactFormData) {
  try {
    const headersList = headers()
    const locale = headersList.get('x-locale') || 'es'

    // Basic validation
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.message?.trim()) {
      return { success: false, error: 'Missing required fields' }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return { success: false, error: 'Invalid email format' }
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || null,
        service: formData.service || null,
        message: formData.message.trim(),
        event_date: formData.eventDate || null,
        location: formData.location?.trim() || null,
        locale,
      })
      .select()
      .single()

    if (error) {
      console.error('DB insert error:', error)
      return { success: false, error: 'Failed to save submission' }
    }

    // Send emails — don't block success on email failure
    try {
      await sendContactNotification({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message,
        eventDate: data.event_date,
        location: data.location,
        submittedAt: data.created_at,
        locale: data.locale,
      })
      await sendContactConfirmation({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message,
        eventDate: data.event_date,
        location: data.location,
        submittedAt: data.created_at,
        locale: data.locale,
      })
    } catch (emailErr) {
      console.warn('Email send failed (submission still saved):', emailErr)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Contact form submission error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}