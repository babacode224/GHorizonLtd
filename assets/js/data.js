/* ============================================================
   G Horizon — Property Data Layer  (client-side "backend")
   ------------------------------------------------------------
   Seed data lives here. The working copy is stored in the
   browser's localStorage so the admin panel can add / edit /
   remove listings. Use the admin panel's "Export JSON" to make
   changes permanent (replace the seed below, or feed a real API).
   ============================================================ */
(function (global) {
  'use strict';

  const KEY = 'gh_properties_v1';

  /* ---------- Seed listings ---------- */
  const SEED = [
    {
      id: 'maple-residence',
      title: 'The Maple Residence',
      category: 'house', listingType: 'sale', status: 'available',
      price: 450000000, location: 'Banana Island, Lagos', city: 'lagos',
      beds: 4, baths: 5, size: '620 m²',
      description: 'A statement contemporary villa on Banana Island, featuring floor-to-ceiling glazing, a private infinity pool and a double-height reception. Finished to the highest specification with imported fittings throughout.',
      features: ['Infinity pool', '24/7 security', 'Smart-home system', 'BQ + 2-car garage', 'Fitted kitchen', 'Solar backup'],
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ],
      youtube: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      featured: true
    },
    {
      id: 'horizon-gardens',
      title: 'Horizon Gardens Estate',
      category: 'land', listingType: 'sale', status: 'available',
      price: 75000000, location: 'Ibeju-Lekki, Lagos', city: 'lagos',
      beds: null, baths: null, size: '1,000 m²',
      description: 'Prime, dry and fully fenced land within a fast-appreciating estate corridor. Governor’s Consent / C-of-O title, ready for immediate development.',
      features: ['C-of-O title', 'Fenced & gated estate', 'Motorable road', 'Dry land', 'Instant allocation'],
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&w=1200&q=80'
      ],
      youtube: '',
      featured: true
    },
    {
      id: 'meridian-plaza',
      title: 'Meridian Office Plaza',
      category: 'commercial', listingType: 'sale', status: 'coming-soon',
      price: 1200000000, location: 'Central Business District, Abuja', city: 'abuja',
      beds: null, baths: null, size: '3,200 m²',
      description: 'A Grade-A office tower over eight floors with dedicated parking, high-speed lifts and backup power — an institutional-quality commercial asset.',
      features: ['8 floors', 'Dedicated parking', '2 service lifts', 'Backup power', 'Fibre-ready'],
      images: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
      ],
      youtube: '',
      featured: true
    },
    {
      id: 'cedar-court',
      title: 'Cedar Court',
      category: 'house', listingType: 'sale', status: 'available',
      price: 280000000, location: 'Maitama, Abuja', city: 'abuja',
      beds: 5, baths: 6, size: '740 m²',
      description: 'An elegant five-bedroom detached home in Maitama with mature gardens, a family lounge and staff quarters, set on a quiet, tree-lined street.',
      features: ['Mature garden', 'Staff quarters', 'Family lounge', 'Fitted kitchen', 'Ample parking'],
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
      ],
      youtube: '',
      featured: false
    },
    {
      id: 'serenade-duplex',
      title: 'The Serenade Duplex',
      category: 'house', listingType: 'rent', status: 'available',
      price: 25000000, rentPeriod: 'year', location: 'Lekki Phase 1, Lagos', city: 'lagos',
      beds: 4, baths: 5, size: '520 m²',
      description: 'A beautifully finished four-bedroom duplex available for lease in Lekki Phase 1, with an open-plan living space, fitted kitchen and serviced compound.',
      features: ['Serviced compound', 'Fitted kitchen', '24/7 security', 'Backup power', 'Parking for 4'],
      images: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80'
      ],
      youtube: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      featured: true
    },
    {
      id: 'vantage-retail',
      title: 'Vantage Retail Suites',
      category: 'commercial', listingType: 'rent', status: 'available',
      price: 18000000, rentPeriod: 'year', location: 'Victoria Island, Lagos', city: 'lagos',
      beds: null, baths: null, size: '1,100 m²',
      description: 'Flexible ground-floor retail and office suites for lease on Victoria Island — high footfall, excellent frontage and generous parking.',
      features: ['Prime frontage', '12 configurable units', 'High footfall', 'Ample parking', 'Backup power'],
      images: [
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80'
      ],
      youtube: '',
      featured: false
    },
    {
      id: 'aubrey-townhouse',
      title: 'The Aubrey Townhouse',
      category: 'house', listingType: 'sale', status: 'sold',
      price: 95000000, location: 'Ikoyi, Lagos', city: 'lagos',
      beds: 3, baths: 4, size: '410 m²',
      description: 'A refined three-bedroom townhouse in the heart of Ikoyi. Now sold — contact us for similar off-market opportunities.',
      features: ['Gated terrace', 'Fitted kitchen', 'Roof terrace', 'Secure parking'],
      images: [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80'
      ],
      youtube: '',
      featured: false
    },
    {
      id: 'riverside-parcel',
      title: 'Riverside Parcel',
      category: 'land', listingType: 'sale', status: 'available',
      price: 40000000, location: 'GRA Phase 2, Port Harcourt', city: 'port-harcourt',
      beds: null, baths: null, size: '800 m²',
      description: 'A well-positioned residential plot in GRA Phase 2 with a registered Deed of Assignment, close to key amenities and road networks.',
      features: ['Deed of Assignment', 'Residential zoning', 'Good road access', 'Serene neighbourhood'],
      images: [
        'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=1200&q=80'
      ],
      youtube: '',
      featured: false
    },
    {
      id: 'logix-warehouse',
      title: 'Logix Warehouse Bay',
      category: 'commercial', listingType: 'rent', status: 'available',
      price: 30000000, rentPeriod: 'year', location: 'Idu Industrial, Abuja', city: 'abuja',
      beds: null, baths: null, size: '2,400 m²',
      description: 'A high-clearance warehouse with a loading dock and dedicated yard for lease — ideal for distribution and light industrial use.',
      features: ['Loading dock', 'High clearance', 'Truck yard', '3-phase power', 'Gated & secure'],
      images: [
        'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80'
      ],
      youtube: '',
      featured: false
    },
    {
      id: 'palm-court-apartment',
      title: 'Palm Court Apartment',
      category: 'house', listingType: 'rent', status: 'available',
      price: 9000000, rentPeriod: 'year', location: 'Old GRA, Port Harcourt', city: 'port-harcourt',
      beds: 3, baths: 3, size: '210 m²',
      description: 'A serviced three-bedroom apartment for lease in Old GRA, with a fitted kitchen, gym access and round-the-clock power and security.',
      features: ['Serviced apartment', 'Gym access', '24/7 power', 'Fitted kitchen', 'Secure parking'],
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
      ],
      youtube: '',
      featured: false
    }
  ];

  /* ---------- Store ---------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const Store = {
    seed: () => clone(SEED),

    list() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return clone(SEED);
        const arr = JSON.parse(raw);
        return Array.isArray(arr) && arr.length ? arr : clone(SEED);
      } catch (e) {
        return clone(SEED);
      }
    },

    saveAll(arr) {
      localStorage.setItem(KEY, JSON.stringify(arr));
      return arr;
    },

    find(id) { return this.list().find((p) => p.id === id) || null; },

    upsert(item) {
      const arr = this.list();
      const i = arr.findIndex((p) => p.id === item.id);
      if (i >= 0) arr[i] = item; else arr.unshift(item);
      return this.saveAll(arr);
    },

    remove(id) { return this.saveAll(this.list().filter((p) => p.id !== id)); },

    reset() { localStorage.removeItem(KEY); return clone(SEED); },

    exportJSON() { return JSON.stringify(this.list(), null, 2); }
  };

  /* ---------- Helpers ---------- */
  const Helpers = {
    slugify(s) {
      return (s || '').toString().toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || ('listing-' + Date.now());
    },

    // Compact Naira label: 450000000 -> "₦450M", 1200000000 -> "₦1.2B"
    money(n) {
      n = Number(n) || 0;
      if (n >= 1e9) return '₦' + (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + 'B';
      if (n >= 1e6) return '₦' + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M';
      if (n >= 1e3) return '₦' + Math.round(n / 1e3) + 'K';
      return '₦' + n;
    },

    priceLabel(p) {
      const base = this.money(p.price);
      if (p.listingType === 'rent') return base + '<span class="text-sm font-normal text-muted">/' + (p.rentPeriod === 'month' ? 'mo' : 'yr') + '</span>';
      return base;
    },

    priceText(p) {
      const base = this.money(p.price);
      if (p.listingType === 'rent') return base + '/' + (p.rentPeriod === 'month' ? 'mo' : 'yr');
      return base;
    },

    categoryLabel(c) {
      return { house: 'House', land: 'Land Plot', commercial: 'Commercial' }[c] || c;
    },

    statusBadge(s) {
      const map = {
        available: { cls: 'badge-selling', text: 'Available' },
        sold: { cls: 'badge-sold', text: 'Sold' },
        rented: { cls: 'badge-sold', text: 'Rented' },
        'coming-soon': { cls: 'badge-soon', text: 'Coming Soon' }
      };
      return map[s] || map.available;
    },

    // Extract a YouTube video id from many URL shapes
    youtubeId(url) {
      if (!url) return '';
      const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{6,})/);
      if (m) return m[1];
      if (/^[A-Za-z0-9_-]{6,}$/.test(url)) return url; // raw id
      return '';
    },

    youtubeEmbed(url) {
      const id = this.youtubeId(url);
      return id ? 'https://www.youtube.com/embed/' + id : '';
    },

    youtubeThumb(url) {
      const id = this.youtubeId(url);
      return id ? 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg' : '';
    }
  };

  /* ---------- Async data layer (Supabase-backed, local fallback) ----------
     Public pages call GHData.list()/find(); they resolve from Supabase when
     it is configured & reachable, otherwise from the local seed/localStorage
     so the site is never empty. */
  const rowToItem = (r) => Object.assign({ id: r.id }, r.data || {});

  const Data = {
    configured() { return !!(global.sb && global.GH_SUPABASE && global.GH_SUPABASE.ready); },

    async list() {
      if (this.configured()) {
        try {
          const { data, error } = await global.sb
            .from('properties').select('id, data, created_at')
            .order('created_at', { ascending: false });
          if (error) throw error;
          if (data && data.length) return data.map(rowToItem);
          return clone(SEED); // remote reachable but empty -> show seed
        } catch (e) {
          console.warn('Supabase read failed — using local data.', e.message || e);
          return Store.list();
        }
      }
      return Store.list();
    },

    async find(id) {
      if (this.configured()) {
        try {
          const { data, error } = await global.sb
            .from('properties').select('id, data').eq('id', id).maybeSingle();
          if (error) throw error;
          if (data) return rowToItem(data);
        } catch (e) {
          console.warn('Supabase find failed — using local data.', e.message || e);
        }
        // remote miss -> fall back to seed so known ids still resolve
        return Store.list().find((p) => p.id === id) || null;
      }
      return Store.find(id);
    }
  };

  global.GHStore = Store;
  global.GHHelpers = Helpers;
  global.GHData = Data;
})(window);
