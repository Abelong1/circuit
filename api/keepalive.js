// Daily ping so the Supabase Free project never hits 7 days of inactivity and pauses.
// Runs from Vercel Cron (see vercel.json). Uses the public publishable key only.
const SB_URL = 'https://hlthachyodyncnfkpqwo.supabase.co';
const SB_KEY = 'sb_publishable_U_R4sJ3a8WS8beFADkKwIA_RBASwACA';

module.exports = async (req, res) => {
  try {
    const r = await fetch(SB_URL + '/rest/v1/aces_whitelist?select=id&limit=1', {
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
    });
    res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status, at: new Date().toISOString() });
  } catch (e) {
    res.status(502).json({ ok: false, error: String(e) });
  }
};
