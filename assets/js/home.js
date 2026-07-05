/* ============================================================
   G Horizon — Homepage featured listings
   Renders up to 3 featured properties into #featured-grid.
   ============================================================ */
(function () {
  'use strict';
  const grid = document.getElementById('featured-grid');
  if (!grid || !window.GHData) return;
  const H = window.GHHelpers;

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function cardHTML(p) {
    const st = H.statusBadge(p.status);
    const isRent = p.listingType === 'rent';
    const specs = [];
    if (p.beds) specs.push(p.beds + ' Beds');
    if (p.baths) specs.push(p.baths + ' Baths');
    if (p.size) specs.push(p.size);
    const href = 'property.html#id=' + encodeURIComponent(p.id);
    return `
      <article class="prop-card relative reveal in" data-category="${p.category}">
        <div class="prop-media relative aspect-[4/3]">
          <img src="${esc(p.images[0] || '')}" alt="${esc(p.title)}" loading="lazy" class="w-full h-full object-cover" />
          <span class="tag-listing ${isRent ? 'tag-rent' : 'tag-sale'} absolute top-4 left-4">${isRent ? 'For Rent' : 'For Sale'}</span>
          <span class="badge ${st.cls} absolute top-4 right-4">${st.text}</span>
        </div>
        <div class="p-6">
          <div class="text-xs uppercase tracking-widest text-gold font-semibold mb-2">${H.categoryLabel(p.category)}</div>
          <h3 class="font-serif text-xl font-semibold text-navy mb-1.5">${esc(p.title)}</h3>
          <p class="text-sm text-muted flex items-center gap-1.5 mb-4">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-5.7-7-11a7 7 0 0114 0c0 5.3-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
            ${esc(p.location)}
          </p>
          ${specs.length ? `<div class="flex items-center gap-4 text-sm text-muted border-y border-mist py-3 mb-4">${specs.map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
          <div class="flex items-center justify-between">
            <span class="font-serif text-2xl font-semibold text-navy">${H.priceLabel(p)}</span>
            <button type="button" data-inquire="${esc(p.title)}" class="btn btn-ghost !py-2 !px-4 !text-sm relative z-20">Inquire</button>
          </div>
        </div>
        <a href="${href}" class="absolute inset-0 z-10" aria-label="View ${esc(p.title)}"></a>
      </article>`;
  }

  (async function init() {
    const all = await window.GHData.list();
    let featured = all.filter((p) => p.featured).slice(0, 3);
    if (featured.length < 3) featured = featured.concat(all.filter((p) => !p.featured)).slice(0, 3);
    grid.innerHTML = featured.map(cardHTML).join('');
  })();
})();
