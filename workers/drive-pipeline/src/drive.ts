import type { DriveFile, DriveGroup, Env } from './types'

// Cached per-invocation so we don't refresh on every Drive call
let cachedToken: { token: string; expiry: number } | null = null

async function getAccessToken(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiry > now + 60) return cachedToken.token

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) throw new Error(`Google token refresh failed: ${await res.text()}`)
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
  env: Env,
  rootFolderId: string,
  processedKeys: Set<string>,
): Promise<DriveGroup[]> {
  const token = await getAccessToken(env)
  const groups: DriveGroup[] = []

  // Sub-folders → multi-image groups (max 5 images each)
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

export async function downloadFile(fileId: string, env: Env): Promise<ArrayBuffer> {
  const token = await getAccessToken(env)
  const res = await driveGet(`files/${fileId}?alt=media`, token)
  if (!res.ok) throw new Error(`Drive download failed for ${fileId}: ${res.status}`)
  return res.arrayBuffer()
}
