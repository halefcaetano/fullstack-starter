# MongoDB Atlas setup
- Cluster: Cluster97031 (appName=Cluster97031)
- Database: blog
- Collection: posts
- Index: { createdAt: -1 }
- Health: db.runCommand({ ping: 1 }) => ok
- Env: see .env.example (MONGODB_URI, JWT_SECRET). Do NOT commit real values.
