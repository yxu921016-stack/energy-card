export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const id = Math.random().toString(36).slice(2);
  res.json({ id });
};