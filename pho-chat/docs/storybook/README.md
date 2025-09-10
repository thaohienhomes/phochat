# Storybook Docs (MDX)

This folder contains MDX-only documentation pages. To preview them in a live Storybook instance:

## Option A: Initialize Storybook (recommended)

1. Ensure you have Node 18+.
2. From repo root:
   ```bash
   cd pho-chat
   npm run storybook:init
   ```
   This will install and configure Storybook for this project.
3. Start Storybook:
   ```bash
   npm run storybook
   ```
4. Build static Storybook:
   ```bash
   npm run storybook:build
   ```

## Option B: Read MDX in repo without Storybook
- You can read the MDX files directly in this folder for specs and code samples.

## Tokens workflow
- Run `npm run tokens:convert-all` (in pho-chat) to generate:
  - iOS/Android RGB tokens (for native)
  - GeneratedTokens.mdx from figma-tokens.json

## Pages
- Foundations/Index
- Foundations/Colors (Live CSS Vars)
- Foundations/Tokens (Live CSS Vars Overview)
- Foundations/GeneratedTokens (from figma-tokens.json)
- Foundations/Typography
- Components: Button, Input, Textarea, Card, Dialog, DialogContent, Sheet, SheetContent, DropdownMenuItem, SelectTrigger, TooltipProvider, Toast

