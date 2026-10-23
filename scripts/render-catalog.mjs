import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
export async function renderCatalog(root) {
 const context = { window: {} };vm.runInNewContext(await readFile(path.join(root,'dist/catalog-data.js'),'utf8'),context);
 const data=context.window.BANSAL_CATALOG;
 const logoManifest=JSON.parse(await readFile(path.join(root,'brand-logos.json'),'utf8'));
 const displayBrands=logoManifest.brands.map(logo=>{
  const brand=data.brands.find(brand=>brand.id===logo.id);
  if(!brand)throw new Error(`Unknown logo brand: ${logo.id}`);
  return {...brand,logo};
 });
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const categories=[['all','All products',''],['confectionery','Confectionery','https://www.perfettivanmelle.in/our-brands/overview/'],['biscuits','Biscuits & wafers','https://priyagold.com/biscuits.php'],['savouries','Sweets & savouries','https://www.bikano.com/'],['baby','Baby care','https://www.huggies.co.in/diapers'],['home','Home care','https://allout.in/products/'],['extras','Drinks & more','https://www.nabatisnack.co.id/products.html']];
 const photos=data.products.filter(p=>p.image);
 const b=data.brands[0],p=data.products.find(p=>p.brand===b.id&&p.image),count=data.products.filter(p=>p.brand===b.id).length;
 const values={BRAND_BUTTONS:displayBrands.map(brand=>{let n=data.products.filter(p=>p.brand===brand.id).length;return `<button type="button" data-brand="${brand.id}" class="catalog-brand${brand.id===b.id?' active':''}" aria-haspopup="dialog" aria-label="Open ${escape(brand.name)} catalogue, ${n} products"><span class="catalog-brand-logo" aria-hidden="true"><img src="${escape(brand.logo.file)}" alt="" width="${brand.logo.width}" height="${brand.logo.height}" loading="lazy" decoding="async"></span><span class="catalog-brand-name">${brand.id==='perfetti'?'Perfetti<br>Van Melle':escape(brand.name)}</span><span class="catalog-brand-count">${n} products <span aria-hidden="true">↗</span></span></button>`}).join(''),
 CATEGORY_BUTTONS:categories.map(([id,name,url])=>`<div class="catalog-category-row"><button type="button" data-category="${id}" aria-pressed="${id==='all'}">${escape(name)}</button>${url?`<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escape(name)} on the official ${id==='biscuits'?'Priyagold ':''}website" title="Open official catalogue">↗</a>`:'<span aria-hidden="true">✧</span>'}</div>`).join(''),
 PREV_SECOND_IMAGE:photos.at(-2).image,PREV_IMAGE:photos.at(-1).image,NEXT_IMAGE:photos[1].image,NEXT_SECOND_IMAGE:photos[2].image,TOTAL:data.products.length,FIRST_BRAND:b.name,FIRST_BRAND_TOTAL:String(count).padStart(2,'0'),FIRST_URL:p.url,FIRST_IMAGE:p.image,FIRST_NAME:p.name,FIRST_CATEGORY:'Confectionery',FIRST_CATALOGUE:b.url,UPDATED:'23 October 2026',
 BRAND_OPTIONS:displayBrands.map(b=>`<option value="${b.id}">${escape(b.name)}</option>`).join(''),CATEGORY_OPTIONS:categories.slice(1).map(([id,n])=>`<option value="${id}">${escape(n)}</option>`).join(''),NOSCRIPT_LINKS:displayBrands.map(b=>`<a href="${b.url}" target="_blank" rel="noopener noreferrer">${escape(b.name)} catalogue ↗</a>`).join(' · ')};
 let fragment=await readFile(path.join(root,'design/catalog-section.html'),'utf8');fragment=fragment.replace(/\{\{(\w+)\}\}/g,(_,k)=>values[k]??'');
 const target=path.join(root,'dist/index.html');let html=await readFile(target,'utf8');html=html.replace(/<section class="portfolio[\s\S]*?<\/section>/,fragment);
 if(!html.includes('catalog.css'))html=html.replace('<link rel="stylesheet" href="styles.css">','<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="catalog.css">');
 if(!html.includes('catalog-data.js'))html=html.replace('<script src="app.js" defer></script>','<script src="app.js" defer></script><script src="catalog-data.js" defer></script><script src="catalog.js" defer></script>');
 await writeFile(target,html);
 return data;
}
