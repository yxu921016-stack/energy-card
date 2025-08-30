// api/create.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 简单返回一个唯一 id
  const id = Math.random().toString(36).slice(2);
  return res.json({ id });
}