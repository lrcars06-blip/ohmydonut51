// Vercel Serverless Function : vérifie le statut d'un paiement SumUp (PAID / PENDING / FAILED)
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.SUMUP_API_KEY;
  const id = String((req.query && req.query.id) || '').replace(/[^a-z0-9-]/gi, '');
  if (!key) return res.status(500).json({ error: 'SumUp non configuré' });
  if (!id) return res.status(400).json({ error: 'id manquant' });
  try {
    const r = await fetch(`https://api.sumup.com/v0.1/checkouts/${id}`, { headers: { Authorization: `Bearer ${key}` } });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'SumUp a refusé la demande' });
    return res.status(200).json({ status: j.status, amount: j.amount, currency: j.currency });
  } catch (e) {
    return res.status(502).json({ error: 'SumUp injoignable' });
  }
}
