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

Cloudflare Workers Builds is connected to `dumpydon/bansal`. Every push to `main`
automatically checks the site and deploys it to the existing production Worker.
Failed checks stop the deployment. Preview builds for other branches are disabled.

The saved Cloudflare build settings are:

- Repository root: `/`; production branch: `main`; include paths: `*`.
- Build command: `npm ci && npm run check`.
- Deploy command: `npx wrangler deploy`.
- Build variables: `NODE_VERSION=22` and `SKIP_DEPENDENCY_INSTALL=true`, so the
  explicit `npm ci` handles dependency installation from the lockfile.

The Git connection and deployment credentials are managed in the Worker's
Cloudflare Settings > Builds. The Wrangler configuration alone does not enable
automatic builds. Local development still uses the commands below.

## Preview

Run `npm run dev` for the Cloudflare local runtime, or
`python3 -m http.server 8767 --bind 127.0.0.1 --directory dist` for a plain static preview.
No framework, backend, account, checkout or enquiry form is required.

## What is included

- Original layered Jaipur SVG panorama with the complete 14-second delivery sequence:
  preparation, the original loading transition, travel across the market and arrival
  at the shopfront. It restores the approved motion study's route and character
  movements, with synchronized carrier, walking legs, vehicle and wheel timelines.
  The original vector artwork stays sharp rather than scaling up a raster export.
- The hero delivery scene plays once on each visible visit. It waits when the page opens
  farther down, re-arms after the illustration fully leaves the viewport, and starts
  again from the beginning on return. Small scroll movements within the scene do not
  restart it. Reduced-motion preferences suppress automatic movement; manual controls
  remain available. All character, vehicle and wheel timelines pause together when
  offscreen or when the browser tab is hidden. The full street stays in view on phones
  so the shopfront arrival is not cropped away.
- Original warehouse/team, gateway and product-category artwork.
- Enlarged founder profiles with original, gently animated portrait placeholders,
  a motion pause control and a static reduced-motion alternative. The illustrations
  are generic placeholders, not likenesses of the founders.
- Seven brand families, five accessible category tabs, delivery process, worker tribute, founder story and the supplied Maps destination.
- Responsive layouts, self-hosted fonts, reduced-motion handling, visible focus, no-JavaScript content and semantic navigation.

## Content decisions

The business name, founder story, brand relationships and supplied address come from the user's brief. No Rajasthan-wide exclusivity, service guarantees or sales rankings are claimed. Phone numbers, email and staff photos remain excluded until supplied. The architectural illustration is an original composite, not a map of real landmark adjacency. External brand assets remain unchanged apart from file-format optimization; their source URLs are in `asset-sources.json`.

## Source editing

`dist/styles.css` and `dist/app.js` are the stylesheet and interaction source. `scripts/build.py` generates `dist/index.html`. `scripts/assets.py` generates vector companions and WOFF2 fonts using `scripts/illustration_library.py` and `design/fonts/`. Run assets then build when changing illustration source. The source font licences are included. Python generation requires fonttools, brotli and cairosvg; the served website needs none of those packages.

`scripts/render-founders.mjs` renders the founder profiles during `npm run build`.
Replace its generic portrait illustrations with the supplied, approved photographs
when available, and remove the visible placeholder labels at that point.

## Verification

Run `npm run check`. It checks JavaScript syntax, prepares the static files and runs
DOM interaction tests for menu open/Escape, all categories, keyboard tab selection,
motion pause/resume, reduced-motion fallback, anchors, duplicate IDs and local image
assets. The dependencies are locked in `package-lock.json`. Assets and original
illustrations were rendered and inspected separately.

The catalogue has been checked in the in-app browser at desktop and phone widths. Real-device testing and measured performance remain unverified. No Lighthouse score or real-user Core Web Vitals result is claimed.

## Publishing

The earlier owner-private Sites preview identity is retained in `.openai/hosting.json`.
Cloudflare deployment uses `wrangler.jsonc` and is separate from that preview.
The repository contains website source and artwork; the personal research vault and
supplied reference photographs are outside this repository. Credentials belong in
the local Wrangler/GitHub login or the host's protected configuration, never in Git.

## Product catalogue

The catalogue contains 222 product/range entries across the seven supplied companies,
with 219 locally optimized product photographs. `catalog-sources.json` records each
product's source page, image source and whether the photograph came from the manufacturer
or a retailer. Priyagold's primary website timed out and its official shop was password
protected during collection, so identifiable retailer pack references supplement that range.
Nabati's public international catalogue is labelled separately from confirmed India stock.
This is a manufacturer-range catalogue, not an assertion of real-time Bansal inventory.

`dist/catalog-data.js` is the deployed, compact data snapshot. `dist/catalog.js` controls
company/catalogue browsing, search, continuous product lists and the two-second product carousel.
Every matching product is rendered together for each company, category and search,
including the full combined catalogue. There is no "Show more" step. The "Back to top"
button follows the final product at the bottom of the single scrolling catalogue body.
Product images retain native lazy loading without withholding any product cards.
The carousel visits photographed products company by company, loops to the beginning,
pauses when its section is offscreen or the catalogue dialog is open, and respects
reduced-motion preferences. Keyboard-friendly previous/next and pause controls are included.
Five products appear at once: the current product in the centre, with two preceding
and two following products. The neighbouring pairs use 82% and 60% of the centre size.
Select any side product to bring it into focus; the centre image opens
its official product page. Selecting a product or using the navigation arrows holds
that selection for seven seconds, then returns to the normal two-second rotation,
even while the selected product remains hovered or focused. A new selection restarts
the seven-second hold. The Pause button stays paused until Play is pressed; reduced-motion
preferences are preserved. Keyboard focus without a selection pauses the slideshow.
Brand buttons open their lists; the category arrow links open the official manufacturer
catalogues directly (the biscuit arrow opens Priyagold).
Each company button includes its original manufacturer logo above the existing name.
`brand-logos.json` records the original image URLs and display order, with Nabati before
Perfetti Van Melle and Priyagold before Huggies. The Perfetti artwork is displayed at 1.2×
inside its original white tile. The logos are local assets; the company-name font sizes are preserved.

`design/catalog-section.html` and `scripts/render-catalog.mjs` generate the catalogue
section during `npm run build`. `scripts/sync-catalog.py` regenerates optimized WebP images
and data from the reviewed source manifest; its optional Python dependencies are Pillow
and requests. Empty transparent padding is trimmed while keeping all visible pack artwork.
Do not replace a product photograph with a differently named pack to fill an image gap.

Three source-listed ranges have no usable source photograph: DMB Kaju Dhoda Burfi,
Priyagold Jeera Gold and Priyagold Lemon Puff. They remain searchable with official links
and are omitted from the photographic slideshow. `catalog-image-report.json` records
these gaps. Generic international image labels were refined by inspecting the actual packs.

`npm run check` now additionally checks the complete carousel cycle, two-second timing,
company/category filters, complete modal results, search, back-to-top, focus restoration, pause/resume,
reduced-motion behaviour, product IDs and every referenced local image. The catalogue
was also exercised in the in-app browser at desktop and phone widths; a mobile grid
minimum-width issue was found and corrected. Automatic redeployment from GitHub remains
separate from the direct, authenticated Wrangler deployment.

## Jaipur light themes — local review

The appearance follows Jaipur time (`Asia/Kolkata`), independently of the visitor's
computer timezone: day 05:00–17:00, evening 17:00–18:00, night 18:00–05:00.
The sun/moon in the hero and the navigation's Jaipur light button open Day, Evening,
Night and Auto choices. Manual mode is stored as `bansal-theme-mode`; Auto resumes
clock-based changes. The clock catches up after suspended tabs and page restoration.

`dist/theme.js` runs synchronously before CSS/body paint. Keep the theme-color meta
before that script. `dist/theme.css` owns the sky, architectural materials, lighting
and celestial controls; `dist/theme-page.css` carries the palettes across the site.
Original manufacturer marks and product photographs retain their colours.

To regenerate the hero after an illustration edit, run `python3 scripts/render-scene.py`
then `npm run build`. The renderer calls the original `illustration_library.py` and
adds theme-aware material variables, bay lighting, shop luminaires and pavement pools.
It updates both the saved hero SVG and its inline copy, preserving motion identifiers.
Day colours are explicit SVG fallbacks. Normal builds serve the saved SVG and require
no Python installation. Do not regenerate the whole page with the historic build.py.

`npm run check` includes clock boundaries, saved modes, failed storage, pre-paint state,
live clock updates, timezone fallback, keyboard controls and mobile navigation focus.
Existing catalogue and 14-second journey tests remain part of the same command.

Research, sources and implementation decisions: `design/jaipur-lighting-research.md`
and `design/theme-checkpoint.md`. This theme work is for **localhost review only**;
no push or deployment is part of its delivery.

The hero includes artwork outside its original 1600-unit frame for wide views and
zoomed-out windows: a completed kirana frontage, a third shop, the continued Parcota
wall, hillside and paving. The central SVG viewBox and 1800px CSS width cap remain
unchanged. SVG horizontal overflow is visible inside the page's clipped hero; the
`scene-panorama-clip` restricts vertical painting to y=155…775 so the extra artwork
cannot cover the headline or playback controls. Keep this clip if the scene changes.
