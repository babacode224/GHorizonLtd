/* ============================================================
   G Horizon — Admin (Property Manager)
   Cloud mode (Supabase: auth + database + image storage) when
   configured; otherwise local mode (localStorage) so it still runs.
   ============================================================ */
(function () {
  'use strict';
  const S = window.GHStore, H = window.GHHelpers;
  if (!S) return;

  const sb = window.sb;
  const cloud = !!(window.GH_SUPABASE && window.GH_SUPABASE.ready && sb);

  const $ = (id) => document.getElementById(id);
  const listEl = $('admin-list');
  const countEl = $('list-count');
  const form = $('prop-form');
  const imgListEl = $('img-list');

  let images = [];
  let editingId = null;
  let started = false;

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ---------- Data backend abstraction ---------- */
  const localDB = {
    async list() { return S.list(); },
    async upsert(i) { S.upsert(i); },
    async remove(id) { S.remove(id); },
    async seedSamples() { S.saveAll(S.seed()); },
    async clearAll() { S.saveAll([]); }
  };
  const cloudDB = {
    async list() {
      const { data, error } = await sb.from('properties').select('id, data, created_at').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r) => Object.assign({ id: r.id }, r.data));
    },
    async upsert(i) {
      const { error } = await sb.from('properties').upsert({ id: i.id, data: i });
      if (error) throw error;
    },
    async remove(id) {
      const { error } = await sb.from('properties').delete().eq('id', id);
      if (error) throw error;
    },
    async seedSamples() {
      const rows = S.seed().map((i) => ({ id: i.id, data: i }));
      const { error } = await sb.from('properties').upsert(rows);
      if (error) throw error;
    },
    async clearAll() {
      const { error } = await sb.from('properties').delete().neq('id', '__keep_none__');
      if (error) throw error;
    }
  };
  const DB = cloud ? cloudDB : localDB;

  /* ---------- List ---------- */
  async function renderList() {
    let items = [];
    try { items = await DB.list(); }
    catch (e) { listEl.innerHTML = '<p class="text-red-600 text-sm">Could not load listings: ' + esc(e.message || e) + '</p>'; return; }
    countEl.textContent = '(' + items.length + ')';
    if (!items.length) {
      listEl.innerHTML = '<p class="text-muted text-sm">No listings yet. Add one on the right' + (cloud ? ', or click <strong>Load sample data</strong> above' : '') + '.</p>';
      return;
    }
    listEl.innerHTML = items.map((p) => `
      <div class="bg-white rounded-md border ${p.id === editingId ? 'border-navy' : 'border-mist'} p-3 flex items-center gap-3">
        <img src="${esc((p.images && p.images[0]) || '')}" alt="" class="w-16 h-14 rounded object-cover bg-mist shrink-0" />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="tag-listing ${p.listingType === 'rent' ? 'tag-rent' : 'tag-sale'} !text-[.58rem] !px-2 !py-0.5">${p.listingType === 'rent' ? 'Rent' : 'Sale'}</span>
            <h3 class="font-semibold text-navy text-sm truncate">${esc(p.title)}</h3>
          </div>
          <p class="text-xs text-muted truncate">${esc(H.categoryLabel(p.category))} · ${esc(p.location)} · ${esc(H.priceText(p))}</p>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button data-edit="${esc(p.id)}" class="p-2 text-muted hover:text-navy" aria-label="Edit" title="Edit">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button data-del="${esc(p.id)}" class="p-2 text-muted hover:text-red-600" aria-label="Delete" title="Delete">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>`).join('');

    // cache items for edit lookups without a second round-trip
    renderList._cache = items;
    listEl.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => loadForm(b.dataset.edit)));
    listEl.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
      const p = (renderList._cache || []).find((x) => x.id === b.dataset.del);
      if (p && confirm('Delete "' + p.title + '"? This cannot be undone.')) {
        try { await DB.remove(b.dataset.del); } catch (e) { alert('Delete failed: ' + (e.message || e)); return; }
        if (editingId === b.dataset.del) clearForm(); else renderList();
      }
    }));
  }

  /* ---------- Image chips ---------- */
  function renderImages() {
    imgListEl.innerHTML = images.map((src, i) => `
      <div class="relative w-24 h-20 rounded-md overflow-hidden border border-mist group">
        <img src="${esc(src)}" alt="" class="w-full h-full object-cover" />
        ${i === 0 ? '<span class="absolute bottom-0 inset-x-0 bg-navy/80 text-white text-[.6rem] text-center py-0.5">Cover</span>' : ''}
        <button type="button" data-rm="${i}" class="absolute top-1 right-1 w-5 h-5 grid place-items-center rounded-full bg-black/60 text-white text-xs hover:bg-red-600" aria-label="Remove image">×</button>
      </div>`).join('');
    imgListEl.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => {
      images.splice(parseInt(b.dataset.rm, 10), 1);
      renderImages();
    }));
  }

  async function addFiles(files) {
    for (const file of files) {
      if (cloud) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = 'p/' + Date.now() + '-' + safe;
        const up = await sb.storage.from('property-images').upload(path, file, { cacheControl: '3600', upsert: false });
        if (up.error) { alert('Image upload failed: ' + up.error.message); continue; }
        const { data } = sb.storage.from('property-images').getPublicUrl(path);
        images.push(data.publicUrl);
        renderImages();
      } else {
        await new Promise((res) => {
          const r = new FileReader();
          r.onload = () => { images.push(r.result); renderImages(); res(); };
          r.readAsDataURL(file);
        });
      }
    }
  }

  /* ---------- Form ---------- */
  function clearForm() {
    editingId = null; images = [];
    form.reset();
    $('form-title').textContent = 'Add a property';
    $('btn-delete').classList.add('hidden');
    renderImages();
    renderList();
  }

  function loadForm(id) {
    const p = (renderList._cache || []).find((x) => x.id === id);
    if (!p) return;
    editingId = id;
    $('f-id').value = p.id;
    $('f-title').value = p.title || '';
    $('f-category').value = p.category || 'house';
    $('f-type').value = p.listingType || 'sale';
    $('f-status').value = p.status || 'available';
    $('f-price').value = p.price != null ? p.price : '';
    $('f-rentPeriod').value = p.rentPeriod || 'year';
    $('f-city').value = p.city || 'lagos';
    $('f-location').value = p.location || '';
    $('f-beds').value = p.beds != null ? p.beds : '';
    $('f-baths').value = p.baths != null ? p.baths : '';
    $('f-size').value = p.size || '';
    $('f-description').value = p.description || '';
    $('f-features').value = (p.features || []).join('\n');
    $('f-youtube').value = p.youtube || '';
    $('f-featured').checked = !!p.featured;
    images = (p.images || []).slice();
    $('form-title').textContent = 'Edit property';
    $('btn-delete').classList.remove('hidden');
    renderImages();
    renderList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('f-title').value.trim();
    if (!title) return;
    const id = $('f-id').value || H.slugify(title);
    const num = (v) => { v = parseInt(v, 10); return isNaN(v) ? null : v; };
    const item = {
      id, title,
      category: $('f-category').value,
      listingType: $('f-type').value,
      status: $('f-status').value,
      price: num($('f-price').value) || 0,
      rentPeriod: $('f-rentPeriod').value,
      city: $('f-city').value,
      location: $('f-location').value.trim(),
      beds: num($('f-beds').value),
      baths: num($('f-baths').value),
      size: $('f-size').value.trim(),
      description: $('f-description').value.trim(),
      features: $('f-features').value.split('\n').map((s) => s.trim()).filter(Boolean),
      youtube: $('f-youtube').value.trim(),
      images: images.slice(),
      featured: $('f-featured').checked
    };
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true; const t = btn.textContent; btn.textContent = 'Saving…';
    try {
      await DB.upsert(item);
      const note = $('save-note'); note.classList.remove('hidden');
      setTimeout(() => note.classList.add('hidden'), 1800);
      clearForm();
    } catch (err) {
      alert('Could not save: ' + (err.message || err));
    } finally { btn.disabled = false; btn.textContent = t; }
  });

  /* ---------- Image inputs ---------- */
  $('btn-add-url').addEventListener('click', () => {
    const url = $('f-image-url').value.trim();
    if (url) { images.push(url); $('f-image-url').value = ''; renderImages(); }
  });
  $('f-image-url').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('btn-add-url').click(); } });
  $('f-image-file').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    await addFiles(files);
  });

  /* ---------- Toolbar ---------- */
  $('btn-new').addEventListener('click', clearForm);
  $('btn-clear').addEventListener('click', clearForm);
  $('btn-delete').addEventListener('click', async () => {
    if (editingId && confirm('Delete this property?')) {
      try { await DB.remove(editingId); clearForm(); } catch (e) { alert('Delete failed: ' + (e.message || e)); }
    }
  });
  $('btn-reset').addEventListener('click', async () => {
    const msg = cloud
      ? 'Delete ALL listings from the database? This cannot be undone.'
      : 'Reset all listings back to the built-in defaults? Your changes will be lost.';
    if (!confirm(msg)) return;
    try {
      if (cloud) await DB.clearAll(); else await DB.seedSamples();
      clearForm();
    } catch (e) { alert('Failed: ' + (e.message || e)); }
  });
  $('btn-seed').addEventListener('click', async () => {
    if (!confirm('Add the 10 sample listings to the database?')) return;
    try { await DB.seedSamples(); clearForm(); } catch (e) { alert('Failed: ' + (e.message || e)); }
  });
  $('btn-export').addEventListener('click', async () => {
    let json;
    try { json = JSON.stringify(await DB.list(), null, 2); } catch (e) { json = S.exportJSON(); }
    const blob = new Blob([json], { type: 'application/json' });
    const a = $('dl-anchor'); a.href = URL.createObjectURL(blob); a.download = 'gh-properties.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  /* ---------- Auth + boot ---------- */
  function setNotice(html, tone) {
    const n = $('mode-notice');
    n.className = (tone === 'cloud' ? 'bg-green-50 text-green-800' : 'bg-gold-soft/60 text-[#5b4a1e]') + ' text-sm';
    n.querySelector('div').innerHTML = html;
  }

  function startManager() {
    if (started) return; started = true;
    renderImages();
    renderList();
  }

  function showManager(user) {
    $('login-screen').classList.add('hidden');
    $('manager').classList.remove('hidden');
    $('btn-logout').classList.remove('hidden');
    $('btn-seed').classList.remove('hidden');
    if (user) $('user-email').textContent = user.email;
    setNotice('<strong>Connected to Supabase</strong> — changes are live for everyone who visits the site.', 'cloud');
    startManager();
  }

  function showLogin() {
    $('login-screen').classList.remove('hidden');
    $('manager').classList.add('hidden');
    $('btn-logout').classList.add('hidden');
  }

  async function initAuth() {
    if (!cloud) {
      $('manager').classList.remove('hidden');
      $('btn-seed').classList.add('hidden');
      setNotice('<strong>Local mode</strong> — Supabase not configured, so changes save to this browser only. Use <strong>Export JSON</strong> for a permanent copy.', 'local');
      startManager();
      return;
    }
    // Cloud mode: require sign-in
    $('manager').classList.add('hidden');
    const loginForm = $('login-form');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('login-error'); err.classList.add('hidden');
      const btn = loginForm.querySelector('[type="submit"]');
      btn.disabled = true; const t = btn.textContent; btn.textContent = 'Signing in…';
      const { error } = await sb.auth.signInWithPassword({
        email: $('login-email').value.trim(), password: $('login-password').value
      });
      btn.disabled = false; btn.textContent = t;
      if (error) { err.textContent = error.message; err.classList.remove('hidden'); }
    });
    $('btn-logout').addEventListener('click', async () => { await sb.auth.signOut(); });

    const { data } = await sb.auth.getSession();
    if (data && data.session) showManager(data.session.user); else showLogin();
    sb.auth.onAuthStateChange((_e, session) => { if (session) showManager(session.user); else showLogin(); });
  }

  initAuth();
})();
