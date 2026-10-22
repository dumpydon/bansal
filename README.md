# Bansal Sales Corporation

Static Jaipur-inspired landing page. Entry point: `dist/index.html`.

## Preview

Run `python3 -m http.server 8767 --bind 127.0.0.1 --directory dist` from this folder. No framework, backend, account, checkout or enquiry form is required.

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

JavaScript syntax checked. DOM interaction tests pass for menu open/Escape, all categories, keyboard tab selection, motion pause/resume, reduced-motion fallback, anchors, duplicate IDs and local image assets. The optional `scripts/check.cjs` uses jsdom; install jsdom in `/tmp/bansal-dom-check` to reproduce that local check. Assets and original illustrations were rendered and inspected separately. Local HTTP returns 200.

Live browser layout, real-device testing and measured performance remain unverified because browser automation is disabled in Work settings. No Lighthouse score or real-user Core Web Vitals result is claimed.

## Publishing

Site identity is retained in `.openai/hosting.json`. Hosted version is owner-private. Public business launch, custom domain, approved contact details and any further business verification remain later steps.
