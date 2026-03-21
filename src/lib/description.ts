/**
 * PR description generation
 */

import { GitInfo } from "./git.js";

export async function generatePRDescription(gitInfo: GitInfo): Promise<string> {
  const sections: string[] = [];

  // Title suggestion (from first commit or branch name)
  const title =
    gitInfo.commits[0]?.message ||
    gitInfo.branch
      .replace(/^(feat|fix|chore|docs|test|refactor)\//, "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  sections.push(`# ${title}\n`);

  // Summary from commits
  if (gitInfo.commits.length > 0) {
    sections.push("## Summary\n");
    if (gitInfo.commits.length === 1) {
      sections.push(gitInfo.commits[0].message);
    } else {
      sections.push(`This PR includes ${gitInfo.commits.length} commits:\n`);
      for (const commit of gitInfo.commits) {
        sections.push(`- ${commit.message} (${commit.hash})`);
      }
    }
    sections.push("");
  }

  // Changed files
  if (gitInfo.changedFiles.length > 0) {
    sections.push("## Changed Files\n");
    const filesByType = categorizeFiles(gitInfo.changedFiles);

    if (filesByType.source.length > 0) {
      sections.push("**Source:**");
      filesByType.source.forEach((f) => sections.push(`- \`${f}\``));
      sections.push("");
    }

    if (filesByType.tests.length > 0) {
      sections.push("**Tests:**");
      filesByType.tests.forEach((f) => sections.push(`- \`${f}\``));
      sections.push("");
    }

    if (filesByType.docs.length > 0) {
      sections.push("**Documentation:**");
      filesByType.docs.forEach((f) => sections.push(`- \`${f}\``));
      sections.push("");
    }

    if (filesByType.config.length > 0) {
      sections.push("**Configuration:**");
      filesByType.config.forEach((f) => sections.push(`- \`${f}\``));
      sections.push("");
    }

    if (filesByType.other.length > 0 && filesByType.other.length < 20) {
      sections.push("**Other:**");
      filesByType.other.forEach((f) => sections.push(`- \`${f}\``));
      sections.push("");
    }
  }

  // Testing checklist
  sections.push("## Testing\n");
  sections.push("- [ ] Unit tests pass");
  sections.push("- [ ] Integration tests pass");
  sections.push("- [ ] Manual testing completed");
  sections.push("- [ ] No regressions");
  sections.push("");

  // Additional context
  sections.push("## Additional Context\n");
  sections.push("<!-- Add any additional context, screenshots, or notes here -->\n");

  return sections.join("\n");
}

function categorizeFiles(files: string[]): {
  source: string[];
  tests: string[];
  docs: string[];
  config: string[];
  other: string[];
} {
  const result = {
    source: [] as string[],
    tests: [] as string[],
    docs: [] as string[],
    config: [] as string[],
    other: [] as string[],
  };

  for (const file of files) {
    if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
      result.tests.push(file);
    } else if (file.match(/\.(md|txt)$/i) || file.includes("README") || file.includes("CHANGELOG")) {
      result.docs.push(file);
    } else if (
      file.match(/package\.json|tsconfig\.json|\.eslintrc|\.prettierrc|\.gitignore|\.env/) ||
      file.startsWith(".")
    ) {
      result.config.push(file);
    } else if (file.match(/\.(ts|tsx|js|jsx|py|go|java|cpp|c|h)$/)) {
      result.source.push(file);
    } else {
      result.other.push(file);
    }
  }

  return result;
}
