set -euo pipefail

echo "1) Containers running?"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E 'blog-(back|front)end' \
  && echo "✅ containers up" \
  || { echo "❌ blog-backend/blog-frontend not running"; docker ps; exit 1; }

echo
echo "2) Backend health (GET /api/health)"
body="$(curl -sS http://localhost:8080/api/health || true)"
echo "↳ $body"
echo "$body" | grep -qiE 'ok|healthy|up' && echo "✅ backend healthy" || echo "⚠️ unexpected health body"

echo
echo "3) Backend logs (looking for 'Mongo connected' and 'Backend listening')"
docker logs --tail 120 blog-backend 2>&1 | grep -Ei 'Mongo connected|Backend listening' \
  && echo "✅ mongo + server look good" \
  || echo "⚠️ did not see expected lines (might be older than tail)"

echo
echo "4) API sample data (GET /api/posts)"
curl -sS http://localhost:8080/api/posts | sed -n '1,120p' && echo "✅ posts endpoint reachable"

echo
echo "5) Frontend reachable on :8081"
curl -sS -o /dev/null -w "↳ HTTP %{http_code}\n" http://localhost:8081 | grep -q "HTTP 200" \
  && echo "✅ frontend HTTP 200" \
  || echo "❌ frontend not serving 200"

echo
echo "Done ✅"