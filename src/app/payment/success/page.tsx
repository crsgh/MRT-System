import React from 'react';

export default function PaymentSuccessPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ 
        width: '60px', 
        height: '60px', 
        borderRadius: '50%', 
        backgroundColor: '#34C759', 
        color: 'white', 
        fontSize: '30px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        ✓
      </div>
      <h1 style={{ color: '#333' }}>Payment Successful!</h1>
      <p style={{ color: '#666', marginTop: '10px', marginBottom: '30px' }}>
        You can now return to the app.
      </p>
      
      <a 
        href="exp://172.20.10.3:8081"
        style={{
          backgroundColor: '#007AFF',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >
        Return to App
      </a>
    </div>
  );
}
