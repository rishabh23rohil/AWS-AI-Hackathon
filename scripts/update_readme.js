#!/usr/bin/env node
/**
 * Rebuilds README.md Screenshots section from files in /screenshots/.
 * Keeps image links deterministic and tidy.
 */

const path = require("path");
const fs = require("fs");

const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");
const README_PATH = path.join(__dirname, "..", "README.md");

const ORDER = [
  "dashboard",
  "dashboard-mobile",
  "new-session",
  "tech-architecture-full",
  "tech-architecture-flow",
  "tech-architecture-after-brief",
  "tech-architecture-deep-dive",
  "tech-architecture-stack",
  "tech-architecture-evidence",
  "governance",
];

const LABELS = {
  "dashboard": "Dashboard",
  "dashboard-mobile": "Dashboard (mobile)",
  "new-session": "New Session",
  "tech-architecture-full": "Tech & Architecture",
  "tech-architecture-flow": "Tech & Architecture — End-to-End Flow",
  "tech-architecture-after-brief": "Tech & Architecture — After Brief",
  "tech-architecture-deep-dive": "Tech & Architecture — Deep Dive",
  "tech-architecture-stack": "Tech & Architecture — Stack",
  "tech-architecture-evidence": "Tech & Architecture — AWS Evidence",
  "governance": "Governance",
};

function getScreenshots() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) return [];
  return fs.readdirSync(SCREENSHOTS_DIR)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .map((f) => f.replace(/\.(png|jpg|jpeg|webp)$/i, ""));
}

function buildScreenshotsSection(names) {
  const ordered = [...ORDER.filter((n) => names.includes(n)), ...names.filter((n) => !ORDER.includes(n))];
  if (ordered.length === 0) return "*(Run `npm run screenshots` to generate.)*\n";
  const lines = ["### Screenshots\n", ""];
  for (const base of ordered) {
    const ext = [".png", ".jpg", ".jpeg", ".webp"].find((e) =>
      fs.existsSync(path.join(SCREENSHOTS_DIR, base + e))
    ) || ".png";
    const label = LABELS[base] || base;
    lines.push(`#### ${label}`);
    lines.push("");
    lines.push(`![${label}](./screenshots/${base}${ext})`);
    lines.push("");
  }
  return lines.join("\n");
}

function main() {
  const names = getScreenshots();
  let readme = fs.existsSync(README_PATH) ? fs.readFileSync(README_PATH, "utf8") : "";

  const startMarker = "<!-- SCREENSHOTS_START -->";
  const endMarker = "<!-- SCREENSHOTS_END -->";
  const startIdx = readme.indexOf(startMarker);
  const endIdx = readme.indexOf(endMarker);

  const newSection = buildScreenshotsSection(names);
  const replacement = startMarker + "\n\n" + newSection + "\n" + endMarker;

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    readme = readme.slice(0, startIdx) + replacement + readme.slice(endIdx + endMarker.length);
  } else {
    const demoIdx = readme.indexOf("## Demo");
    if (demoIdx !== -1) {
      const afterHeading = readme.indexOf("\n", demoIdx) + 1;
      readme = readme.slice(0, afterHeading) + "\n" + replacement + "\n\n" + readme.slice(afterHeading);
    } else {
      const top = readme.indexOf("## ");
      const insert = top !== -1 ? top : readme.length;
      readme = readme.slice(0, insert) + "## Demo\n\n" + replacement + "\n\n" + readme.slice(insert);
    }
  }

  fs.writeFileSync(README_PATH, readme, "utf8");
  console.log("Updated README.md with", names.length, "screenshots.");
}

main();
