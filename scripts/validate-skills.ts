#!/usr/bin/env bun
/**
 * Validates all SKILL.md files against Agent Skills spec:
 * - name: 1-64 chars, lowercase letters/numbers/hyphens, no start/end hyphen
 * - description: max 1024 chars, non-empty
 */

import { Glob } from "bun";
import { readFile } from "fs/promises";
import { basename, dirname } from "path";

type ValidationResult = {
  file: string;
  errors: string[];
  warnings: string[];
};

const NAME_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

function extractFrontmatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter: Record<string, string> = {};
  const lines = match[1].split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

async function validateSkill(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = { file: filePath, errors: [], warnings: [] };
  const content = await readFile(filePath, "utf-8");
  const folderName = basename(dirname(filePath));

  const frontmatter = extractFrontmatter(content);

  if (!frontmatter) {
    result.errors.push("Missing YAML frontmatter (must start with ---)");
    return result;
  }

  // Validate name
  if (!frontmatter.name) {
    result.errors.push("Missing required field: name");
  } else {
    const name = frontmatter.name;
    if (name.length < 1 || name.length > 64) {
      result.errors.push(`name must be 1-64 chars (got ${name.length})`);
    }
    if (!NAME_REGEX.test(name)) {
      result.errors.push(`name must be lowercase letters/numbers/hyphens, no start/end hyphen: "${name}"`);
    }
    if (name !== folderName) {
      result.warnings.push(`name "${name}" doesn't match folder "${folderName}"`);
    }
  }

  // Validate description
  if (!frontmatter.description) {
    result.errors.push("Missing required field: description");
  } else {
    const desc = frontmatter.description;
    if (desc.length === 0) {
      result.errors.push("description must be non-empty");
    }
    if (desc.length > 1024) {
      result.errors.push(`description must be max 1024 chars (got ${desc.length})`);
    }
    if (!desc.toLowerCase().includes("use when")) {
      result.warnings.push('description should include "Use when..." trigger phrases');
    }
  }

  return result;
}

async function main() {
  const glob = new Glob("plugins/bknd-skills/skills/*/SKILL.md");
  const files: string[] = [];

  for await (const file of glob.scan(".")) {
    files.push(file);
  }

  console.log(`\nValidating ${files.length} SKILL.md files...\n`);

  let errorCount = 0;
  let warningCount = 0;
  const results: ValidationResult[] = [];

  for (const file of files.sort()) {
    const result = await validateSkill(file);
    results.push(result);
    errorCount += result.errors.length;
    warningCount += result.warnings.length;
  }

  // Print results
  for (const result of results) {
    if (result.errors.length > 0 || result.warnings.length > 0) {
      const shortPath = result.file.replace("plugins/bknd-skills/skills/", "");
      console.log(`\n${shortPath}:`);
      for (const error of result.errors) {
        console.log(`  ❌ ${error}`);
      }
      for (const warning of result.warnings) {
        console.log(`  ⚠️  ${warning}`);
      }
    }
  }

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Total: ${files.length} files, ${errorCount} errors, ${warningCount} warnings`);

  if (errorCount > 0) {
    console.log("\n❌ Validation FAILED");
    process.exit(1);
  } else {
    console.log("\n✅ Validation PASSED");
  }
}

main();
