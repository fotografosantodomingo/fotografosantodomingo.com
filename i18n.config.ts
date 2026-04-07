import {getRequestConfig} from 'next-intl/server'

export default getRequestConfig(async ({requestLocale}) => {
  const locale = (await requestLocale) ?? 'es'
  const messages = (await import(`./src/messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})
