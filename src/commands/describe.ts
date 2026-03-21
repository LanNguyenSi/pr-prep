/**
 * Describe command - generates PR description only
 */

import chalk from "chalk";
import fs from "fs/promises";
import ora from "ora";
import { getGitInfo } from "../lib/git.js";
import { generatePRDescription } from "../lib/description.js";

export async function generateDescription(options: { output?: string }) {
  const spinner = ora("Generating PR description...").start();

  const gitInfo = await getGitInfo();
  const description = await generatePRDescription(gitInfo);

  spinner.succeed("Description generated");

  if (options.output) {
    await fs.writeFile(options.output, description, "utf-8");
    console.log(chalk.green(`\n✓ Saved to ${options.output}\n`));
  } else {
    console.log(chalk.bold.cyan("\n=== PR Description ===\n"));
    console.log(description);
    console.log(chalk.bold.cyan("\n======================\n"));
  }
}
