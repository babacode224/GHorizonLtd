/* ============================================================
   G Horizon — Products listing (data-driven, Supabase-backed)
   ============================================================ */
(function () {
  'use strict';
  const grid = document.getElementById('property-grid');
  if (!grid || !window.GHData) return;

  const H = window.GHHelpers;
  const countEl = document.getElementById('result-count');
  const emptyEl = document.getElementById('empty-state');
  const locationSel = document.getElementById('filter-location');
  const priceSel = document.getElementById('filter-price');
  const sortSel = document.getElementById('filter-sort');

  const state = { category: 'all', type: 'all' };
  let ALL = [];  // loaded once from GHData

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function cardHTML(p) {
    const st = H.statusBadge(p.status);
    const isRent = p.listingType === 'rent';
    const specs = [];
    if (p.beds) specs.push(p.beds + ' Beds');
    if (p.baths) specs.push(p.baths + ' Baths');
    if (p.size) specs.push(p.size);
    const img = (p.images && p.images[0]) || '';
    const href = 'property.html#id=' + encodeURIComponent(p.id);
    return `
      <article class="prop-card relative" data-category="${p.category}" data-type="${p.listingType}" data-location="${p.city}" data-price="${p.price}">
        <div class="prop-media relative aspect-[4/3]">
          <img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy" class="w-full h-full object-cover" />
          <span class="tag-listing ${isRent ? 'tag-rent' : 'tag-sale'} absolute top-4 left-4">${isRent ? 'For Rent' : 'For Sale'}</span>
          <span class="badge ${st.cls} absolute top-4 right-4">${st.text}</span>
        </div>
        <div class="p-6">
          <div class="text-xs uppercase tracking-widest text-gold font-semibold mb-2">${H.categoryLabel(p.category)}</div>
          <h3 class="font-serif text-xl font-semibold text-navy mb-1.5">${esc(p.title)}</h3>
          <p class="text-sm text-muted mb-4">${esc(p.location)}</p>
          ${specs.length ? `<div class="flex items-center gap-4 text-sm text-muted border-y border-mist py-3 mb-4">${specs.map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
          <div class="flex items-center justify-between">
            <span class="font-serif text-2xl font-semibold text-navy">${H.priceLabel(p)}</span>
            <button type="button" data-inquire="${esc(p.title)}" class="btn btn-ghost !py-2 !px-4 !text-sm relative z-20">Inquire</button>
          </div>
        </div>
        <a href="${href}" class="absolute inset-0 z-10" aria-label="View ${esc(p.title)}"></a>
      </article>`;
  }

  function filtered() {
    let list = ALL.slice();
    if (state.category !== 'all') list = list.filter((p) => p.category === state.category);
    if (state.type !== 'all') list = list.filter((p) => p.listingType === state.type);
    const loc = locationSel ? locationSel.value : 'all';
    if (loc !== 'all') list = list.filter((p) => p.city === loc);
    const price = priceSel ? priceSel.value : 'all';
    if (price === 'lt100') list = list.filter((p) => p.price < 100000000);
    else if (price === '100-300') list = list.filter((p) => p.price >= 100000000 && p.price <= 300000000);
    else if (price === 'gt300') list = list.filter((p) => p.price > 300000000);

    const v = sortSel ? sortSel.value : 'featured';
    if (v === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (v === 'price-desc') list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }

  function render() {
    const list = filtered();
    grid.innerHTML = list.map(cardHTML).join('');
    if (countEl) countEl.textContent = list.length;
    if (emptyEl) emptyEl.classList.toggle('hidden', list.length !== 0);
  }

  // Filters
  document.querySelectorAll('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((c) => c.classList.remove('chip-active'));
      chip.classList.add('chip-active');
      state.category = chip.dataset.filter;
      render();
    });
  });
  document.querySelectorAll('[data-type]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-type]').forEach((c) => c.classList.remove('chip-active'));
      chip.classList.add('chip-active');
      state.type = chip.dataset.type;
      render();
    });
  });
  [locationSel, priceSel, sortSel].forEach((s) => s && s.addEventListener('change', render));

  // Deep links: ?type=rent / ?category=house (or #type=..)
  const params = new URLSearchParams(location.search || location.hash.replace(/^#/, ''));
  const qType = params.get('type');
  const qCat = params.get('category');
  if (qType && document.querySelector(`[data-type="${qType}"]`)) {
    state.type = qType;
    document.querySelectorAll('[data-type]').forEach((c) => c.classList.toggle('chip-active', c.dataset.type === qType));
  }
  if (qCat && document.querySelector(`[data-filter="${qCat}"]`)) {
    state.category = qCat;
    document.querySelectorAll('[data-filter]').forEach((c) => c.classList.toggle('chip-active', c.dataset.filter === qCat));
  }

  (async function init() {
    grid.innerHTML = '<p class="text-muted col-span-full py-10 text-center">Loading properties…</p>';
    ALL = await window.GHData.list();
    render();
  })();
})();
