import { useState } from 'react'
import useSWR from 'swr'

const fetcher = async (url) => {
  const res = await fetch(url)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(json.error?.message || json.error || 'Failed to fetch')
    err.info = json
    err.status = res.status
    throw err
  }
  return json
}

export default function Home() {
  const { data, error, mutate } = useSWR('/api/items', fetcher)
  const [newItemName, setNewItemName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const handleCreate = async (e) => {
    if (e) e.preventDefault()
    if (!newItemName.trim()) return

    setLoading(true)
    setActionError(null)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName })
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to create item')
      }
      setNewItemName('')
      mutate()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id) => {
    if (!editingName.trim()) return

    setLoading(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName })
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to update item')
      }
      setEditingId(null)
      setEditingName('')
      mutate()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    setLoading(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to delete item')
      }
      mutate()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditingName(item.name)
    setActionError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
    setActionError(null)
  }

  const handleKeyPress = (e, action, ...args) => {
    if (e.key === 'Enter') {
      action(...args)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Items Management</h1>

      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0, fontSize: '18px', marginBottom: '15px' }}>Create New Item</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleCreate)}
            placeholder="Enter item name"
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleCreate}
            disabled={loading || !newItemName.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !newItemName.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading || !newItemName.trim() ? 0.6 : 1
            }}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {(error || actionError) && (
        <div style={{
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '4px',
          border: '1px solid #ef5350'
        }}>
          <strong>Error:</strong> {actionError || error.message}
          {error && error.status && ` (status: ${error.status})`}
          {error && (
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => mutate()}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  color: '#d32f2f',
                  border: '1px solid #d32f2f',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {!data && !error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading items...
        </div>
      )}

      {data && (
        <div>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>
            Items List ({(data.items || []).length})
          </h2>
          {(data.items || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', backgroundColor: '#fafafa', borderRadius: '8px' }}>
              No items yet. Create one above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(data.items || []).map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '15px',
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  {editingId === item.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, handleUpdate, item.id)}
                        disabled={loading}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #0070f3',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleUpdate(item.id)}
                          disabled={loading || !editingName.trim()}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#0070f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading || !editingName.trim() ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            opacity: loading || !editingName.trim() ? 0.6 : 1
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={loading}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#f5f5f5',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '16px', color: '#333' }}>{item.name}</strong>
                        <span style={{ marginLeft: '10px', color: '#999', fontSize: '13px' }}>
                          (ID: {item.id})
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => window.location.href = `/items/${item.id}`}
                          disabled={loading}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          disabled={loading}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#f5f5f5',
                            color: '#0070f3',
                            border: '1px solid #0070f3',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={loading}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#fff',
                            color: '#d32f2f',
                            border: '1px solid #d32f2f',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}