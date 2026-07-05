/* ============================================================
   G Horizon — Property detail page (Supabase-backed)
   Reads #id= from the URL, renders gallery + YouTube tour + info.
   ============================================================ */
(function () {
  'use strict';
  const mount = document.getElementById('property-detail');
  if (!mount || !window.GHData) return;
  const H = window.GHHelpers;

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // id from hash (#id=) first — survives static-host redirects — else ?id=
  const hash = location.hash.replace(/^#/, '');
  const search = location.search.replace(/^\?/, '');
  const id = new URLSearchParams(hash || search).get('id');

  function renderNotFound() {
    mount.innerHTML = `
      <div class="max-w-container mx-auto px-5 lg:px-8 py-24 text-center">
        <h1 class="font-serif text-4xl font-semibold text-navy mb-3">Property not found</h1>
        <p class="text-muted mb-8">This listing may have been removed or the link is incorrect.</p>
        <a href="products.html" class="btn btn-primary">Back to all properties</a>
      </div>`;
  }

  function render(p) {
    document.title = p.title + ' — G Horizon Enterprise Limited';
    const st = H.statusBadge(p.status);
    const isRent = p.listingType === 'rent';
    const embed = H.youtubeEmbed(p.youtube);
    const images = (p.images && p.images.length) ? p.images : [''];

    const thumbs = images.map((src, i) => `
      <button type="button" class="pd-thumb ${i === 0 ? 'active' : ''} shrink-0 w-24 h-20 rounded-md overflow-hidden border-2 ${i === 0 ? 'border-navy' : 'border-transparent'}" data-src="${esc(src)}" aria-label="View image ${i + 1}">
        <img src="${esc(src)}" alt="${esc(p.title)} photo ${i + 1}" class="w-full h-full object-cover" loading="lazy" />
      </button>`).join('');

    const specs = [];
    if (p.beds) specs.push(['Bedrooms', p.beds]);
    if (p.baths) specs.push(['Bathrooms', p.baths]);
    if (p.size) specs.push(['Size', p.size]);
    specs.push(['Category', H.categoryLabel(p.category)]);
    specs.push(['Listing', isRent ? 'For Rent' : 'For Sale']);
    specs.push(['Status', st.text]);

    const features = (p.features || []).map((f) => `
      <li class="flex items-center gap-2.5 text-muted">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-sky shrink-0"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        ${esc(f)}
      </li>`).join('');

    const videoBlock = embed ? `
      <div class="mb-12">
        <h2 class="font-serif text-2xl font-semibold text-navy mb-4">Video tour</h2>
        <div class="relative w-full rounded-lg overflow-hidden border border-mist shadow-sm" style="aspect-ratio:16/9;">
          <iframe class="absolute inset-0 w-full h-full" src="${esc(embed)}" title="${esc(p.title)} video tour"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>` : '';

    mount.innerHTML = `
      <section class="bg-mist border-b border-mist">
        <div class="max-w-container mx-auto px-5 lg:px-8 pt-8 pb-8">
          <nav class="text-sm text-muted mb-5 flex items-center gap-2">
            <a href="index.html" class="hover:text-navy">Home</a><span>/</span>
            <a href="products.html" class="hover:text-navy">Properties</a><span>/</span>
            <span class="text-ink">${esc(p.title)}</span>
          </nav>
          <div class="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <span class="tag-listing ${isRent ? 'tag-rent' : 'tag-sale'}">${isRent ? 'For Rent' : 'For Sale'}</span>
                <span class="badge ${st.cls}">${st.text}</span>
                <span class="text-xs uppercase tracking-widest text-gold font-semibold">${H.categoryLabel(p.category)}</span>
              </div>
              <h1 class="font-serif text-4xl lg:text-5xl font-semibold text-navy-ink leading-tight">${esc(p.title)}</h1>
              <p class="text-muted mt-2 flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-5.7-7-11a7 7 0 0114 0c0 5.3-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
                ${esc(p.location)}
              </p>
            </div>
            <div class="text-right"><div class="font-serif text-4xl font-semibold text-navy">${H.priceLabel(p)}</div></div>
          </div>
        </div>
      </section>

      <section class="bg-white">
        <div class="max-w-container mx-auto px-5 lg:px-8 py-10">
          <div class="rounded-lg overflow-hidden border border-mist bg-mist">
            <img id="pd-main" src="${esc(images[0])}" alt="${esc(p.title)}" class="w-full object-cover" style="aspect-ratio:16/9;" />
          </div>
          ${images.length > 1 ? `<div class="flex gap-3 mt-4 overflow-x-auto pb-1">${thumbs}</div>` : ''}
        </div>
      </section>

      <section class="bg-white pb-20">
        <div class="max-w-container mx-auto px-5 lg:px-8 grid lg:grid-cols-3 gap-10">
          <div class="lg:col-span-2">
            ${videoBlock}
            <h2 class="font-serif text-2xl font-semibold text-navy mb-4">About this property</h2>
            <p class="text-muted leading-relaxed text-lg mb-10 max-w-2xl">${esc(p.description)}</p>
            ${features ? `<h2 class="font-serif text-2xl font-semibold text-navy mb-4">Features & amenities</h2><ul class="grid sm:grid-cols-2 gap-3 mb-10">${features}</ul>` : ''}
            <h2 class="font-serif text-2xl font-semibold text-navy mb-4">Specifications</h2>
            <dl class="grid sm:grid-cols-2 gap-x-10 gap-y-4 max-w-xl">
              ${specs.map(([k, v]) => `<div class="flex items-center justify-between border-b border-mist pb-3"><dt class="text-muted">${esc(k)}</dt><dd class="font-semibold text-navy">${esc(v)}</dd></div>`).join('')}
            </dl>
          </div>
          <aside class="lg:col-span-1">
            <div class="lg:sticky lg:top-24 bg-white border border-mist rounded-lg shadow-sm p-7">
              <p class="text-sm text-muted mb-1">${isRent ? 'Rent' : 'Price'}</p>
              <div class="font-serif text-3xl font-semibold text-navy mb-5">${H.priceLabel(p)}</div>
              <div class="space-y-3">
                <button type="button" data-inquire="${esc(p.title)}" class="btn btn-primary w-full">Inquire about this property</button>
                <a href="contact.html" class="btn btn-ghost w-full">Book an inspection</a>
              </div>
              <div class="mt-6 pt-6 border-t border-mist text-sm text-muted space-y-2">
                <p class="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.5-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z"/></svg><a href="tel:+2348000000000" class="hover:text-navy">+234 800 000 0000</a></p>
                <p class="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6" stroke-linecap="round" stroke-linejoin="round"/></svg><a href="mailto:hello@ghorizon.com" class="hover:text-navy">hello@ghorizon.com</a></p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section class="bg-mist py-10">
        <div class="max-w-container mx-auto px-5 lg:px-8">
          <a href="products.html" class="link-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg> Back to all properties</a>
        </div>
      </section>`;

    const main = document.getElementById('pd-main');
    mount.querySelectorAll('.pd-thumb').forEach((t) => {
      t.addEventListener('click', () => {
        main.src = t.dataset.src;
        mount.querySelectorAll('.pd-thumb').forEach((x) => { x.classList.remove('active', 'border-navy'); x.classList.add('border-transparent'); });
        t.classList.add('active', 'border-navy'); t.classList.remove('border-transparent');
      });
    });
  }

  (async function init() {
    if (!id) { renderNotFound(); return; }
    const p = await window.GHData.find(id);
    if (!p) { renderNotFound(); return; }
    render(p);
  })();
})();
