# Contributing to PR Prep

Thanks for your interest in contributing! 🎉

## Development Setup

```bash
# Clone repository
git clone https://github.com/LanNguyenSi/pr-prep.git
cd pr-prep

# Install dependencies
npm install

# Run in development mode
npm run dev -- prep

# Build
npm run build

# Run tests
npm test

# Type check
npm run build
```

## Project Structure

```
pr-prep/
├── src/
│   ├── cli.ts              # Main CLI entry point
│   ├── commands/           # Command implementations
│   │   ├── prep.ts         # Full prep command
│   │   ├── check.ts        # Checks only command
│   │   └── describe.ts     # Description only command
│   └── lib/                # Core logic
│       ├── git.ts          # Git operations
│       ├── checks.ts       # Pre-flight checks
│       └── description.ts  # PR description generation
├── tests/                  # Vitest tests
└── .github/workflows/      # CI/CD
```

## Making Changes

1. **Create a branch:**
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update README if needed

3. **Test your changes:**
   ```bash
   npm test          # Run tests
   npm run build     # Ensure it compiles
   npm run dev -- prep  # Test CLI manually
   ```

4. **Commit with conventional commits:**
   ```bash
   git commit -m "feat: Add new check for dependencies"
   git commit -m "fix: Handle edge case in file categorization"
   git commit -m "docs: Update README examples"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feat/your-feature
   ```
   Then create a PR on GitHub with a clear description.

## Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring

## Adding New Checks

To add a new pre-flight check:

1. Add the check function in `src/lib/checks.ts`:
   ```typescript
   async function checkNewThing(): Promise<CheckResult> {
     const spinner = ora("Checking new thing...").start();
     try {
       // Your check logic
       spinner.succeed();
       return { name: "New check", passed: true };
     } catch (error) {
       spinner.fail();
       return { name: "New check", passed: false, details: "Error message" };
     }
   }
   ```

2. Add it to `runPreflightChecks()`:
   ```typescript
   export async function runPreflightChecks(options) {
     const checks: CheckResult[] = [];
     
     checks.push(await checkBranch());
     checks.push(await checkNewThing()); // Add here
     // ...
   }
   ```

3. Add tests in `tests/checks.test.ts` (create if needed)

4. Update README with the new check

## Code Style

- TypeScript strict mode
- ESM modules (`import/export`)
- Async/await (no callbacks)
- Descriptive variable names
- Comments for complex logic
- Error handling with try/catch

## Testing

- Write tests for all new features
- Mock external dependencies (simple-git, execa)
- Test both success and failure cases
- Keep tests fast (<1s total)

## Release Process

Releases are automated via GitHub Actions:

1. Update version in `package.json`
2. Commit: `git commit -m "chore: Release v0.2.0"`
3. Tag: `git tag v0.2.0`
4. Push: `git push --tags`
5. CI runs tests and publishes to npm automatically

## Questions?

- Open an issue on GitHub
- Check existing issues/PRs first
- Be respectful and constructive

Thank you for contributing! 🚀
