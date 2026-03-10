// Test page component - Simple verification that React app is working
export default function TestPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#2563eb', fontSize: '2rem' }}>App is Working! ✅</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        If you can see this, the React app is rendering correctly.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <a href="/dashboard" style={{ 
          padding: '1rem 2rem', 
          backgroundColor: '#2563eb', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '0.5rem'
        }}>
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}
