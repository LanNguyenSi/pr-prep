/**
 * Pre-flight checks for PR preparation
 */

import { execa } from "execa";
import fs from "fs/promises";
import chalk from "chalk";
import ora from "ora";

export interface CheckResult {
  name: string;
  passed: boolean;
  details?: string;
}

export interface ChecksResult {
  checks: CheckResult[];
  allPassed: boolean;
}

export async function runPreflightChecks(options: {
  skipTests?: boolean;
  fast?: boolean;
}): Promise<ChecksResult> {
  const checks: CheckResult[] = [];

  // Check 1: Branch is not main/master
  checks.push(await checkBranch());

  // Check 2: No uncommitted changes
  checks.push(await checkUncommittedChanges());

  // Check 3: TypeScript compilation
  if (await hasPackageJson()) {
    checks.push(await checkTypeScript());
  }

  // Check 4: Linting
  if (await hasPackageJson() && !options.fast) {
    checks.push(await checkLinting());
  }

  // Check 5: Formatting
  if (await hasPackageJson() && !options.fast) {
    checks.push(await checkFormatting());
  }

  // Check 6: Tests
  if (await hasPackageJson() && !options.skipTests && !options.fast) {
    checks.push(await checkTests());
  }

  const allPassed = checks.every((c) => c.passed);
  return { checks, allPassed };
}

async function checkBranch(): Promise<CheckResult> {
  const spinner = ora("Checking branch...").start();
  try {
    const { stdout } = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
    const branch = stdout.trim();

    if (branch === "main" || branch === "master") {
      spinner.fail();
      return {
        name: "Branch check",
        passed: false,
        details: "Cannot create PR from main/master branch",
      };
    }

    spinner.succeed();
    return { name: "Branch check", passed: true, details: `On branch: ${branch}` };
  } catch (error) {
    spinner.fail();
    return { name: "Branch check", passed: false, details: "Git error" };
  }
}

async function checkUncommittedChanges(): Promise<CheckResult> {
  const spinner = ora("Checking uncommitted changes...").start();
  try {
    const { stdout } = await execa("git", ["status", "--porcelain"]);

    if (stdout.trim()) {
      spinner.fail();
      return {
        name: "Uncommitted changes",
        passed: false,
        details: "Commit all changes before creating PR",
      };
    }

    spinner.succeed();
    return { name: "Uncommitted changes", passed: true };
  } catch (error) {
    spinner.fail();
    return { name: "Uncommitted changes", passed: false };
  }
}

async function checkTypeScript(): Promise<CheckResult> {
  const spinner = ora("Checking TypeScript compilation...").start();
  try {
    const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));
    const hasTypecheck = packageJson.scripts?.typecheck || packageJson.scripts?.tsc;

    if (!hasTypecheck) {
      spinner.info();
      return { name: "TypeScript", passed: true, details: "No typecheck script found (skipped)" };
    }

    await execa("npm", ["run", hasTypecheck ? "typecheck" : "tsc"], { stdio: "pipe" });
    spinner.succeed();
    return { name: "TypeScript", passed: true };
  } catch (error) {
    spinner.fail();
    return { name: "TypeScript", passed: false, details: "Compilation failed" };
  }
}

async function checkLinting(): Promise<CheckResult> {
  const spinner = ora("Running linter...").start();
  try {
    const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));

    if (!packageJson.scripts?.lint) {
      spinner.info();
      return { name: "Linting", passed: true, details: "No lint script found (skipped)" };
    }

    await execa("npm", ["run", "lint"], { stdio: "pipe" });
    spinner.succeed();
    return { name: "Linting", passed: true };
  } catch (error) {
    spinner.fail();
    return { name: "Linting", passed: false, details: "Lint errors found" };
  }
}

async function checkFormatting(): Promise<CheckResult> {
  const spinner = ora("Checking formatting...").start();
  try {
    const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));
    const hasFormatCheck = packageJson.scripts?.["format:check"] || packageJson.scripts?.format;

    if (!hasFormatCheck) {
      spinner.info();
      return { name: "Formatting", passed: true, details: "No format script found (skipped)" };
    }

    await execa("npm", ["run", "format:check"], { stdio: "pipe" });
    spinner.succeed();
    return { name: "Formatting", passed: true };
  } catch (error) {
    spinner.fail();
    return { name: "Formatting", passed: false, details: "Format issues found (run npm run format)" };
  }
}

async function checkTests(): Promise<CheckResult> {
  const spinner = ora("Running tests...").start();
  try {
    const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));

    if (!packageJson.scripts?.test) {
      spinner.info();
      return { name: "Tests", passed: true, details: "No test script found (skipped)" };
    }

    await execa("npm", ["test"], { stdio: "pipe" });
    spinner.succeed();
    return { name: "Tests", passed: true };
  } catch (error) {
    spinner.fail();
    return { name: "Tests", passed: false, details: "Tests failed" };
  }
}

async function hasPackageJson(): Promise<boolean> {
  try {
    await fs.access("package.json");
    return true;
  } catch {
    return false;
  }
}
