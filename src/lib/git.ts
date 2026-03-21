/**
 * Git utilities
 */

import simpleGit, { SimpleGit } from "simple-git";

export interface GitInfo {
  git: SimpleGit;
  branch: string;
  commits: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
  changedFiles: string[];
  baseBranch: string;
}

export async function getGitInfo(): Promise<GitInfo> {
  const git = simpleGit();

  // Get current branch
  const branch = await git.revparse(["--abbrev-ref", "HEAD"]);

  // Get base branch (main or master)
  const branches = await git.branch();
  const baseBranch = branches.all.includes("main") ? "main" : "master";

  // Get commits since base
  const log = await git.log({ from: baseBranch, to: "HEAD" });

  const commits = log.all.map((commit) => ({
    hash: commit.hash.substring(0, 7),
    message: commit.message,
    author: commit.author_name,
    date: commit.date,
  }));

  // Get changed files
  const diff = await git.diff([baseBranch, "HEAD", "--name-only"]);
  const changedFiles = diff.split("\n").filter(Boolean);

  return {
    git,
    branch: branch.trim(),
    commits,
    changedFiles,
    baseBranch,
  };
}
