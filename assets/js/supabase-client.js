/* ============================================================
   G Horizon — Supabase client
   Loaded AFTER the supabase-js CDN and BEFORE data.js.
   Safe to expose: the publishable (anon) key is client-side by
   design; Row-Level Security controls who can write.
   ============================================================ */
(function () {
  'use strict';

  // Your Supabase project
  const SUPABASE_URL = 'https://zyktctfppruqqibezuqj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_wmli0TLalqgkHO96UtqgHw_8OOOSKCe';

  window.GH_SUPABASE = { url: SUPABASE_URL, key: SUPABASE_KEY, ready: false };

  try {
    if (window.supabase && SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('YOUR_')) {
      window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      window.GH_SUPABASE.ready = true;
    }
  } catch (e) {
    console.warn('Supabase init failed — site will use local seed data.', e);
  }
})();
