#!/usr/bin/env node
/**
 * Captures screenshots of all key app pages and sections.
 * If the app shows the login screen, logs in using SCREENSHOT_USER and SCREENSHOT_PASSWORD env vars.
 * Alternatively, start the dev server with REACT_APP_SCREENSHOT_MODE=1 to skip login.
 * Saves to /screenshots/ with deterministic names.
 */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const ROUTES = [
  { path: "/", name: "dashboard" },
  { path: "/create", name: "new-session" },
  { path: "/tech", name: "tech-architecture-full" },
  { path: "/governance", name: "governance" },
];

const TECH_SECTIONS = [
  { hash: "end-to-end-flow", name: "tech-architecture-flow" },
  { hash: "after-brief", name: "tech-architecture-after-brief" },
  { hash: "architecture-deep-dive", name: "tech-architecture-deep-dive" },
  { hash: "stack", name: "tech-architecture-stack" },
  { hash: "aws-console-evidence", name: "tech-architecture-evidence" },
];

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(BASE_URL, (res) => resolve(res.statusCode === 200));
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => { req.destroy(); resolve(false); });
  });
}

function waitForServer(maxWaitMs = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function tick() {
      if (Date.now() - start > maxWaitMs) return reject(new Error("Server did not become ready"));
      checkServer().then((ok) => {
        if (ok) return resolve();
        setTimeout(tick, 1500);
      });
    }
    tick();
  });
}

function startDevServer() {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, REACT_APP_SCREENSHOT_MODE: "1", CI: "1", BROWSER: "none" };
    const child = spawn("npm", ["run", "start"], {
      cwd: path.join(__dirname, "..", "frontend"),
      env,
      stdio: "pipe",
      shell: true,
    });
    let stderr = "";
    child.stderr.on("data", (d) => { stderr += d.toString(); });
    child.on("error", reject);
    resolve({ child, stderr: () => stderr });
  });
}

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  let serverChild = null;
  const serverAlreadyUp = await checkServer();
  if (!serverAlreadyUp) {
    console.log("Starting frontend with REACT_APP_SCREENSHOT_MODE=1...");
    const { child } = startDevServer();
    serverChild = child;
    await waitForServer();
    console.log("Server ready.");
  } else {
    console.log("Using existing server on port", PORT);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: DESKTOP_VIEWPORT,
    reducedMotion: "reduce",
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);

  const signInButton = page.getByRole("button", { name: /Sign in/i });
  const emailInput = page.getByPlaceholder(/Enter your email/i).first();
  const hasLoginForm = (await emailInput.count()) > 0;

  if (hasLoginForm) {
    const user = process.env.SCREENSHOT_USER;
    const pass = process.env.SCREENSHOT_PASSWORD;
    if (!user || !pass) {
      console.error("Login page detected. Set SCREENSHOT_USER and SCREENSHOT_PASSWORD env vars, or start the app with REACT_APP_SCREENSHOT_MODE=1.");
      process.exit(1);
    }
    console.log("Logging in...");
    await emailInput.fill(user);
    await page.getByPlaceholder(/password/i).first().fill(pass);
    await signInButton.click();
    await page.waitForTimeout(3000);
    await page.waitForSelector('nav a[href="/create"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
  }

  for (const { path: routePath, name } of ROUTES) {
    const url = `${BASE_URL}${routePath}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(800);
    const out = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: out, fullPage: true });
    console.log("Saved", out);
  }

  await page.goto(`${BASE_URL}/tech`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(500);
  for (const { hash, name } of TECH_SECTIONS) {
    const id = hash.replace(/^#/, "");
    const sectionSelector = `section:has([id="${id}"])`;
    const headingSelector = `#${id}`;
    const el = await page.locator(sectionSelector).first();
    const count = await el.count();
    if (count === 0) {
      const fallback = await page.locator(headingSelector).first();
      if ((await fallback.count()) === 0) {
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`), fullPage: false });
        console.log("Saved (no section)", `${name}.png`);
        continue;
      }
      await fallback.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`), fullPage: false });
    } else {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await el.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`) }).catch(() =>
        page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`), fullPage: false })
      );
    }
    console.log("Saved", `${name}.png`);
  }

  const mobileContext = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    reducedMotion: "reduce",
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: "networkidle", timeout: 30000 });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({
    path: path.join(SCREENSHOTS_DIR, "dashboard-mobile.png"),
    fullPage: true,
  });
  console.log("Saved dashboard-mobile.png");
  await mobileContext.close();

  await context.close();
  await browser.close();

  if (serverChild) {
    serverChild.kill("SIGTERM");
    console.log("Stopped dev server.");
  }
  console.log("Screenshots done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
