import { describe, it, expect, vi } from "vitest";

// Mock simple-git
vi.mock("simple-git", () => ({
  default: () => ({
    revparse: vi.fn(() => Promise.resolve("feat/test-branch")),
    branch: vi.fn(() =>
      Promise.resolve({
        all: ["main", "master", "feat/test-branch"],
      })
    ),
    log: vi.fn(() =>
      Promise.resolve({
        all: [
          {
            hash: "abc1234567890",
            message: "Test commit",
            author_name: "Test Author",
            date: "2026-03-21",
          },
        ],
      })
    ),
    diff: vi.fn(() => Promise.resolve("src/file1.ts\nsrc/file2.ts")),
  }),
}));

describe("getGitInfo", () => {
  it("returns git information", async () => {
    const { getGitInfo } = await import("../src/lib/git.js");
    const info = await getGitInfo();

    expect(info.branch).toBe("feat/test-branch");
    expect(info.baseBranch).toBe("main");
    expect(info.commits).toHaveLength(1);
    expect(info.commits[0].hash).toBe("abc1234");
    expect(info.changedFiles).toEqual(["src/file1.ts", "src/file2.ts"]);
  });
});
