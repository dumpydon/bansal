// Prepare the site's compact, self-contained lunar artwork from NASA's LRO mosaic.
// Run explicitly after changing this artwork; the normal build uses the saved SVG.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'design/theme-preview/nasa-lunar-nearside-original.jpg'));
// Remove only the empty space around the original full disk, keeping its orientation.
const texture = await sharp(source).extract({ left: 33, top: 14, width: 1220, height: 1220 })
  .resize(512, 512).jpeg({ quality: 88, chromaSubsampling: '4:4:4' }).toBuffer();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-labelledby="moon-title moon-desc">
<title id="moon-title">The Moon above Jaipur</title>
<desc id="moon-desc">Earth-facing lunar seas, highlands, craters and bright rays, from NASA Lunar Reconnaissance Orbiter imagery. Gently warmed to ivory for the illustrated night sky.</desc>
<metadata>Source: https://science.nasa.gov/resource/lunar-near-side/ — NASA/Goddard Space Flight Center/Arizona State University. Cropped and resized; light tonal treatment for the Bansal illustration. Decorative full Moon, not a live lunar-phase display.</metadata>
<defs>
  <clipPath id="lunar-limb"><circle cx="256" cy="256" r="255.5"/></clipPath>
  <filter id="lunar-tone" color-interpolation-filters="sRGB">
    <feComponentTransfer>
      <feFuncR type="linear" slope="1.03" intercept=".10"/>
      <feFuncG type="linear" slope="1" intercept=".095"/>
      <feFuncB type="linear" slope=".91" intercept=".075"/>
    </feComponentTransfer>
    <feGaussianBlur stdDeviation="1.35"/>
  </filter>
  <radialGradient id="lunar-relief" cx="38%" cy="34%" r="74%">
    <stop offset=".4" stop-color="#fff9e4" stop-opacity=".06"/>
    <stop offset=".73" stop-color="#1d2433" stop-opacity="0"/>
    <stop offset="1" stop-color="#1d2433" stop-opacity=".16"/>
  </radialGradient>
</defs>
<g clip-path="url(#lunar-limb)">
  <circle cx="256" cy="256" r="256" fill="#f2ebd4"/>
  <image href="data:image/jpeg;base64,${texture.toString('base64')}" x="0" y="0" width="512" height="512" opacity=".496" filter="url(#lunar-tone)"/>
  <circle cx="256" cy="256" r="256" fill="url(#lunar-relief)"/>
</g>
</svg>`;
await writeFile(path.join(root, 'dist/assets/moon.svg'), svg);
// Refresh the artwork URL as well as the stylesheet after each visual refinement.
const version = createHash('sha256').update(svg).digest('hex').slice(0,12);
const stylesheetPath = path.join(root, 'dist/theme.css');
const stylesheet = await readFile(stylesheetPath, 'utf8');
await writeFile(stylesheetPath, stylesheet.replace(/assets\/moon\.svg(?:\?v=[a-f0-9]+)?/g, `assets/moon.svg?v=${version}`));
console.log(`Prepared detailed lunar artwork: ${Math.round(Buffer.byteLength(svg) / 1024)} KiB`);
