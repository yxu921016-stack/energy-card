// api/report/[id].js
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  res.json({
    id,
    intensity: Math.floor(Math.random() * 20 + 80),
    freq: (432 + Math.floor(Math.random() * 8 - 4)).toFixed(2),
    ttl: '24h',
    energyLevel: '∞',
    resonance: '稳定',
    coords: '猎户座旋臂·银河历2025.08.30'
  });
}