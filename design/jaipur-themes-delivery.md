# Jaipur light — implementation and review

23 October 2026. Implemented in the existing local site, without publishing.

## What changed

Day retains the original cream-paper art. Evening introduces a rose/lavender sky,
warmer stone and restrained early lighting. Night uses ink blue, a smaller ivory
moon, honey-coloured architecture and dark recesses. The Hawa Mahal-inspired bays
have individual vertical washes; the hillfort sits over a dark ridge; the Bansal
store has brighter sign lighting, under-awning light and a soft pavement pool.
Neighbouring shops and the moving rickshaw receive quieter light accents.

The rest of the page uses matching palettes: navigation, catalogue, product dialog,
story, founder placeholders, delivery information, visit section and footer.
Product packaging and manufacturer artwork are not recoloured.

## Interaction

- Auto: Jaipur day 05:00–17:00, evening 17:00–18:00, night 18:00–05:00.
- Click the actual sun/moon, or Jaipur light in navigation, for the four choices.
- Manual preferences persist; Auto restores clock control immediately.
- Themes initialize before body paint and update at minute boundaries, after tab
  suspension, and when restoring a page. No location permission is required.
- Keyboard focus, Escape, touch targets and reduced-motion preferences are supported.

## Validation

`npm run check` passes: complete catalogue, five-product rotation and seven-second
hold, full 14-second six-track delivery animation and re-entry, clock boundaries,
pre-paint theme/browser colour, storage failures, manual/Auto persistence, timezone
independence, suspended-tab recovery, panel accessibility and mobile menu integration.

Browser inspection covered night hero, catalogue, full Bikano dialog, story and phone
layout; all three appearance states and sun/moon control were exercised. Phone layout
was inspected at 389 CSS pixels (the browser's existing zoom was accounted for), with
no horizontal document overflow. After usage resumed, the browser tool began reporting local browser use disabled.
Attempts to restore the viewport override and refresh the final refined tier lighting
were rejected even after the user reported re-enabling access. The last refined SVG
was therefore inspected through standalone art proofs, not a new browser screenshot.
The saved review tab may still have its temporary narrow viewport until browser
control is restored. The actual site remains responsive; no viewport sizing was
written into its code.

## Sources and limits

See [the research and art direction](jaipur-lighting-research.md) for primary tourism,
municipal and lighting-designer references. This is an original illustrative response
to Jaipur's warm architectural lighting, not a measured lighting survey. The time
schedule is the user's chosen schedule, not a claim about sunset or monument hours.

## Maintenance

The scene renderer and theme code are documented in README.md. Standalone SVG/PNG art proofs in
`design/theme-preview/` are review artifacts, not browser screenshots, outside the served `dist` directory.

## Moon and celestial size refinement

The night moon now uses the actual Earth-facing lunar surface from NASA's LRO
imagery: recognisable maria, highlands, impact craters and bright rays. Its lightly
warmed ivory treatment and restrained halo fit the city illustration. Source and
credit: [NASA Lunar Near Side](https://science.nasa.gov/resource/lunar-near-side/),
NASA/Goddard Space Flight Center/Arizona State University. `assets/moon.svg` embeds
the resized source so it makes no external request at runtime. The source crop and
light tonal treatment can be reproduced with `node scripts/render-moon.mjs` (Sharp
required), using the saved NASA source in `design/theme-preview/`.

Both sun and moon have received two successive 10% diameter reductions, making
them 0.81× the original themed diameter, with unchanged centres and click targets.
CSS scales are .81 for day, .7128 for evening (.88 × .81), and .5022 for night
(.62 × .81). Small crater details are gently softened and the lunar texture opacity
is .496 (20% lower than .62), reducing dark greyness while preserving the larger
surface landmarks. A 1.35px softening at source resolution suppresses more of the
small crater speckling. Halo alpha values are approximately 1.4× their prior values,
adding 40% glow intensity without changing the Moon’s size or position. The artwork is a decorative full Moon, not a live lunar-phase indicator.

## Hero spacing refinement

Both hero action links are displayed at .65× their previous size. Their shared
scale preserves the relative text, arrows, padding and borders, with an expanded
invisible touch area. The hero intro moves up 25 CSS pixels on desktop (25 pixels down from the prior
50-pixel lift) while its
layout space is retained, so the architecture and street do not shift upward.
The sun/moon control moves up 50 CSS pixels into the space above the illustration.
On phones the upward shifts are 24 pixels to avoid clipping under the header.

The full hero intro (headline, supporting copy and action links) is additionally
scaled to .9×, anchored at its top centre to preserve the chosen vertical position.
The links’ invisible touch area accounts for this extra scale.

The sun/moon control has subsequently moved a further 70 CSS pixels upward,
making its total sky lift 120px on desktop and 94px on phones. Only the celestial
control moves in this refinement; its diameter stays the same.

The two hero action labels are now 1.35× their prior visual text size. The label-only
transform preserves the existing button boxes, arrows and enlarged touch areas.

## Hawa Mahal ornament refinement

The supplied architectural references guide a restrained addition of green and red
coloured panes in selected jharokhas. Each marked window receives only two tiny
accent panes, retaining the existing jali dots and dominant pink/amber palette.
All Hawa Mahal balcony faces now carry miniature ivory quatrefoils and curled leaf
motifs inside painted borders, with seven small rounded scallops under each sill.
These ornaments are specific to Hawa Mahal; generic shop and fort windows keep
their original styling. Evening/night colour variables keep the panels warm and
the glass points understated. Source: `window(..., ornate=True)`, `hawa_balcony`
and `hawa_flower` in `scripts/illustration_library.py`.

Regenerated the saved and inline hero through `render-scene.py`, preserving its
motion identifiers, then passed all website checks. Day/night vector art proofs
and detail crops are saved under `design/theme-preview/hawa-*`. No publication.

## Tree and roadside greenery

The original circular tree clusters are replaced by an irregular, layered canopy in
muted sage and olive tones. Small almond-leaf sprigs, brighter upper foliage and a
tapered branching trunk add detail while matching the scene's illustration style.
A low stone planting bed grounds the tree, with two small shrubs and grass tufts.
Two modest terracotta planters sit beside the Bansal-side cartons and the right-hand
shopfront. They remain behind the vehicle and people in the scene's drawing order.
Night and evening use separate foliage/highlight/soil variables so the planting
stays readable under warm architectural light. The 14-second delivery motion is
unchanged. All website checks pass; native day/night SVG art proofs were inspected.
Source helpers: `street_tree`, `shrub`, `leaf_sprig`, `potted_greenery`.

## Nahargarh silhouette refinement

The generic four-tower hillfort is replaced with a palace frontage inspired by the
curved roof groups in the user's Nahargarh reference images 2 and 5. Each of three
roof groups has one broad curved crown with five small finials, flanked closely by
two smaller domed caps with one finial each. The frontage includes rounded arched
niches, projecting cornices, roof-band detailing and a low defensive parapet with
loopholes and masonry joints. The hill now has a flatter supporting ridge and fewer,
more irregular contour lines. The existing descending Parcota wall retains its
accepted .85× height and connects to the new parapet.

The defining roof silhouette follows the supplied palace photographs, rather than
assuming that all of the supplied wall/gateway photographs depict the same view.
Rajasthan Tourism identifies Madhavendra Bhawan within Nahargarh and confirms the
fort's ridge setting and night illumination:
https://www.tourism.rajasthan.gov.in/nahargarh-fort.html
This remains an original simplified composite, not a measured architectural survey.

Evening/night materials include subdued weathered roof tones and warm facade
washes. Uplights are generated from the actual new facade bounds. All website tests
pass. The rendered SVG was inspected in day and night modes; each roof group was
also verified to contain exactly five central and two side finials. Original motion
IDs and the complete delivery journey are preserved. Work remains on localhost.

## Quieter planting and refined planters

The tree palette is softened to lower-contrast sage, grey-green and pale olive.
The dark outer canopy band is much lighter, its outline is simpler, and the broad
curved highlight strokes are removed. Twenty fine leaf sprigs replace the previous
twelve larger ones, adding leaf detail without increasing the canopy's prominence.
Evening and night palettes are adjusted to preserve that quieter tonal separation.

Planters now have rounded earthenware bodies, rolled rims, a small foot and three
fine pointed-arch paint motifs inspired by the surrounding Jaipur architecture.
Muted clay and sage colours are used throughout. Upright leafy stems and a larger
foliage crown replace the previous small shrub-only top; no blossoms were added.
Four planters now appear: a pair beside the Bansal-side cartons, one by the general
store and one by the right-hand shop. All stay behind the moving cast. All website
checks pass, and native SVG day/night art and planter detail proofs were inspected.

## Fort relief and solid patterned roof bands

The former empty facade strips now contain shallow carved cusped-arch panels,
bevelled surrounds and raised end/inter-bay piers. Upper windows receive small
jali screens, curved pediments receive recessed fan ornaments, and the lower
arcade gains framed blind panels. Quiet staggered masonry courses and a deeper
battered plinth give the frontage more structural weight.

The gap between each barrel crown and the curved pediment is now solid stone in
all three themes. Its visible curved frieze carries a fine row of lozenge ornaments
and a pale carved border, replacing the previous sky-coloured holes. The five-plus-
two finial arrangement and existing roof silhouette remain intact. Source helpers:
`fort_blind_panel`, `fort_screen_window`, and the `fort-roof-frieze` group.

Saved and inline SVGs regenerated; all website checks pass. Native day/night SVG
proofs and magnified detail crops were inspected. Work remains on localhost.

## Side extensions for wide / zoomed-out views

The 1600-unit central scene, CSS width cap and six motion tracks retain their
existing scale and coordinates. The SVG may now paint horizontally outside that
frame, clipped by the full-width hero container. This reveals the complete existing
kirana shop and a third, partly visible Super Department Store frontage on the right. The
Parcota wall and its hill continue to the left, retaining the approved .85× wall
height. The sky, paper texture and perspective paving extend across the side
margins, eliminating the former rectangular cutoffs. The new shop has matching
night lighting and one small planter. No browser zoom or viewport setting changes
are introduced.

A dedicated vertical SVG clip retains the original y=155…775 paint bounds, keeping
both headline and playback controls clear. Native raster assertions verify opaque
road pixels in both side margins and transparent pixels above/below those bounds;
the central viewBox remains unchanged. All website checks pass. Wide day/evening/
night SVG art proofs (`panorama-*`) were inspected. Live browser verification at
80% is unavailable because Work settings still disable local browser control.

## Companion planting to the left of Bansal

The latest layout places the companion tree to the left of the Bansal shop, closer
to its entrance steps, with the two added pots to the tree's left. The tree is .69×
the original large street-tree drawing (15% larger than its first .6× version).
The two pots are scaled .805 and .69 (15% above .7/.6). The original pair of pots
at x=430/457 on the shop's right remains in place.

The marked gaps are reduced to .4× their previous widths. Using rendered foliage
and planting-bed bounds, source-unit gaps change as follows: pot-to-pot 5.186 →
2.0744; right pot to tree bed 8.321 → 3.3284; tree bed to shop steps 7.8795 → 3.1518.
The corresponding final x positions are -113.168, -92.280 and -41.272. The Bansal
shop's geometry is unchanged. Measurements are saved in plant-gap-layout.json.

## Premium Super Department Store

The outboard shop is now 228 source units wide, exactly 20% above its original 190.
Its facade is 224 units tall and starts at y=396, retaining the original pavement
level at y=620. Its main cornice is 18 units higher than the General Store's cornice,
with a small curved crest above that. The frontage has three carved jharokhas,
painted friezes, an inset double-border fascia, a scalloped awning, two arched
merchandise displays and a framed double-door entrance with muted brass handles.
Two shallow entrance steps, matching planters and sheltered warm lights complete
it. The materials remain the same subdued Jaipur palette.

SUPER DEPARTMENT keeps the approved 13px main type, with a .44px same-colour stroke
for stronger visibility, including the subsequent requested weight increase. STORE is on a second line at 8.5px. No text
shrinking or stretching is used. All website checks pass. Native day/night art
proofs, exact width/roofline/font checks and the three gap ratios were verified.
The work remains on localhost; browser verification is still disabled in Work.


## Additional pots and transparent supermarket entrance

Five more matching planters bring the roadside count from eight to thirteen: two
on the left of Bansal (x=-153/-134), one beneath the central city frontage (x=710),
one beside the pavilion steps (x=1149), and one at the General Store's right edge
(x=1470). The established tree and close-spaced original pair remain fixed.

The Super Department Store's opaque green entrance is replaced by a clear-glass
view of a supermarket: two stocked shelving runs recede towards an end display,
with product rows, a tiled central aisle, interior strip lighting, light reflections,
a fine door mullion and brass handles. The existing Jaipur arch clips the interior.
Three clearly drawn brass sign-light shades are visible by day; warm beams, bulbs
and halos illuminate the fascia at night. SUPER DEPARTMENT stays at 13px, with the
same-colour stroke increased from .2 to .44px to make the letterforms visibly
heavier without shrinking or stretching the text. STORE retains its smaller line.
All website checks pass; native day/night store and entrance art was inspected.
