# Pull Request

Thank you for your contribution! Please use this checklist to help reviewers.

## Summary
- What does this PR change? Why?

## Checklists

### Tokens & Design Docs (if applicable)
- [ ] Updated `pho-chat/docs/design/figma-tokens.json`
- [ ] Ran token conversion locally: `npm --prefix pho-chat run tokens:convert-all`
- [ ] Committed generated RGB files (if we keep them in repo):
  - [ ] `pho-chat/docs/design/tokens.ios.rgb.json`
  - [ ] `pho-chat/docs/design/tokens.android.rgb.json`
- [ ] Regenerated Storybook MDX from tokens (auto-run by `tokens:convert-all`)
- [ ] Verified Storybook docs render (if Storybook is set up)

### CI
- [ ] CI green (Tokens convert artifacts upload)
- [ ] Staleness check passes (if .rgb.json files are committed)

### Docs
- [ ] Updated relevant docs in `pho-chat/docs/` if behavior changed

## Screenshots / Demos (optional)

## Notes for Reviewers
- Anything risky or worth special attention?

---


## Summary
- [ ] Purpose of this PR

## Checks
- [ ] I followed conventional commits in the title
- [ ] I ran `npm run lint` and `npm run type-check` locally
- [ ] I built locally with `npm run build`
- [ ] I did not commit any `.env*` files or secrets

## Vercel Preview
Provide the Vercel Preview URL (auto-added by Vercel after you connect the repo):

- [ ] Preview URL: https://

## Notes
- Root Directory for Vercel is `pho-chat`
- Production branch is `main`

