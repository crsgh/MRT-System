import React from 'react';

export default function PaymentFailedPage() {
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
        backgroundColor: '#FF3B30', 
        color: 'white', 
        fontSize: '30px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        ✕
      </div>
      <h1 style={{ color: '#333' }}>Payment Failed</h1>
      <p style={{ color: '#666', marginTop: '10px' }}>
        Something went wrong. Please try again in the app.
      </p>
    </div>
  );
}
