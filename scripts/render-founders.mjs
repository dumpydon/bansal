import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Intentionally generic illustrations until the owner supplies approved portraits.
function portrait(name, id, monogram, younger = false) {
 const shirt = younger ? '#74887d' : '#91705e';
 const collar = younger
  ? '<path d="M151 246l29 27 29-27 12 18-25 35-16-25-16 25-25-35Z" fill="#f5e7d4" stroke="#756a59" stroke-width="1.2"/>'
  : '<path d="M147 246l33 28 33-28 15 26-28 35-20-30-20 30-28-35Z" fill="#f5e7d4" stroke="#7e6250" stroke-width="1.2"/><path d="M148 251l-14 70 31-17-11 60M212 251l14 70-31-17 11 60" fill="none" stroke="#c1a18a" stroke-width="2"/>';
 return `<svg class="portrait-artwork" viewBox="0 0 360 400" role="img" aria-labelledby="${id}-title ${id}-description" xmlns="http://www.w3.org/2000/svg">
 <title id="${id}-title">Portrait placeholder for ${name}</title>
 <desc id="${id}-description">A generic illustrated profile, to be replaced with an approved photograph.</desc>
 <defs><clipPath id="${id}-arch"><path d="M40 368V162C40 71 103 26 180 26S320 71 320 162V368Z"/></clipPath></defs>
 <rect width="360" height="400" fill="#eddcc9"/>
 <circle class="portrait-sun" cx="260" cy="94" r="72" fill="#f7ebdc"/>
 <path d="M27 376V161C27 62 97 13 180 13S333 62 333 161V376" fill="none" stroke="#bf967a" stroke-width="1"/>
 <path d="M40 368V162C40 71 103 26 180 26S320 71 320 162V368Z" fill="#e0b49c" stroke="#b47d61" stroke-width="1.2"/>
 <g clip-path="url(#${id}-arch)">
  <g class="portrait-architecture" fill="none" stroke="#f9ecdd" stroke-width="1.2" opacity=".6">
   <path d="M52 368V169C52 84 110 40 180 40S308 84 308 169V368M64 368V169C64 92 115 52 180 52S296 92 296 169V368"/>
   <path d="M44 323H316M44 330H316M77 100l10-5M284 95l10 5M76 247h23M261 247h23"/>
   <path d="M78 170l8-13 8 13-8 13ZM266 170l8-13 8 13-8 13Z"/>
  </g>
  <ellipse cx="180" cy="369" rx="112" ry="13" fill="#a8785e" opacity=".14"/>
  <g class="portrait-figure">
   <path d="M78 390l9-83c4-31 29-51 65-63h56c36 12 61 32 65 63l9 83Z" fill="${shirt}" stroke="#6c6256" stroke-width="1.4"/>
   <path d="M157 215v34q23 24 46 0v-34" fill="#cda284" stroke="#a87a5f" stroke-width="1.2"/>
   <path d="M129 154c-3-38 17-61 51-61s54 23 51 61l-5 45c-3 24-22 43-46 43s-43-19-46-43Z" fill="#e5c4a5" stroke="#a87a5f" stroke-width="1.4"/>
   <path d="M130 168c-13-8-16 5-10 17l14 10M230 168c13-8 16 5 10 17l-14 10" fill="#e5c4a5" stroke="#a87a5f" stroke-width="1.3"/>
   <path d="${younger ? 'M130 166c-20-44 0-78 44-83 44-4 72 31 57 78l-11-27c-30 3-50-5-61-17l-19 34-2 18Z' : 'M130 165c-18-39-3-72 34-79 36-8 73 12 70 55l-8 24-8-34c-15 10-43 13-68 6l-11 31Z'}" fill="${younger ? '#62594c' : '#837869'}" stroke="#665a4c" stroke-width="1.3"/>
   <path d="M163 196q17 8 34 0M174 158l-4 21h12" fill="none" stroke="#ba9173" stroke-width="1.3" stroke-linecap="round"/>
   ${collar}
   <path d="M111 311l-8 59M249 311l8 59M180 302v72M125 343l17-4M220 339l17 4" fill="none" stroke="#e4d6bf" stroke-width="1.1" opacity=".55"/>
   <circle cx="180" cy="320" r="2" fill="#e7dcc9"/><circle cx="180" cy="343" r="2" fill="#e7dcc9"/>
  </g>
 </g>
 <path d="M29 371H331M22 378H338" stroke="#b78d70" stroke-width="1.2"/>
 <g class="portrait-seal"><circle cx="294" cy="341" r="28" fill="#fbf3e5" stroke="#b78d70"/><circle cx="294" cy="341" r="22" fill="none" stroke="#ddc5ad"/><text x="294" y="349" text-anchor="middle" font-family="Display,Georgia,serif" font-size="25" fill="#8e5946">${monogram}</text></g>
 </svg>`;
}

export async function renderFounders(root) {
 const target = path.join(root, 'dist/index.html');
 let html = await readFile(target, 'utf8');
 const profiles = [['Prakash Bansal', 'Founder', 'prakash', 'PB', false], ['Yash Bansal', 'The next generation', 'yash', 'YB', true]];
 const fragment = `<!-- founder-profiles:start -->
 <div class="founder-profiles" data-motion-enabled="false" data-motion-paused="false">
  <div class="founder-line" aria-label="Prakash and Yash Bansal">
   ${profiles.map(([name, role, id, initials, younger]) => `<figure class="founder-profile" aria-labelledby="founder-${id}"><div class="founder-portrait">${portrait(name, `portrait-${id}`, initials, younger)}<span class="portrait-placeholder-tag">Photo placeholder</span></div><figcaption><strong id="founder-${id}">${name}</strong><small>${role}</small></figcaption></figure>`).join('\n')}
  </div>
  <button class="founder-motion-toggle" type="button" aria-pressed="false" hidden>Pause portrait motion</button>
 </div>
 <!-- founder-profiles:end -->`;
 const old = '<div class="founder-line"><div><strong>Prakash Bansal</strong><small>Founder</small></div><div><strong>Yash Bansal</strong><small>The next generation</small></div></div>';
 if (html.includes('<!-- founder-profiles:start -->')) html = html.replace(/<!-- founder-profiles:start -->[\s\S]*?<!-- founder-profiles:end -->/, fragment);
 else if (html.includes(old)) html = html.replace(old, fragment);
 else throw new Error('Founder profiles were not found in the page');
 await writeFile(target, html);
}
