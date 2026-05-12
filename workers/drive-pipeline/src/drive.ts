import type { DriveFile, DriveGroup } from './types'

interface ServiceAccount {
  client_email: string
  private_key: string
}

// Cache the token for the lifetime of this Worker invocation
let cachedToken: { token: string; expiry: number } | null = null

function b64url(input: string | ArrayBuffer): string {
  const bytes = typeof input === 'string'
    ? new TextEncoder().encode(input)
    : new Uint8Array(input)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiry > now + 60) return cachedToken.token

  const sa: ServiceAccount = JSON.parse(serviceAccountJson)

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const payload = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/devstorage.read_write',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))

  const signingInput = `${header}.${payload}`

  // Import the RSA private key (PEM → DER)
  const pem = sa.private_key.replace(/-----.*?-----/g, '').replace(/\s/g, '')
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const sigBuf = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput),
  )
  const jwt = `${signingInput}.${b64url(sigBuf)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) throw new Error(`Drive auth failed: ${await res.text()}`)
  const json = await res.json() as { access_token: string; expires_in: number }

  cachedToken = { token: json.access_token, expiry: now + json.expires_in }
  return json.access_token
}

async function driveGet(path: string, token: string): Promise<Response> {
  return fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function listNewGroups(
  serviceAccountJson: string,
  rootFolderId: string,
  processedKeys: Set<string>,
): Promise<DriveGroup[]> {
  const token = await getAccessToken(serviceAccountJson)
  const groups: DriveGroup[] = []

  // Sub-folders → multi-image groups
  const foldersRes = await driveGet(
    `files?q=${encodeURIComponent(`'${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`)}&fields=files(id,name)&orderBy=name`,
    token,
  )
  if (foldersRes.ok) {
    const { files: folders } = await foldersRes.json() as { files: Array<{ id: string; name: string }> }
    for (const folder of folders) {
      if (processedKeys.has(folder.id)) continue
      const imgsRes = await driveGet(
        `files?q=${encodeURIComponent(`'${folder.id}' in parents and mimeType contains 'image/' and trashed=false`)}&fields=files(id,name,mimeType,modifiedTime)&orderBy=name&pageSize=5`,
        token,
      )
      if (!imgsRes.ok) continue
      const { files } = await imgsRes.json() as { files: DriveFile[] }
      if (files.length === 0) continue
      groups.push({ groupKey: folder.id, type: 'multi', files, folderName: folder.name })
    }
  }

  // Root-level images → single-image groups
  const imgsRes = await driveGet(
    `files?q=${encodeURIComponent(`'${rootFolderId}' in parents and mimeType contains 'image/' and trashed=false`)}&fields=files(id,name,mimeType,modifiedTime)&orderBy=createdTime desc&pageSize=20`,
    token,
  )
  if (imgsRes.ok) {
    const { files } = await imgsRes.json() as { files: DriveFile[] }
    for (const file of files) {
      if (processedKeys.has(file.id)) continue
      groups.push({ groupKey: file.id, type: 'single', files: [file] })
    }
  }

  return groups
}

export async function downloadFile(fileId: string, serviceAccountJson: string): Promise<ArrayBuffer> {
  const token = await getAccessToken(serviceAccountJson)
  const res = await driveGet(`files/${fileId}?alt=media`, token)
  if (!res.ok) throw new Error(`Drive download failed for ${fileId}: ${res.status}`)
  return res.arrayBuffer()
}
