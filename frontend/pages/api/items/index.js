const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL|| 'http://backend:5000'

export default async function handler(req, res) {
  const { method } = req

  try {
    if (method === 'GET') {
      // List all items
      const response = await fetch(`${BACKEND_URL}/api/items`)
      const data = await response.json()
      
      if (!response.ok) {
        return res.status(response.status).json(data)
      }
      
      return res.status(200).json(data)
    }
    
    if (method === 'POST') {
      // Create new item
      const response = await fetch(`${BACKEND_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      })
      const data = await response.json()
      
      if (!response.ok) {
        return res.status(response.status).json(data)
      }
      
      return res.status(201).json(data)
    }
    
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}