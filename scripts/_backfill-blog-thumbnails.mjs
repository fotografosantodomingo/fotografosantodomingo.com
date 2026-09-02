import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DRY_RUN = process.argv.includes('--dry-run');

function extractFileId(url) {
  // .../blog_media/auto/<groupKey>/<fileId>.<ext>
  const m = url.match(/\/auto\/([^/]+)\/([^/.]+)\.[a-zA-Z0-9]+$/);
  if (!m) return null;
  return { groupKey: m[1], fileId: m[2] };
}

async function uploadFromUrl(remoteUrl, publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'blog-thumbnails';
  const paramsToSign = `folder=${folder}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash('sha1').update(paramsToSign).digest('hex');

  const form = new URLSearchParams();
  form.append('file', remoteUrl);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);
  form.append('overwrite', 'true');
  form.append('public_id', publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, slug_es, cover_image_url, cover_image_thumbnail_url');
  if (error) throw error;

  const affected = data.filter(
    (p) => p.cover_image_url && p.cover_image_thumbnail_url === p.cover_image_url && p.cover_image_url.includes('supabase.co')
  );
  console.log(`Found ${affected.length} affected posts.`);

  let ok = 0, skipped = 0, failed = 0;
  for (const post of affected) {
    const ids = extractFileId(post.cover_image_url);
    if (!ids) {
      console.log(`SKIP (unparseable URL): ${post.slug_es}`);
      skipped++;
      continue;
    }
    const publicId = ids.fileId;
    try {
      if (DRY_RUN) {
        console.log(`[dry-run] would upload ${post.slug_es} -> blog-thumbnails/${publicId}`);
        ok++;
        continue;
      }
      const result = await uploadFromUrl(post.cover_image_url, publicId);
      const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,w_800,q_auto,f_webp/${result.public_id}`;

      const { error: updateErr } = await supabase
        .from('blog_posts')
        .update({ cover_image_thumbnail_url: thumbUrl })
        .eq('id', post.id);
      if (updateErr) throw updateErr;

      console.log(`OK: ${post.slug_es} -> ${thumbUrl} (${result.bytes} bytes, was full-size original)`);
      ok++;
    } catch (e) {
      console.error(`FAIL: ${post.slug_es}:`, e.message);
      failed++;
    }
  }
  console.log(`\nDone. ok=${ok} skipped=${skipped} failed=${failed}`);
}

main();
