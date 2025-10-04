export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_API_URL || 'http://backend:5000'
  const url = `${backend}${req.url}`
  try {
    const r = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json'
      },
      body: req.method === 'GET' || req.method === 'DELETE' ? undefined : JSON.stringify(req.body)
    })
    const data = await r.json().catch(() => ({}))
    res.status(r.status).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
