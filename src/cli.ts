#!/usr/bin/env node
/**
 * PR Prep - Pull Request Preparation Tool
 * Runs pre-flight checks and generates PR descriptions
 */

import { Command } from "commander";
import chalk from "chalk";
import { runPrep } from "./commands/prep.js";
import { runCheck } from "./commands/check.js";
import { generateDescription } from "./commands/describe.js";

const program = new Command();

program
  .name("pr-prep")
  .description("Prepare pull requests with pre-flight checks and auto-generated descriptions")
  .version("0.1.0");

program
  .command("prep")
  .description("Run all pre-flight checks and generate PR description")
  .option("-s, --skip-tests", "Skip running tests")
  .option("-f, --fast", "Skip slow checks")
  .option("--no-push", "Don't push to remote")
  .action(async (options) => {
    try {
      await runPrep(options);
    } catch (error) {
      console.error(chalk.red("✗ Error:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command("check")
  .description("Run pre-flight checks only (no PR description generation)")
  .option("-s, --skip-tests", "Skip running tests")
  .action(async (options) => {
    try {
      await runCheck(options);
    } catch (error) {
      console.error(chalk.red("✗ Error:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command("describe")
  .description("Generate PR description only (no checks)")
  .option("-o, --output <file>", "Write description to file")
  .action(async (options) => {
    try {
      await generateDescription(options);
    } catch (error) {
      console.error(chalk.red("✗ Error:"), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
