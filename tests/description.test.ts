import { describe, it, expect } from "vitest";
import { generatePRDescription } from "../src/lib/description.js";
import type { GitInfo } from "../src/lib/git.js";

describe("generatePRDescription", () => {
  it("generates description from single commit", async () => {
    const gitInfo: GitInfo = {
      git: {} as any,
      branch: "feat/auth",
      baseBranch: "main",
      commits: [
        {
          hash: "abc1234",
          message: "Add user authentication",
          author: "Lava",
          date: "2026-03-21",
        },
      ],
      changedFiles: ["src/auth.ts", "tests/auth.test.ts"],
    };

    const description = await generatePRDescription(gitInfo);

    expect(description).toContain("Add user authentication");
    expect(description).toContain("src/auth.ts");
    expect(description).toContain("tests/auth.test.ts");
    expect(description).toContain("## Testing");
  });

  it("generates description from multiple commits", async () => {
    const gitInfo: GitInfo = {
      git: {} as any,
      branch: "feat/multi",
      baseBranch: "main",
      commits: [
        { hash: "abc", message: "Add feature A", author: "Lava", date: "2026-03-21" },
        { hash: "def", message: "Add feature B", author: "Lava", date: "2026-03-21" },
        { hash: "ghi", message: "Add tests", author: "Lava", date: "2026-03-21" },
      ],
      changedFiles: ["src/a.ts", "src/b.ts", "tests/ab.test.ts"],
    };

    const description = await generatePRDescription(gitInfo);

    expect(description).toContain("3 commits");
    expect(description).toContain("Add feature A");
    expect(description).toContain("Add feature B");
    expect(description).toContain("Add tests");
  });

  it("categorizes files correctly", async () => {
    const gitInfo: GitInfo = {
      git: {} as any,
      branch: "feat/files",
      baseBranch: "main",
      commits: [{ hash: "abc", message: "Update files", author: "Lava", date: "2026-03-21" }],
      changedFiles: [
        "src/index.ts",
        "tests/index.test.ts",
        "README.md",
        "package.json",
        "styles.css",
      ],
    };

    const description = await generatePRDescription(gitInfo);

    expect(description).toContain("**Source:**");
    expect(description).toContain("src/index.ts");
    expect(description).toContain("**Tests:**");
    expect(description).toContain("tests/index.test.ts");
    expect(description).toContain("**Documentation:**");
    expect(description).toContain("README.md");
    expect(description).toContain("**Configuration:**");
    expect(description).toContain("package.json");
  });

  it("handles branch name title", async () => {
    const gitInfo: GitInfo = {
      git: {} as any,
      branch: "feat/user-authentication-api",
      baseBranch: "main",
      commits: [],
      changedFiles: [],
    };

    const description = await generatePRDescription(gitInfo);

    expect(description).toContain("User Authentication Api");
  });
});
