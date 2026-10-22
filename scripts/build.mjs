import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const origin = 'https://bansalsalesjaipur.dumpydon.workers.dev';
const indexPath = path.join(dist, 'index.html');
let html = await readFile(indexPath, 'utf8');

// Dist is intentionally committed: editing the page does not require Python or font tools.
html = html.replace(/(<link rel="canonical" href=")[^"]*(")/,
  `$1${origin}/$2`);
html = html.replace(/(<meta property="og:image" content=")[^"]*(")/,
  `$1${origin}/assets/social.jpg$2`);
await writeFile(indexPath, html);
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`);

let count = 0;
async function checkAssets(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) await checkAssets(target);
    else {
      if (/^(\.env|\.dev\.vars|credentials|secrets)/i.test(entry.name))
        throw new Error(`Private configuration cannot be deployed: ${target}`);
      if ((await stat(target)).size === 0) throw new Error(`Empty asset: ${target}`);
      count++;
    }
  }
}
await checkAssets(dist);
if (html.includes('cheeryalder8192.chatgpt.site')) throw new Error('Stale preview origin in production page');
console.log(`Prepared ${count} static files for ${origin}`);
