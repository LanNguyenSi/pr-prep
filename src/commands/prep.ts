/**
 * Main prep command - runs all checks and generates PR description
 */

import chalk from "chalk";
import ora from "ora";
import { runPreflightChecks } from "../lib/checks.js";
import { generatePRDescription } from "../lib/description.js";
import { getGitInfo } from "../lib/git.js";

export async function runPrep(options: { skipTests?: boolean; fast?: boolean; push?: boolean }) {
  console.log(chalk.bold.cyan("\n🚀 PR Prep - Preparing your pull request\n"));

  // Get git info
  const spinner = ora("Analyzing repository...").start();
  const gitInfo = await getGitInfo();
  spinner.succeed(`Branch: ${chalk.yellow(gitInfo.branch)}`);

  // Run pre-flight checks
  console.log(chalk.bold("\n📋 Running pre-flight checks...\n"));
  const checksResult = await runPreflightChecks({ skipTests: options.skipTests, fast: options.fast });

  // Display results
  console.log("\n" + chalk.bold("Results:"));
  for (const check of checksResult.checks) {
    const icon = check.passed ? chalk.green("✓") : chalk.red("✗");
    const status = check.passed ? chalk.green("PASS") : chalk.red("FAIL");
    console.log(`  ${icon} ${check.name}: ${status}`);
    if (check.details) {
      console.log(chalk.gray(`    ${check.details}`));
    }
  }

  const allPassed = checksResult.checks.every((c) => c.passed);
  if (!allPassed) {
    console.log(chalk.red("\n❌ Some checks failed. Fix issues before creating PR."));
    process.exit(1);
  }

  console.log(chalk.green("\n✅ All checks passed!"));

  // Generate PR description
  console.log(chalk.bold("\n📝 Generating PR description...\n"));
  const description = await generatePRDescription(gitInfo);

  console.log(chalk.bold.cyan("\n=== PR Description ===\n"));
  console.log(description);
  console.log(chalk.bold.cyan("\n======================\n"));

  // Push if requested
  if (options.push !== false) {
    const pushSpinner = ora("Pushing to remote...").start();
    try {
      await gitInfo.git.push("origin", gitInfo.branch);
      pushSpinner.succeed("Pushed to remote");
    } catch (error) {
      pushSpinner.fail("Push failed");
      throw error;
    }
  }

  console.log(chalk.green("\n✨ PR prep complete! Ready to create pull request.\n"));
  console.log(chalk.gray("Tip: Copy the description above or save it with:"));
  console.log(chalk.gray("  pr-prep describe -o PR_DESCRIPTION.md\n"));
}
