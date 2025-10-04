import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'

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

export default function ViewItem() {
  const router = useRouter()
  const { id } = router.query

  const { data, error, mutate } = useSWR(
    id ? `/api/items/${id}` : null,
    fetcher
  )

  if (!id) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ef5350',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginTop: 0 }}>Error</h2>
          <p>{error.message} {error.status && `(Status: ${error.status})`}</p>
        </div>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          ← Back to List
        </Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading item...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#f5f5f5',
          color: '#0070f3',
          textDecoration: 'none',
          borderRadius: '4px',
          border: '1px solid #0070f3',
          fontSize: '14px'
        }}>
          ← Back to List
        </Link>
      </div>

      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            ID: {data.id}
          </span>
        </div>

        <h1 style={{ 
          fontSize: '32px', 
          marginTop: '20px',
          marginBottom: '30px',
          color: '#333'
        }}>
          {data.name}
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '150px 1fr',
          gap: '20px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          <div style={{ fontWeight: 'bold', color: '#666' }}>Item ID:</div>
          <div style={{ color: '#333' }}>{data.id}</div>

          <div style={{ fontWeight: 'bold', color: '#666' }}>Name:</div>
          <div style={{ color: '#333', fontSize: '18px' }}>{data.name}</div>

          <div style={{ fontWeight: 'bold', color: '#666' }}>Status:</div>
          <div>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              backgroundColor: '#4caf50',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              Active
            </span>
          </div>
        </div>

        <div style={{ 
          marginTop: '30px',
          paddingTop: '30px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={() => router.push(`/?edit=${data.id}`)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Edit Item
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f5f5f5',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            View All Items
          </button>
        </div>
      </div>
    </div>
  )
}