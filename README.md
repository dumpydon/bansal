# Bansal Sales Corporation

Static Jaipur-inspired landing page. Entry point: `dist/index.html`.

Production: https://bansalsalesjaipur.dumpydon.workers.dev/
Repository: https://github.com/dumpydon/bansal

## Cloudflare Workers

Install dependencies with `npm ci`, then run `npm run check` and `npm run deploy`.
`wrangler.jsonc` serves the committed `dist/` directory as static assets on the
`bansalsalesjaipur` Worker in the `dumpydon.workers.dev` account subdomain.
The requested mixed-case hostname is equivalent because DNS names are case-insensitive.

`npm run build` prepares the canonical URL, social-image URL, sitemap and robots
file and checks that the deployment directory contains only non-empty static files.
No Python runtime is needed for deployment. Optional Python scripts regenerate the
illustrations and the original HTML template; run `npm run build` afterward.

For Cloudflare's Git integration, use the repository root, production branch `main`,
build command `npm ci && npm run check`, and deploy command `npx wrangler deploy`.
The Git connection must be enabled in the Cloudflare build settings before pushes
trigger deployment; a configuration file alone does not enable automatic builds.

## Preview

Run `npm run dev` for the Cloudflare local runtime, or
`python3 -m http.server 8767 --bind 127.0.0.1 --directory dist` for a plain static preview.
No framework, backend, account, checkout or enquiry form is required.

## What is included

- Original layered Jaipur SVG panorama with a short electric cargo-vehicle arrival, replay and pause controls.
- Original warehouse/team, gateway and product-category artwork.
- Seven brand families, five accessible category tabs, delivery process, worker tribute, founder story and the supplied Maps destination.
- Responsive layouts, self-hosted fonts, reduced-motion handling, visible focus, no-JavaScript content and semantic navigation.

## Content decisions

The business name, founder story, brand relationships and supplied address come from the user's brief. No Rajasthan-wide exclusivity, service guarantees or sales rankings are claimed. Phone numbers, email and staff photos remain excluded until supplied. The architectural illustration is an original composite, not a map of real landmark adjacency. External brand assets remain unchanged apart from file-format optimization; their source URLs are in `asset-sources.json`.

## Source editing

`dist/styles.css` and `dist/app.js` are the stylesheet and interaction source. `scripts/build.py` generates `dist/index.html`. `scripts/assets.py` generates vector companions and WOFF2 fonts using `scripts/illustration_library.py` and `design/fonts/`. Run assets then build when changing illustration source. The source font licences are included. Python generation requires fonttools, brotli and cairosvg; the served website needs none of those packages.

## Verification

Run `npm run check`. It checks JavaScript syntax, prepares the static files and runs
DOM interaction tests for menu open/Escape, all categories, keyboard tab selection,
motion pause/resume, reduced-motion fallback, anchors, duplicate IDs and local image
assets. The dependencies are locked in `package-lock.json`. Assets and original
illustrations were rendered and inspected separately.

Live browser layout, real-device testing and measured performance remain unverified because browser automation is disabled in Work settings. No Lighthouse score or real-user Core Web Vitals result is claimed.

## Publishing

The earlier owner-private Sites preview identity is retained in `.openai/hosting.json`.
Cloudflare deployment uses `wrangler.jsonc` and is separate from that preview.
The repository contains website source and artwork; the personal research vault and
supplied reference photographs are outside this repository. Credentials belong in
the local Wrangler/GitHub login or the host's protected configuration, never in Git.
