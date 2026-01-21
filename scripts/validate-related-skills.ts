#!/usr/bin/env bun
/**
 * Validates that all "Related Skills" sections reference existing skills
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";

const SKILLS_DIR = "./plugins/bknd-skills/skills";

async function getExistingSkills(): Promise<Set<string>> {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const skills = new Set<string>();
  for (const entry of entries) {
    if (entry.isDirectory()) {
      skills.add(entry.name);
    }
  }
  return skills;
}

function extractRelatedSkills(content: string): string[] {
  // Find Related Skills section
  const relatedMatch = content.match(/## Related Skills[\s\S]*?(?=\n## |$)/i);
  if (!relatedMatch) return [];

  const section = relatedMatch[0];
  const skills: string[] = [];

  // Only match bknd-* skill references in bold or list items
  const patterns = [
    /\*\*(bknd-[a-z0-9-]+)\*\*/g,     // bold **bknd-skill**
    /^- \*?\*?(bknd-[a-z0-9-]+)\*?\*?/gm,   // list items - bknd-skill or - **bknd-skill**
    /\[(bknd-[a-z0-9-]+)\]/g,         // links [bknd-skill]
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(section)) !== null) {
      skills.push(match[1]);
    }
  }

  return [...new Set(skills)];
}

async function main() {
  const existingSkills = await getExistingSkills();
  console.log(`Found ${existingSkills.size} skills\n`);

  const issues: { skill: string; missing: string[] }[] = [];
  const noRelatedSection: string[] = [];

  for (const skillName of existingSkills) {
    const skillPath = join(SKILLS_DIR, skillName, "SKILL.md");
    let content: string;
    try {
      content = await readFile(skillPath, "utf-8");
    } catch {
      console.log(`⚠️  Cannot read: ${skillPath}`);
      continue;
    }

    // Check for Related Skills section
    if (!content.toLowerCase().includes("## related skills")) {
      noRelatedSection.push(skillName);
      continue;
    }

    const referenced = extractRelatedSkills(content);
    const missing = referenced.filter(ref => !existingSkills.has(ref));

    if (missing.length > 0) {
      issues.push({ skill: skillName, missing });
    }
  }

  // Report
  if (noRelatedSection.length > 0) {
    console.log("Skills WITHOUT Related Skills section:");
    for (const s of noRelatedSection.sort()) {
      console.log(`  - ${s}`);
    }
    console.log();
  }

  if (issues.length > 0) {
    console.log("Skills with BROKEN Related Skills links:");
    for (const { skill, missing } of issues.sort((a, b) => a.skill.localeCompare(b.skill))) {
      console.log(`  ${skill}:`);
      for (const m of missing) {
        console.log(`    ❌ ${m} (not found)`);
      }
    }
    console.log();
    process.exit(1);
  }

  console.log("✅ All Related Skills links are valid!");
}

main().catch(console.error);
