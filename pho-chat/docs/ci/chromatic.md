# Chromatic Visual Regression

Chromatic runs visual snapshot tests on your Storybook for each PR.

## 1) Create a Chromatic project
- Go to https://www.chromatic.com/
- Sign in with GitHub and create a new project.
- When prompted, copy the “Project Token”.

## 2) Add the token to GitHub Secrets
- Repo → Settings → Secrets and variables → Actions
- New repository secret:
  - Name: `CHROMATIC_PROJECT_TOKEN`
  - Value: (paste your token)

## 3) How it runs
- Workflow: `.github/workflows/chromatic.yml`
- On PRs:
  - Install deps, generate token MDX, build Storybook, then upload to Chromatic
  - The step is skipped if `CHROMATIC_PROJECT_TOKEN` is not set
- Output:
  - A PR check + link to the Chromatic build to review diffs

## 4) Make Chromatic required (optional)
- After the first successful Chromatic run appears in PR checks, enable it:
  - Repo → Settings → Branches → Branch protection for `main`
  - Require status checks to pass before merging → Add check name `Chromatic`
  - Save

## Tips
- Keep stories deterministic (avoid time/random network), or mock them.
- Use `storiesOf`/CSF or MDX stories for UI states covered in your design system.
- You can ignore or accept diffs in the Chromatic UI.

