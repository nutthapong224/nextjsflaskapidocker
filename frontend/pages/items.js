import { useState, useEffect } from 'react'

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    try {
      const r = await fetch(`${apiBase}/items`)
      const json = await r.json()
      setItems(json.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function createItem(e) {
    e.preventDefault()
    if (!name) return
    try {
      const r = await fetch(`${apiBase}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (r.ok) {
        setName('')
        fetchItems()
      } else {
        const err = await r.json()
        alert(JSON.stringify(err))
      }
    } catch (e) {
      alert(e.message)
    }
  }

  function startEdit(item) {
    setEditingId(item.id)
    setName(item.name)
  }

  async function saveEdit(e) {
    e.preventDefault()
    if (!name) return
    try {
      const r = await fetch(`${apiBase}/items/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (r.ok) {
        setEditingId(null)
        setName('')
        fetchItems()
      } else {
        const err = await r.json()
        alert(JSON.stringify(err))
      }
    } catch (e) {
      alert(e.message)
    }
  }

  async function deleteItem(id) {
    if (!confirm('Delete?')) return
    try {
      const r = await fetch(`${apiBase}/items/${id}`, { method: 'DELETE' })
      if (r.ok) fetchItems()
      else alert('Failed to delete')
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Items</h1>

        <form onSubmit={editingId ? saveEdit : createItem} className="row" style={{ marginBottom: 12 }}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" />
          <button type="submit">{editingId ? 'Save' : 'Create'}</button>
          {editingId && (
            <button type="button" className="ghost" onClick={() => { setEditingId(null); setName('') }}>Cancel</button>
          )}
        </form>

        {loading ? (
          <div className="muted">Loading...</div>
        ) : (
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.id}</td>
                  <td>{it.name}</td>
                  <td>
                    <button onClick={() => startEdit(it)}>Edit</button>
                    <button className="ghost" onClick={() => deleteItem(it.id)} style={{ marginLeft: 8 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
