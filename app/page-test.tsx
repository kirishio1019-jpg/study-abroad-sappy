"use client"

export default function TestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h1 style={{ fontSize: '2.5em', marginBottom: '20px', color: '#333' }}>
          ✅ テストページが表示されました！
        </h1>
        <p style={{ fontSize: '1.2em', color: '#666' }}>
          このページが表示されれば、Next.jsは正常に動作しています。
        </p>
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#4CAF50', 
          color: 'white',
          borderRadius: '10px'
        }}>
          <p style={{ margin: 0 }}>開発サーバーは正常に動作しています。</p>
        </div>
      </div>
    </div>
  )
}


