# Tokens Studio How-To (Figma)

This guide explains how to import and manage tokens using Tokens Studio and keep them in sync with code.

## Files to Import

- `pho-chat/docs/design/figma-tokens.json` (master token sets: core, light, dark)
- Optional: `pho-chat/docs/design/figma-components.json` (component property blueprints)

## Import Steps

1. Open your Figma file and launch the Tokens Studio plugin.
2. Click **Import** and select `figma-tokens.json`.
3. Under Themes, enable either **Light** or **Dark** (or both).
4. Sync tokens. You should now see semantic color tokens (primary, accent, muted, etc.), radii, and fonts.

## Map Tokens to Figma Styles (Recommended)

- Create Figma Color Styles for semantic tokens (e.g., `bg/background`, `text/foreground`, `action/primary`).
- Use Tokens Studio to link each Color Style to the matching token (e.g., `light.color.primary`).
- Repeat for text styles (typography) if you maintain text tokens.

## Using Themes

- In Tokens Studio, toggle between **Light** and **Dark** to review color shifts.
- Use component properties to preview different variants (from `figma-components.json`) — e.g., `Button.variant=secondary`.

## Best Practices

- Favor semantic tokens (primary, secondary, muted, accent) over raw color values.
- Keep design components referencing tokenized Styles, not hard-coded values.
- For charts and sidebars, use the provided `chart-*` and `sidebar-*` tokens.

## Sync Back to Code

- The source of truth remains `figma-tokens.json`. When updating:
  - Update tokens in Tokens Studio.
  - Export/overwrite `figma-tokens.json` and commit.
  - CI will automatically convert OKLCH → HEX for native (artifacts) and check for staleness if `.rgb.json` files are committed.

## Native Platforms (iOS/Android)

- Token values are OkLCH strings in source. Our converter produces RGB hex for native.
- Run locally:

```bash
npm --prefix pho-chat run tokens:convert-all
```

- Or rely on CI artifacts attached to each PR.

## Troubleshooting

- If colors look off in Figma previews, ensure your Figma environment supports OkLCH preview (or accept minor sRGB approximations).
- If the CI staleness job fails, run the local conversion and commit `.rgb.json` files, or remove/refresh them.

