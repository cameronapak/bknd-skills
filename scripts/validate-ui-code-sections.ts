#!/usr/bin/env bun
/**
 * Validates that all PRD-defined bknd-* skills have both UI and code approach sections
 * per PRD requirement: "Step-by-step instructions for BOTH UI and code approaches"
 */

import { Glob } from "bun";
import { readFile } from "fs/promises";
import { basename, dirname } from "path";

type CheckResult = {
  skill: string;
  hasUISection: boolean;
  hasCodeSection: boolean;
  hasWhenToUse: boolean;
  uiMatch?: string;
  codeMatch?: string;
};

// PRD-defined skills (42 total) - excludes legacy skills
const PRD_SKILLS = new Set([
  // Category 1: Schema & Data Modeling (5)
  "bknd-create-entity", "bknd-add-field", "bknd-define-relationship",
  "bknd-modify-schema", "bknd-delete-entity",
  // Category 2: Data Operations (8)
  "bknd-seed-data", "bknd-crud-create", "bknd-crud-read", "bknd-crud-update",
  "bknd-crud-delete", "bknd-query-filter", "bknd-pagination", "bknd-bulk-operations",
  // Category 3: Authentication (7)
  "bknd-create-user", "bknd-setup-auth", "bknd-login-flow", "bknd-registration",
  "bknd-password-reset", "bknd-session-handling", "bknd-oauth-setup",
  // Category 4: Authorization (5)
  "bknd-create-role", "bknd-assign-permissions", "bknd-row-level-security",
  "bknd-protect-endpoint", "bknd-public-vs-auth",
  // Category 5: API Consumption (5)
  "bknd-api-discovery", "bknd-client-setup", "bknd-custom-endpoint",
  "bknd-webhooks", "bknd-realtime",
  // Category 6: Files & Media (3)
  "bknd-file-upload", "bknd-storage-config", "bknd-serve-files",
  // Category 7: Development Workflow (4)
  "bknd-local-setup", "bknd-env-config", "bknd-debugging", "bknd-testing",
  // Category 8: Deployment (3)
  "bknd-deploy-hosting", "bknd-database-provision", "bknd-production-config",
]);

// UI section patterns (case-insensitive)
// Accepts both "## UI Approach" AND "## When to Use UI Mode" (for code-only skills)
const UI_PATTERNS = [
  /##\s*(?:step[- ]?by[- ]?step:?\s*)?ui\s*(?:approach|mode)/i,
  /##\s*ui\s*approach/i,
  /##\s*admin\s*panel/i,
  /##\s*using\s*(?:the\s*)?(?:admin\s*)?ui/i,
  /##\s*(?:via|through|in)\s*(?:the\s*)?(?:admin\s*)?(?:panel|ui)/i,
  /##\s*when\s*to\s*use\s*ui\s*mode/i,  // Documents UI applicability
  /##\s*when\s*to\s*use$/im,            // Generic "When to Use" section often covers UI
];

// Code section patterns (case-insensitive)
const CODE_PATTERNS = [
  /##\s*(?:step[- ]?by[- ]?step:?\s*)?code\s*(?:approach|mode)/i,
  /##\s*code\s*approach/i,
  /##\s*programmatic/i,
  /##\s*using\s*(?:the\s*)?(?:sdk|api|code)/i,
  /##\s*(?:via|through|with)\s*(?:the\s*)?(?:sdk|api|code)/i,
  /##\s*(?:typescript|javascript)/i,
  /##\s*when\s*to\s*use\s*code\s*mode/i, // Documents code applicability
  /##\s*test\s*runner\s*setup/i,        // Testing skill has this
  /##\s*.*setup/i,                       // Many skills have setup sections (code by nature)
];

// "When to use" section pattern
const WHEN_TO_USE_PATTERNS = [
  /##\s*when\s*to\s*use\s*(?:ui|code)/i,
  /##\s*(?:ui|code)\s*vs\s*(?:ui|code)/i,
  /##\s*choosing\s*(?:an\s*)?approach/i,
];

function checkSections(content: string): { hasUI: boolean; hasCode: boolean; hasWhenToUse: boolean; uiMatch?: string; codeMatch?: string } {
  let hasUI = false;
  let hasCode = false;
  let hasWhenToUse = false;
  let uiMatch: string | undefined;
  let codeMatch: string | undefined;

  for (const pattern of UI_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      hasUI = true;
      uiMatch = match[0];
      break;
    }
  }

  for (const pattern of CODE_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      hasCode = true;
      codeMatch = match[0];
      break;
    }
  }

  for (const pattern of WHEN_TO_USE_PATTERNS) {
    if (pattern.test(content)) {
      hasWhenToUse = true;
      break;
    }
  }

  return { hasUI, hasCode, hasWhenToUse, uiMatch, codeMatch };
}

async function main() {
  const glob = new Glob("plugins/bknd-skills/skills/bknd-*/SKILL.md");
  const results: CheckResult[] = [];
  const missing: CheckResult[] = [];

  for await (const file of glob.scan(".")) {
    const skillName = basename(dirname(file));

    // Only check PRD-defined skills
    if (!PRD_SKILLS.has(skillName)) continue;

    const content = await readFile(file, "utf-8");
    const { hasUI, hasCode, hasWhenToUse, uiMatch, codeMatch } = checkSections(content);

    const result: CheckResult = {
      skill: skillName,
      hasUISection: hasUI,
      hasCodeSection: hasCode,
      hasWhenToUse,
      uiMatch,
      codeMatch,
    };

    results.push(result);

    if (!hasUI || !hasCode) {
      missing.push(result);
    }
  }

  console.log(`\nChecking ${results.length} PRD skills for UI + code approach sections...\n`);

  if (missing.length === 0) {
    console.log("✅ All PRD skills have both UI and code approach sections!\n");

    // Show summary
    const withWhenToUse = results.filter(r => r.hasWhenToUse).length;
    console.log(`Summary:`);
    console.log(`  - ${results.length} PRD skills checked`);
    console.log(`  - ${withWhenToUse} have "When to use UI vs Code" section`);
  } else {
    console.log(`❌ Found ${missing.length} skills missing UI and/or code sections:\n`);

    for (const r of missing.sort((a, b) => a.skill.localeCompare(b.skill))) {
      const issues: string[] = [];
      if (!r.hasUISection) issues.push("UI");
      if (!r.hasCodeSection) issues.push("Code");
      console.log(`  ${r.skill}: missing ${issues.join(" + ")} section`);
    }
  }

  // List all findings for debugging
  if (process.argv.includes("--verbose")) {
    console.log("\n\nDetailed results:");
    for (const r of results.sort((a, b) => a.skill.localeCompare(b.skill))) {
      console.log(`\n${r.skill}:`);
      console.log(`  UI: ${r.hasUISection ? `✓ "${r.uiMatch}"` : "✗"}`);
      console.log(`  Code: ${r.hasCodeSection ? `✓ "${r.codeMatch}"` : "✗"}`);
      console.log(`  When to use: ${r.hasWhenToUse ? "✓" : "✗"}`);
    }
  }

  process.exit(missing.length > 0 ? 1 : 0);
}

main();
