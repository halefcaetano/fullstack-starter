const request = require("supertest");
const BASE = process.env.BASE || "http://localhost:4000";

describe("REST: health + chat history", () => {
  it("GET /api/health -> { ok: true }", async () => {
    const res = await request(BASE).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
  });

  it("GET /api/chat/history -> array", async () => {
    const res = await request(BASE).get("/api/chat/history?limit=5");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
