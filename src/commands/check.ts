/**
 * Check command - runs pre-flight checks only
 */

import chalk from "chalk";
import { runPreflightChecks } from "../lib/checks.js";

export async function runCheck(options: { skipTests?: boolean }) {
  console.log(chalk.bold.cyan("\n🔍 Running pre-flight checks...\n"));

  const result = await runPreflightChecks({ skipTests: options.skipTests });

  console.log("\n" + chalk.bold("Results:"));
  for (const check of result.checks) {
    const icon = check.passed ? chalk.green("✓") : chalk.red("✗");
    const status = check.passed ? chalk.green("PASS") : chalk.red("FAIL");
    console.log(`  ${icon} ${check.name}: ${status}`);
    if (check.details) {
      console.log(chalk.gray(`    ${check.details}`));
    }
  }

  const allPassed = result.checks.every((c) => c.passed);
  if (!allPassed) {
    console.log(chalk.red("\n❌ Some checks failed."));
    process.exit(1);
  }

  console.log(chalk.green("\n✅ All checks passed!"));
}
