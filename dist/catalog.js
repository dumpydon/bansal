(() => {
  'use strict';
  const data = window.BANSAL_CATALOG;
  if (!data?.products?.length) return;
  const $ = (selector) => document.querySelector(selector);
  const brands = new Map(data.brands.map(brand => [brand.id, brand]));
  const categoryNames = { all: 'All products', confectionery: 'Confectionery', biscuits: 'Biscuits & wafers', savouries: 'Sweets & savouries', baby: 'Baby care', home: 'Home care', extras: 'Drinks & more' };
  const section = $('#range'), dialog = $('#catalog-dialog'), stage = $('#catalog-featured');
  const featuredImage = $('#catalog-featured-image'), progress = $('#catalog-progress-fill').parentElement;
  const imageArea = $('#catalog-image-area'), neighbours = [...imageArea.querySelectorAll('.catalog-peek')];
  const playButton = $('#catalog-play'), announcement = $('#catalog-announcement');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let category = 'all', pool = photoPool('all'), index = 0;
  let userPaused = motion.matches, inView = !('IntersectionObserver' in window), hovering = false, imageFocused = false, timer = null;
  let selectionUntil = 0, allowHoverPlayback = false, allowFocusPlayback = false;
  let opener = null, shown = 24, filtered = [];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function photoPool(selected) {
    const items = data.products.filter(p => p.image && (selected === 'all' || p.category === selected));
    // The biscuits shortcut leads with Priyagold, followed by wafers and bakery ranges.
    if (selected === 'biscuits') items.sort((a,b) => (a.brand==='priyagold'?-1:a.brand==='nabati'?0:1)-(b.brand==='priyagold'?-1:b.brand==='nabati'?0:1));
    return items;
  }
  function current() { return pool[index]; }
  function wrapIndex(position) { return ((position % pool.length) + pool.length) % pool.length; }
  function announce() { announcement.textContent = `${brands.get(current().brand).name}: ${current().name}`; }
  function holdSelection() {
    if (!userPaused) selectionUntil = performance.now() + 7000;
    // The selected product gets seven seconds, even while its button stays hovered or focused.
    allowHoverPlayback = true;
    allowFocusPlayback = true;
  }
  function schedule() {
    clearTimeout(timer);timer = null;
    const running = !userPaused && (!hovering || allowHoverPlayback) && (!imageFocused || allowFocusPlayback) && inView && !document.hidden && !dialog.open && pool.length > 1;
    progress.classList.remove('running');
    playButton.innerHTML = userPaused ? '▷ <span>Play</span>' : 'Ⅱ <span>Pause</span>';
    playButton.setAttribute('aria-label', userPaused ? 'Play product slideshow' : 'Pause product slideshow');
    playButton.setAttribute('aria-pressed', String(!userPaused));
    if (running) {
      const now = performance.now();
      const delay = selectionUntil > now ? selectionUntil - now : 2000;
      progress.style.setProperty('--catalog-interval', `${delay}ms`);
      void progress.offsetWidth;
      if (!motion.matches) progress.classList.add('running');
      timer = setTimeout(() => { selectionUntil = 0; index = (index + 1) % pool.length; render(); schedule(); }, delay);
    }
  }
  function render() {
    const product = current(), brand = brands.get(product.brand);
    featuredImage.hidden = false;
    stage.querySelector('.catalog-image-fallback')?.remove();
    featuredImage.src = product.image;featuredImage.alt = `${brand.name} ${product.name}`;
    stage.href = product.url;stage.setAttribute('aria-label', `View ${brand.name} ${product.name} on the official website (opens in a new tab)`);
    $('#showcase-brand').textContent = brand.name;
    const brandItems = pool.filter(p => p.brand === product.brand);
    $('#showcase-count').textContent = `${String(brandItems.findIndex(p => p.id===product.id)+1).padStart(2,'0')} / ${String(brandItems.length).padStart(2,'0')}`;
    $('#showcase-family').textContent = categoryNames[product.category];
    $('#showcase-name').textContent = product.name;
    $('#showcase-link').href = brand.url;
    $('#showcase-link').innerHTML = `View ${escape(brand.name)} catalogue <span aria-hidden="true">↗</span>`;
    $('#catalog-showing').textContent = category === 'all' ? 'Exploring all seven companies · Click a company to browse its catalogue' : `${categoryNames[category]} · ${pool.length} photographed products`;
    document.querySelectorAll('.catalog-brand').forEach(button => button.classList.toggle('active', button.dataset.brand===product.brand));
    for (const button of neighbours) {
      const delta = Number(button.dataset.offset), neighbour = pool[wrapIndex(index + delta)];
      button.querySelector('img').src = neighbour.image;
      const position = delta < 0 ? (delta === -1 ? 'Previous product' : 'Two products before') : (delta === 1 ? 'Next product' : 'Two products ahead');
      button.setAttribute('aria-label', `Show ${brands.get(neighbour.brand).name} ${neighbour.name} in focus (${position.toLowerCase()})`);
    }
    stage.classList.remove('arrive');void stage.offsetWidth;
    if (!motion.matches) stage.classList.add('arrive');
  }
  featuredImage.addEventListener('error', () => {
    featuredImage.hidden = true;
    if (!stage.querySelector('.catalog-image-fallback')) {
      const fallback=document.createElement('span');fallback.className='catalog-image-fallback';fallback.textContent=current().name;
      const caption=document.createElement('small');caption.textContent='View the official product';fallback.append(caption);stage.append(fallback);
    }
  });
  function move(delta, manual=true) { index=wrapIndex(index+delta);if(manual)holdSelection();render();if(manual)announce();schedule(); }
  $('#catalog-prev').addEventListener('click',()=>move(-1));$('#catalog-next').addEventListener('click',()=>move(1));
  neighbours.forEach(button => button.addEventListener('click', () => move(Number(button.dataset.offset))));
  stage.addEventListener('click',()=>{holdSelection();schedule();});
  playButton.addEventListener('click',()=>{userPaused=!userPaused;selectionUntil=0;allowHoverPlayback=allowFocusPlayback=!userPaused;schedule();});
  imageArea.addEventListener('pointerenter',()=>{hovering=true;allowHoverPlayback=false;schedule();});
  imageArea.addEventListener('pointerleave',()=>{hovering=false;allowHoverPlayback=false;schedule();});
  imageArea.addEventListener('focusin',()=>{imageFocused=true;allowFocusPlayback=false;schedule();});
  imageArea.addEventListener('focusout',event=>{if(imageArea.contains(event.relatedTarget))return;imageFocused=false;allowFocusPlayback=false;schedule();});
  document.addEventListener('visibilitychange',schedule);
  motion.addEventListener('change',()=>{if(motion.matches){userPaused=true;selectionUntil=0;}schedule();});
  if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);schedule();},{threshold:.1}).observe(section);

  function setCategory(next) {
    const nextPool=photoPool(next);if(!nextPool.length)return;
    category=next;pool=nextPool;index=0;selectionUntil=0;
    document.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===category)));
    render();announce();schedule();
  }
  document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>setCategory(button.dataset.category)));
  document.querySelectorAll('[data-brand]').forEach(button=>button.addEventListener('click',()=>{
    setCategory('all');index=pool.findIndex(p=>p.brand===button.dataset.brand);if(index<0)index=0;render();
    openCatalog(button,button.dataset.brand,'all');
  }));

  const grid=$('#catalog-grid'), search=$('#catalog-search'), brandFilter=$('#catalog-brand-filter'), categoryFilter=$('#catalog-category-filter');
  function card(product) {
    const brand=brands.get(product.brand),article=document.createElement('article');article.className='catalog-card';
    const image=product.thumb ? `<img src="${escape(product.thumb)}" alt="${escape(brand.name+' '+product.name)}" width="240" height="240" loading="lazy" decoding="async">` : `<span class="catalog-image-fallback">${escape(brand.name)}<small>Pack photograph unavailable</small></span>`;
    article.innerHTML=`<a class="catalog-card-image" href="${escape(product.url)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escape(product.name)} on the official website">${image}</a><span class="catalog-card-brand">${escape(brand.name)}</span><h3>${escape(product.name)}</h3><p class="catalog-card-detail">${escape(categoryNames[product.category])}</p><a href="${escape(product.url)}" target="_blank" rel="noopener noreferrer">View official product <span aria-hidden="true">↗</span></a>`;
    article.querySelector('img')?.addEventListener('error',e=>{const span=document.createElement('span');span.className='catalog-image-fallback';span.textContent='View official product';e.target.replaceWith(span);},{once:true});
    return article;
  }
  function appendCards(start) {
    const fragment=document.createDocumentFragment();filtered.slice(start,shown).forEach(p=>fragment.append(card(p)));grid.append(fragment);
    $('#catalog-more').hidden=shown>=filtered.length;
  }
  function filterCatalog() {
    const query=search.value.toLocaleLowerCase().trim();
    filtered=data.products.filter(p=>(brandFilter.value==='all'||p.brand===brandFilter.value)&&(categoryFilter.value==='all'||p.category===categoryFilter.value)&&(!query||`${p.name} ${brands.get(p.brand).name} ${p.detail} ${categoryNames[p.category]}`.toLocaleLowerCase().includes(query)));
    shown=24;grid.replaceChildren();appendCards(0);
    if(!filtered.length){const empty=document.createElement('p');empty.className='catalog-empty';empty.textContent='No matches yet. Try another name or choose a different company.';grid.append(empty);}
    $('#catalog-result-count').textContent=`${filtered.length} ${filtered.length===1?'product':'products'}${query?' matching your search':''}`;
    const brand=brands.get(brandFilter.value),official=$('#catalog-dialog-official');official.hidden=!brand;
    if(brand){official.href=brand.url;official.innerHTML=`Visit ${escape(brand.name)} <span aria-hidden="true">↗</span>`;}
    $('#catalog-dialog-note').textContent=brand?.id==='nabati'?'Nabati’s international catalogue is shown here. India assortment can differ; confirm Jaipur availability with our team.':'Explore the manufacturers’ ranges. Confirm current stock and local availability with Bansal Sales Corporation.';
  }
  function openCatalog(button,brand='all',selectedCategory=category) {
    opener=button;search.value='';brandFilter.value=brand;categoryFilter.value=selectedCategory;filterCatalog();
    document.body.classList.add('catalog-modal-open');
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    dialog.querySelector('.catalog-dialog-body').scrollTop=0;schedule();
    const initialFocus=matchMedia('(max-width:760px)').matches?$('#catalog-close'):search;initialFocus.focus({preventScroll:true});
  }
  function closeCatalog(){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');document.body.classList.remove('catalog-modal-open');opener?.focus({preventScroll:true});schedule();}
  document.querySelectorAll('.catalog-open').forEach(button=>button.addEventListener('click',()=>openCatalog(button,'all',button.closest('.portfolio-head')?'all':category)));
  $('#catalog-close').addEventListener('click',closeCatalog);
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeCatalog();});
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeCatalog();}});
  dialog.addEventListener('click',event=>{if(event.target===dialog)closeCatalog();});
  search.addEventListener('input',filterCatalog);brandFilter.addEventListener('change',filterCatalog);categoryFilter.addEventListener('change',filterCatalog);
  $('#catalog-more').addEventListener('click',()=>{const start=shown;shown+=24;appendCards(start);$('#catalog-result-count').textContent=`Showing ${Math.min(shown,filtered.length)} of ${filtered.length} products`;});
  $('#catalog-top').addEventListener('click',()=>{dialog.querySelector('.catalog-dialog-body').scrollTo?.({top:0,behavior:motion.matches?'instant':'smooth'});search.focus({preventScroll:true});});
  render();schedule();
})();
