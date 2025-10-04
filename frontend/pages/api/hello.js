export default async function handler(req, res) {
  // Use relative path so browser requests go to same origin and nginx will proxy /api -> backend
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/items`)
    const data = await r.json()
    if (!r.ok) {
      return res.status(502).json({ error: 'Backend error', details: data })
    }
    res.status(200).json({ from: 'frontend', backend: data })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
