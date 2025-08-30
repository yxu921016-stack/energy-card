export default async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  res.json({
    intensity: Math.floor(Math.random() * 20 + 80),
    freq: (432 + Math.floor(Math.random() * 8 - 4)).toFixed(2),
    ttl: '24h',
    energyLevel: '∞',
    resonance: '稳定',
    coords: '猎户座旋臂'
  });
};