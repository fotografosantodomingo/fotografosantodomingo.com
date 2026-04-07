'use server'

import { headers } from 'next/headers'

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
    const locale = headersList.get('x-locale') || 'en'

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-locale': locale,
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit contact form')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Contact form submission error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}