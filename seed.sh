set -euo pipefail
echo "Seeding one post through Atlas (direct) and checking API..."

if ! command -v docker >/dev/null; then
  echo "docker not found"; exit 1
fi

: "${MONGODB_URI:?Please export MONGODB_URI first}"

echo "1) Insert in Atlas (direct via mongosh in Docker)..."
docker run --rm mongo:7.0-jammy mongosh "$MONGODB_URI" --eval \
'db.posts.insertOne({ title:"Hello from seed", body:"Seeded via mongosh", createdAt:new Date() })' \
| sed -n '1,40p'

echo
echo "2) Confirm API returns it"
curl -sS http://localhost:8080/api/posts | sed -n '1,120p'

echo
echo "Done ✅"