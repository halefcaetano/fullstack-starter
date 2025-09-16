// tests-e2e/chat.spec.ts
import { test, expect } from "@playwright/test";

// helper registers a user or ignores 409 if already exists
async function ensureUser(page, baseURL: string, username: string) {
  // go to Register
  await page.goto(`${baseURL}/register`);
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Email").fill(`${username}@test.com`);
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: /register/i }).click();

  // If already exists, your API may show an error toast. If you prefer,
  // you can navigate to /login and sign in instead.
  // Try fall back to login if we're not on home after submit:
  if (!page.url().includes("/recipes") && !page.url().endsWith("/")) {
    await page.goto(`${baseURL}/login`);
    await page.getByLabel("Email").fill(`${username}@test.com`);
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: /login/i }).click();
  }

  // expect we land on home after auth
  await page.waitForURL(/(\/recipes|\/$)/, { timeout: 10_000 });
}

test("two users can chat and see persisted messages", async ({ browser, baseURL }) => {
  // Launch two isolated contexts
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();

  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  const uA = `userA_${Date.now()}`;
  const uB = `userB_${Date.now()}`;

  // Ensure both users exist and are logged in
  await ensureUser(pageA, baseURL!, uA);
  await ensureUser(pageB, baseURL!, uB);

  // Go to Chat
  await pageA.goto(`${baseURL}/chat`);
  await pageB.goto(`${baseURL}/chat`);

  // User A sends message
  const msgA = `hello from ${uA}`;
  await pageA.getByPlaceholder("Type a message…").fill(msgA);
  await pageA.getByRole("button", { name: /^send$/i }).click();

  // Both should see it
  await expect(pageA.locator("text=" + msgA)).toBeVisible();
  await expect(pageB.locator("text=" + msgA)).toBeVisible();

  // Reload B and ensure history persists
  await pageB.reload();
  await expect(pageB.locator("text=" + msgA)).toBeVisible();

  // User B replies
  const msgB = `hi ${uA}, this is ${uB}`;
  await pageB.getByPlaceholder("Type a message…").fill(msgB);
  await pageB.getByRole("button", { name: /^send$/i }).click();

  // Both should see reply
  await expect(pageA.locator("text=" + msgB)).toBeVisible();
  await expect(pageB.locator("text=" + msgB)).toBeVisible();

  await ctxA.close();
  await ctxB.close();
});
