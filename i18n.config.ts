import {getRequestConfig} from 'next-intl/server'

export default getRequestConfig(async () => {
  const locales = ['en', 'es']
  const defaultMessages = {
    en: (await import('./src/messages/en.json')).default,
    es: (await import('./src/messages/es.json')).default,
  }
  
  return {
    defaultLocale: 'es',
    locales,
    messages: defaultMessages,
  }
})
