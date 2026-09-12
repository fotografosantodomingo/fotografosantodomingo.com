#!/usr/bin/env node
// IndexNow submission — pushes URLs to Bing, Yandex, Seznam, Naver and other
// IndexNow-participating search engines in one call. No account or OAuth
// needed: the protocol is just a key file hosted at the domain root proving
// ownership, then a POST with the URL list.
//
// Setup (one-time): the key file is already committed at
//   public/115e0fce0c07f665325fa36fb327802c.txt
// and must be live at:
//   https://www.fotografosantodomingo.com/115e0fce0c07f665325fa36fb327802c.txt
// before submitting, or IndexNow will reject the key.
//
// Usage:
//   URLS_FILE=/tmp/urls.txt node scripts/indexnow-submit.mjs
//   node scripts/indexnow-submit.mjs https://www.fotografosantodomingo.com/es/foo https://www.fotografosantodomingo.com/en/foo

import { readFileSync } from 'node:fs'

const HOST = 'www.fotografosantodomingo.com'
const KEY = '115e0fce0c07f665325fa36fb327802c'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const URLS_FILE = process.env.URLS_FILE

let urls = process.argv.slice(2)
if (URLS_FILE) {
  urls = readFileSync(URLS_FILE, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
}
if (urls.length === 0) {
  console.error('No URLs given. Pass as args or set URLS_FILE.')
  process.exit(1)
}
if (urls.length > 10000) {
  console.error('IndexNow allows max 10,000 URLs per submission.')
  process.exit(1)
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
}

console.log(`Submitting ${urls.length} URL(s) to IndexNow...`)
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
})

console.log('Status:', res.status, res.statusText)
const text = await res.text()
if (text) console.log(text)

if (res.status === 200 || res.status === 202) {
  console.log('✅ Accepted. Bing/Yandex/etc. will crawl these URLs shortly.')
} else {
  console.error('❌ Rejected — check key file is live at', KEY_LOCATION)
  process.exit(1)
}
