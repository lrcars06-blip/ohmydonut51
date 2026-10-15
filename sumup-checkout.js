// Vercel Serverless Function : crée un paiement SumUp (page de paiement hébergée)
// Variables d'environnement à définir sur Vercel : SUMUP_API_KEY, SUMUP_MERCHANT_CODE
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST uniquement' });
  const key = process.env.SUMUP_API_KEY, merchant = process.env.SUMUP_MERCHANT_CODE;
  if (!key || !merchant) return res.status(500).json({ error: 'SumUp non configuré (SUMUP_API_KEY / SUMUP_MERCHANT_CODE manquants)' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const code = String(body.code || '').replace(/[^A-Z0-9-]/gi, '').slice(0, 20);
  const amount = Math.round(Number(body.amount) * 100) / 100;
  if (!code || !(amount >= 1) || amount > 2000) return res.status(400).json({ error: 'Montant ou référence invalide' });

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const payload = {
    checkout_reference: `${code}-${Date.now()}`,
    amount, currency: 'EUR',
    description: String(body.description || 'Oh My Donut').slice(0, 200),
    merchant_code: merchant,
    redirect_url: `${proto}://${host}/?paiement=retour&ref=${code}`,
    hosted_checkout: { enabled: true }
  };
  try {
    const r = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    if (!r.ok || !j.hosted_checkout_url) return res.status(502).json({ error: 'SumUp a refusé la demande', detail: j });
    return res.status(200).json({ url: j.hosted_checkout_url, id: j.id });
  } catch (e) {
    return res.status(502).json({ error: 'SumUp injoignable' });
  }
}
