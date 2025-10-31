# Design Tokens & Figma Integration

This folder contains token files and component blueprints for designers and developers.

## Files

- figma-tokens.json — Master token sets (core, light, dark), in Figma Tokens format
- tokens.css — CSS custom properties (Light/Dark) for web
- tokens.ios.json — iOS-ready JSON (OKLCH values; convert to sRGB/HEX during build)
- tokens.android.json — Android-ready JSON (OKLCH values; convert to sRGB/HEX during build)
- figma-components.json — Figma component property blueprints (variants, sizes, slots)
- component-spec.csv — Component prop inventory for docs and Storybook

## Figma (Tokens Studio) Import

1) Open Tokens Studio in Figma
2) Import → Select `pho-chat/docs/design/figma-tokens.json`
3) Enable theme: Light or Dark as needed
4) Sync tokens; map to Figma color/text styles if desired

## Optional: Generate sRGB/HEX token files

We ship a converter script that transforms any JSON file containing `oklch(...)` strings to HEX.

Usage:

```bash
node scripts/convert-oklch.js --in pho-chat/docs/design/tokens.ios.json --out pho-chat/docs/design/tokens.ios.rgb.json --alpha rgba
node scripts/convert-oklch.js --in pho-chat/docs/design/tokens.android.json --out pho-chat/docs/design/tokens.android.rgb.json
```

- `--alpha rgba` embeds alpha as `#RRGGBBAA` when the source uses `oklch(... / <alpha>)`. Default is `ignore` (drops alpha).

## Storybook Docs

- props.mdx is a consolidated prop reference
- You can also use the per-component MDX files (in `docs/storybook/components/`) for granular docs pages

## Notes

- Tokens in this repo use OKLCH for perceptual consistency. For platforms that require sRGB/HEX, run the converter script or configure your build pipeline to transform values.
- All color and radius values map 1:1 with `src/app/globals.css` so design and code remain in sync.

