#!/bin/bash
#
# Warm the Next.js image optimization cache for all album photos.
# Run this after a fresh deploy or container rebuild.
#
# Usage:  ./scripts/warm-cache.sh [BASE_URL]
# Example: ./scripts/warm-cache.sh https://photos.cloudeffect.nl
#

BASE_URL="${1:-http://localhost:3000}"

# Image widths to pre-cache:
#   256  = thumbnail grid (mobile)
#   640  = thumbnail grid (tablet)
#   1080 = lightbox full view
WIDTHS=(256 640 1080)
QUALITY=75
THUMB_QUALITY=50
CONCURRENT=6

echo "🔥 Warming image cache on ${BASE_URL}"
echo "   Widths: ${WIDTHS[*]}"
echo "   Concurrent requests: ${CONCURRENT}"
echo ""

# Fetch all albums
ALBUMS_JSON=$(curl -s "${BASE_URL}/api/albums")
if [ -z "$ALBUMS_JSON" ] || [ "$ALBUMS_JSON" = "null" ]; then
    echo "❌ Could not fetch albums from ${BASE_URL}/api/albums"
    exit 1
fi

ALBUM_IDS=$(echo "$ALBUMS_JSON" | python3 -c "
import json, sys
albums = json.load(sys.stdin)
for a in albums:
    print(a['id'])
")

TOTAL_ALBUMS=$(echo "$ALBUM_IDS" | wc -l | tr -d ' ')
echo "📁 Found ${TOTAL_ALBUMS} albums"
echo ""

TOTAL_REQUESTS=0
COMPLETED=0
FAILED=0
ALBUM_NUM=0

for ALBUM_ID in $ALBUM_IDS; do
    ALBUM_NUM=$((ALBUM_NUM + 1))

    # Fetch album details with photos
    ALBUM_JSON=$(curl -s "${BASE_URL}/api/albums/${ALBUM_ID}")
    ALBUM_TITLE=$(echo "$ALBUM_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin).get('title','?'))" 2>/dev/null)
    PHOTO_URLS=$(echo "$ALBUM_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for p in data.get('photos', []):
    print(p.get('src', ''))
" 2>/dev/null)

    PHOTO_COUNT=$(echo "$PHOTO_URLS" | grep -c .)
    echo "[$ALBUM_NUM/$TOTAL_ALBUMS] 📸 ${ALBUM_TITLE} (${PHOTO_COUNT} photos)"

    while IFS= read -r PHOTO_URL; do
        [ -z "$PHOTO_URL" ] && continue

        # URL-encode the photo path for the _next/image endpoint
        ENCODED_URL=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$PHOTO_URL")

        for WIDTH in "${WIDTHS[@]}"; do
            # Use lower quality for small thumbnails
            if [ "$WIDTH" -le 256 ]; then
                Q=$THUMB_QUALITY
            else
                Q=$QUALITY
            fi

            CACHE_URL="${BASE_URL}/_next/image?url=${ENCODED_URL}&w=${WIDTH}&q=${Q}"
            TOTAL_REQUESTS=$((TOTAL_REQUESTS + 1))

            # Fire request in background, limit concurrency
            (
                HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$CACHE_URL")
                if [ "$HTTP_CODE" != "200" ]; then
                    echo "  ⚠️  ${HTTP_CODE} - w=${WIDTH} ${PHOTO_URL}"
                fi
            ) &

            # Limit concurrent requests
            if [ $((TOTAL_REQUESTS % CONCURRENT)) -eq 0 ]; then
                wait
            fi
        done
    done <<< "$PHOTO_URLS"

    # Wait for remaining requests per album
    wait
done

echo ""
echo "✅ Cache warming complete!"
echo "   Total image requests: ${TOTAL_REQUESTS}"
echo "   Albums processed: ${TOTAL_ALBUMS}"
