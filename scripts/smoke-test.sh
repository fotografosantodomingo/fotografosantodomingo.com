#!/bin/bash
set -euo pipefail

# Config
BASE_URL="${BASE_URL:-https://www.fotografosantodomingo.com}"
ADMIN_SECRET="${ADMIN_SECRET:-}"
FOLDER="${FOLDER:-PUBLISH_Wedding_PuntaCana_ZoniAndCarlos_ES}"
PUBLIC_ID="${PUBLIC_ID:-${FOLDER}/photo_001}"
PUBLISHED_AT="${PUBLISHED_AT:-2026-04-07T12:00:00Z}"
IDEMPOTENCY_KEY="${IDEMPOTENCY_KEY:-$(printf '%s|%s' "$PUBLIC_ID" "$PUBLISHED_AT" | shasum -a 256 | awk '{print $1}')}"

# Counters
PASS=0
FAIL=0
WARNINGS=()

# Helpers
pass() { echo "✅  $1"; ((PASS+=1)); }
fail() { echo "❌  $1"; ((FAIL+=1)); }
warn() { echo "⚠️   $1"; WARNINGS+=("$1"); }
header() { echo ""; echo "━━━ $1 ━━━"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

json_field() {
  local file="$1"
  local expr="$2"
  jq -er "$expr" "$file"
}

json_contains() {
  local file="$1"
  local expr="$2"
  jq -e "$expr" "$file" >/dev/null 2>&1
}

body_contains() {
  local file="$1"
  local needle="$2"
  grep -q "$needle" "$file"
}

request() {
  local method="$1"
  local url="$2"
  local body_file="$3"
  local auth_mode="$4"
  local payload_file="${5:-}"

  local curl_args=(
    -sS
    -X "$method"
    "$url"
    -o "$body_file"
    -w "%{http_code}"
  )

  if [[ "$auth_mode" == "auth" ]]; then
    curl_args+=( -H "Authorization: Bearer $ADMIN_SECRET" )
  elif [[ "$auth_mode" == "wrong-auth" ]]; then
    curl_args+=( -H "Authorization: Bearer wrongtoken" )
  fi

  if [[ -n "$payload_file" ]]; then
    curl_args+=( -H "Content-Type: application/json" --data @"$payload_file" )
  fi

  curl "${curl_args[@]}"
}

write_happy_payload() {
  local file="$1"
  cat > "$file" <<JSON
{
  "slug_es": "fotografia-boda-punta-cana-zoni-carlos",
  "slug_en": "wedding-photography-punta-cana-zoni-carlos",
  "title_es": "Fotografía de Boda en Punta Cana — Zoni & Carlos",
  "title_en": "Wedding Photography in Punta Cana — Zoni & Carlos",
  "content_es": "Punta Cana ofrece uno de los escenarios más espectaculares del Caribe para una boda en la playa. Zoni y Carlos celebraron una ceremonia íntima al atardecer en Playa Macao, rodeados de luz cálida, brisa marina y un ambiente elegante que hizo que cada fotografía se sintiera natural y emotiva. Desde los preparativos en el resort hasta los retratos frente al mar, cada imagen fue trabajada con composición limpia, dirección ligera y atención total a los detalles reales de la pareja. En Babula Shots documentamos bodas en República Dominicana con un enfoque personalizado, pensado para parejas que valoran recuerdos auténticos y una estética profesional. Si estás planificando tu boda en Punta Cana y quieres una cobertura visual sólida, clara y emocional, podemos ayudarte a construir esa historia. WhatsApp +1 809 720 9547.",
  "content_en": "Punta Cana is one of the most spectacular beach wedding settings in the Caribbean. Zoni and Carlos held an intimate sunset ceremony at Playa Macao, surrounded by warm light, ocean breeze and a refined atmosphere that made every image feel natural and emotional. From getting ready at the resort to the portraits by the shore, every frame was built with clean composition, light direction and full attention to the real details that mattered to the couple. At Babula Shots we document weddings in Dominican Republic with a personalized approach for couples who want authentic memories and polished visual storytelling. If you are planning your wedding in Punta Cana and want photography that feels elegant, clear and emotionally grounded, we can help you build that story. WhatsApp +1 809 720 9547.",
  "excerpt_es": "La boda de Zoni y Carlos en Punta Cana fue capturada con luz natural, playa caribeña y fotografía de boda profesional en República Dominicana.",
  "excerpt_en": "Zoni and Carlos wedding in Punta Cana was captured with natural light, Caribbean beach scenery and professional wedding photography in Dominican Republic.",
  "meta_description_es": "Fotografía de boda en Punta Cana por Babula Shots RD. Sesiones en la playa, luz natural y recuerdos para toda la vida en República Dominicana.",
  "meta_description_en": "Wedding photography in Punta Cana by Babula Shots RD. Beach sessions, natural light and memories for a lifetime in Dominican Republic.",
  "og_title_es": "Boda en Punta Cana — Zoni & Carlos | Babula Shots RD",
  "og_title_en": "Wedding in Punta Cana — Zoni & Carlos | Babula Shots RD",
  "primary_keyword_es": "fotografía de boda punta cana",
  "primary_keyword_en": "wedding photography punta cana",
  "cover_image_url": "https://res.cloudinary.com/dwewurxla/image/upload/c_fill,g_auto,w_1200,h_630,q_auto,f_webp/${PUBLIC_ID}",
  "cover_image_thumbnail_url": "https://res.cloudinary.com/dwewurxla/image/upload/c_fill,g_auto,w_600,h_400,q_auto,f_webp/${PUBLIC_ID}",
  "cover_image_placeholder_url": "https://res.cloudinary.com/dwewurxla/image/upload/c_fill,g_auto,w_20,h_13,q_10,f_webp,e_blur:200/${PUBLIC_ID}",
  "cover_image_alt_es": "Fotografía de boda en la playa de Punta Cana República Dominicana luz natural — Babula Shots RD",
  "cover_image_alt_en": "Beach wedding photography in Punta Cana Dominican Republic natural light — Babula Shots RD",
  "cover_image_format": "webp",
  "cover_image_public_id": "${PUBLIC_ID}",
  "schema_service_type": "WeddingPhotography",
  "geo_city": "Punta Cana",
  "geo_country": "Dominican Republic",
  "service_type": "wedding",
  "location": "Punta Cana",
  "cloudinary_folder": "${FOLDER}",
  "status": "published",
  "published_at": "${PUBLISHED_AT}"
}
JSON
}

write_invalid_webp_payload() {
  local source_file="$1"
  local output_file="$2"
  jq '
    .slug_es = "fotografia-boda-punta-cana-zoni-carlos-webp-invalido" |
    .slug_en = "wedding-photography-punta-cana-zoni-carlos-invalid-webp" |
    .cover_image_url = "https://res.cloudinary.com/dwewurxla/image/upload/photo_001.jpg"
  ' "$source_file" > "$output_file"
}

write_missing_fields_payload() {
  local file="$1"
  cat > "$file" <<JSON
{
  "slug_es": "test"
}
JSON
}

write_success_log_payload() {
  local file="$1"
  cat > "$file" <<JSON
{
  "idempotency_key": "${IDEMPOTENCY_KEY}",
  "folder": "${FOLDER}",
  "public_id": "${PUBLIC_ID}",
  "image_format": "webp",
  "service_type": "wedding",
  "location": "Punta Cana",
  "language": "ES",
  "status": "success",
  "post_id": "${POST_ID}",
  "blog_url_es": "${BLOG_URL_ES}",
  "blog_url_en": "${BLOG_URL_EN}",
  "instagram_status": "success",
  "facebook_status": "success",
  "linkedin_status": "failed",
  "pinterest_status": "success",
  "completed_at": "2026-04-07T12:05:00Z"
}
JSON
}

write_failed_openai_log_payload() {
  local file="$1"
  local failed_key
  failed_key="$(printf '%s' 'PUBLISH_Fashion_SantoDomingo_LeonelLirioSS25_ES/photo_001|2026-04-07T13:00:00Z' | shasum -a 256 | awk '{print $1}')"
  cat > "$file" <<JSON
{
  "idempotency_key": "${failed_key}",
  "folder": "PUBLISH_Fashion_SantoDomingo_LeonelLirioSS25_ES",
  "public_id": "PUBLISH_Fashion_SantoDomingo_LeonelLirioSS25_ES/photo_001",
  "image_format": "webp",
  "service_type": "fashion",
  "location": "Santo Domingo",
  "language": "ES",
  "status": "failed_openai",
  "phase": "B",
  "error_message": "OpenAI API timeout after 3 retries",
  "instagram_status": "skipped",
  "facebook_status": "skipped",
  "linkedin_status": "skipped",
  "pinterest_status": "skipped",
  "completed_at": "2026-04-07T13:00:00Z"
}
JSON
}

require_cmd curl
require_cmd jq
require_cmd shasum
require_cmd awk

if [[ -z "$ADMIN_SECRET" ]]; then
  echo "Set ADMIN_SECRET in your environment before running this script."
  echo "Example: ADMIN_SECRET='your-token' ./scripts/smoke-test.sh"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

POST_ID=""
BLOG_URL_ES=""
BLOG_URL_EN=""

HAPPY_PAYLOAD="$TMP_DIR/happy.json"
INVALID_WEBP_PAYLOAD="$TMP_DIR/invalid-webp.json"
MISSING_FIELDS_PAYLOAD="$TMP_DIR/missing-fields.json"
SUCCESS_LOG_PAYLOAD="$TMP_DIR/success-log.json"
FAILED_OPENAI_PAYLOAD="$TMP_DIR/failed-openai.json"

write_happy_payload "$HAPPY_PAYLOAD"
write_invalid_webp_payload "$HAPPY_PAYLOAD" "$INVALID_WEBP_PAYLOAD"
write_missing_fields_payload "$MISSING_FIELDS_PAYLOAD"

header "Test 1: POST /api/admin/create-post — happy path"
BODY="$TMP_DIR/test1.json"
STATUS="$(request POST "$BASE_URL/api/admin/create-post" "$BODY" auth "$HAPPY_PAYLOAD")"
if [[ "$STATUS" == "201" ]] && \
   json_contains "$BODY" '.success == true' && \
   json_contains "$BODY" '.url_es | contains("/es/blog/")' && \
   json_contains "$BODY" '.url_en | contains("/en/blog/")'; then
  POST_ID="$(json_field "$BODY" '.post_id')"
  BLOG_URL_ES="$(json_field "$BODY" '.url_es')"
  BLOG_URL_EN="$(json_field "$BODY" '.url_en')"
  pass "create-post happy path returned 201 and captured post_id/blog URLs"
else
  fail "create-post happy path failed (HTTP $STATUS)"
fi

header "Test 2: GET blog_url_es — confirm page is live"
BODY="$TMP_DIR/test2.html"
STATUS="$(request GET "$BLOG_URL_ES" "$BODY" none)"
if [[ "$STATUS" == "200" ]] && body_contains "$BODY" 'fotografia-boda-punta-cana-zoni-carlos'; then
  pass "ES blog URL returned 200 and contains slug_es"
else
  fail "ES blog URL did not return expected content (HTTP $STATUS)"
fi

header "Test 3: GET blog_url_en — confirm page is live"
BODY="$TMP_DIR/test3.html"
STATUS="$(request GET "$BLOG_URL_EN" "$BODY" none)"
if [[ "$STATUS" == "200" ]] && body_contains "$BODY" 'wedding-photography-punta-cana-zoni-carlos'; then
  pass "EN blog URL returned 200 and contains slug_en"
else
  fail "EN blog URL did not return expected content (HTTP $STATUS)"
fi

header "Test 4: POST /api/admin/create-post — duplicate slug"
BODY="$TMP_DIR/test4.json"
STATUS="$(request POST "$BASE_URL/api/admin/create-post" "$BODY" auth "$HAPPY_PAYLOAD")"
if [[ "$STATUS" == "409" ]] && json_contains "$BODY" 'has("conflicting_field")'; then
  pass "duplicate slug returned 409 with conflicting_field"
else
  fail "duplicate slug test failed (HTTP $STATUS)"
fi

header "Test 5: POST /api/admin/create-post — wrong bearer token"
BODY="$TMP_DIR/test5.json"
STATUS="$(request POST "$BASE_URL/api/admin/create-post" "$BODY" wrong-auth "$MISSING_FIELDS_PAYLOAD")"
if [[ "$STATUS" == "401" ]] && json_contains "$BODY" '.error == "Unauthorized"'; then
  pass "wrong bearer token returned 401 Unauthorized"
else
  fail "wrong bearer token test failed (HTTP $STATUS)"
fi

header "Test 6: POST /api/admin/create-post — invalid WebP URL"
BODY="$TMP_DIR/test6.json"
STATUS="$(request POST "$BASE_URL/api/admin/create-post" "$BODY" auth "$INVALID_WEBP_PAYLOAD")"
if [[ "$STATUS" == "422" ]] && json_contains "$BODY" '.details | tostring | contains("cover_image_url")'; then
  pass "invalid WebP URL returned 422 with cover_image_url in validation details"
else
  fail "invalid WebP test failed (HTTP $STATUS)"
fi

header "Test 7: POST /api/admin/log-automation — success log"
write_success_log_payload "$SUCCESS_LOG_PAYLOAD"
BODY="$TMP_DIR/test7.json"
STATUS="$(request POST "$BASE_URL/api/admin/log-automation" "$BODY" auth "$SUCCESS_LOG_PAYLOAD")"
if [[ "$STATUS" == "200" ]] && json_contains "$BODY" '.success == true'; then
  pass "success log returned 200 with success=true"
else
  fail "success log test failed (HTTP $STATUS)"
fi

header "Test 8: POST /api/admin/log-automation — duplicate idempotency key"
BODY="$TMP_DIR/test8.json"
STATUS="$(request POST "$BASE_URL/api/admin/log-automation" "$BODY" auth "$SUCCESS_LOG_PAYLOAD")"
if [[ "$STATUS" == "200" ]] && json_contains "$BODY" '.success == true'; then
  pass "duplicate idempotency key returned 200 with success=true"
  warn "Duplicate row check cannot be confirmed from curl alone; verify automation_logs in Supabase manually."
else
  fail "duplicate idempotency test failed (HTTP $STATUS)"
fi

header "Test 9: POST /api/admin/log-automation — failed_openai log"
write_failed_openai_log_payload "$FAILED_OPENAI_PAYLOAD"
BODY="$TMP_DIR/test9.json"
STATUS="$(request POST "$BASE_URL/api/admin/log-automation" "$BODY" auth "$FAILED_OPENAI_PAYLOAD")"
if [[ "$STATUS" == "200" ]] && json_contains "$BODY" '.success == true'; then
  pass "failed_openai log returned 200 with success=true"
else
  fail "failed_openai log test failed (HTTP $STATUS)"
fi

header "Test 10: POST /api/admin/create-post — missing required fields"
BODY="$TMP_DIR/test10.json"
STATUS="$(request POST "$BASE_URL/api/admin/create-post" "$BODY" auth "$MISSING_FIELDS_PAYLOAD")"
if [[ "$STATUS" == "422" ]]; then
  pass "missing required fields returned 422"
else
  fail "missing required fields test failed (HTTP $STATUS)"
fi

header "Test 11: GET /es/blog/ — blog listing includes new post"
BODY="$TMP_DIR/test11.html"
STATUS="$(request GET "$BASE_URL/es/blog/" "$BODY" none)"
if [[ "$STATUS" == "200" ]] && body_contains "$BODY" 'fotografia-boda-punta-cana-zoni-carlos'; then
  pass "ES blog listing returned 200 and contains slug_es"
else
  fail "ES blog listing test failed (HTTP $STATUS)"
fi

header "Test 12: GET /en/blog/ — blog listing includes new post"
BODY="$TMP_DIR/test12.html"
STATUS="$(request GET "$BASE_URL/en/blog/" "$BODY" none)"
if [[ "$STATUS" == "200" ]] && body_contains "$BODY" 'wedding-photography-punta-cana-zoni-carlos'; then
  pass "EN blog listing returned 200 and contains slug_en"
else
  fail "EN blog listing test failed (HTTP $STATUS)"
fi

header "Test 13: auth check for /api/admin/create-post without Bearer header"
BODY="$TMP_DIR/test13.json"
STATUS="$(request POST "$BASE_URL/api/admin/create-post" "$BODY" none "$MISSING_FIELDS_PAYLOAD")"
if [[ "$STATUS" == "401" ]]; then
  pass "create-post without Bearer returned 401"
else
  fail "create-post without Bearer test failed (HTTP $STATUS)"
fi
warn "Requested GET auth test was adjusted to POST because /api/admin/create-post is POST-only and GET returns 405 by design."

header "Test 14: auth check for /api/admin/log-automation without Bearer header"
BODY="$TMP_DIR/test14.json"
STATUS="$(request POST "$BASE_URL/api/admin/log-automation" "$BODY" none "$SUCCESS_LOG_PAYLOAD")"
if [[ "$STATUS" == "401" ]]; then
  pass "log-automation without Bearer returned 401"
else
  fail "log-automation without Bearer test failed (HTTP $STATUS)"
fi
warn "Requested GET auth test was adjusted to POST because /api/admin/log-automation is POST-only and GET returns 405 by design."

header "Test 15: Cleanup — archive the test post"
warn "Skipped cleanup: no archive/update-status admin endpoint exists yet for blog_posts."

echo ""
echo "════════════════════════════════════════"
echo "  SMOKE TEST RESULTS"
echo "════════════════════════════════════════"
echo "  ✅ Passed:  $PASS"
echo "  ❌ Failed:  $FAIL"
echo ""
if [ ${#WARNINGS[@]} -gt 0 ]; then
  echo "  Warnings:"
  for w in "${WARNINGS[@]}"; do echo "    ⚠️  $w"; done
  echo ""
fi
if [ $FAIL -eq 0 ]; then
  echo "  🟢 All tests passed. Ready for Make.com connection."
else
  echo "  🔴 $FAIL test(s) failed. Fix before connecting Make.com."
fi
echo "════════════════════════════════════════"
exit $FAIL