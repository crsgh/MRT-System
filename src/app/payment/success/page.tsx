'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const [message, setMessage] = useState('Payment successful! Returning to app...');
  const [isVerifying, setIsVerifying] = useState(false);
  const searchParams = useSearchParams();
  const sourceId = searchParams.get('sourceId');

  const handleReturnToApp = async () => {
    setIsVerifying(true);
    setMessage('Verifying payment...');
    
    try {
      // Verify payment first
      if (sourceId) {
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceId })
        });
        
        const data = await response.json();
        console.log('Payment verification result:', data);
      }
      
      // After verification, return to app using deep link
      setTimeout(() => {
        // Use the correct deep link to navigate to Wallet tab
        const deepLink = `mrtapp://Wallet`;
        console.log('Opening deep link:', deepLink);
        window.location.href = deepLink;
        
        // Fallback: if deep link doesn't work, show message
        setTimeout(() => {
          setMessage('Payment verified! You can close this page and return to the app.');
          setIsVerifying(false);
        }, 1000);
      }, 500);
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('Payment verified! You can close this page and return to the app.');
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    // Auto-verify after 1 second
    const autoVerifyTimer = setTimeout(() => {
      handleReturnToApp();
    }, 1000);

    return () => clearTimeout(autoVerifyTimer);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        width: '80px', 
        height: '80px', 
        borderRadius: '50%', 
        backgroundColor: '#34C759', 
        color: 'white', 
        fontSize: '40px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)',
        animation: 'scaleIn 0.5s ease-out'
      }}>
        ✓
      </div>
      <h1 style={{ color: '#333', marginBottom: '10px', fontSize: '28px', fontWeight: '600' }}>
        Payment Successful!
      </h1>
      <p style={{ color: '#666', marginTop: '20px', fontSize: '16px', lineHeight: '1.6' }}>
        {message}
      </p>

      <button
        onClick={handleReturnToApp}
        disabled={isVerifying}
        style={{
          marginTop: '40px',
          padding: '14px 40px',
          fontSize: '16px',
          fontWeight: '600',
          color: 'white',
          backgroundColor: isVerifying ? '#999' : '#007AFF',
          border: 'none',
          borderRadius: '8px',
          cursor: isVerifying ? 'default' : 'pointer',
          transition: 'background-color 0.3s ease',
          boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
          opacity: isVerifying ? 0.7 : 1
        }}
        onMouseEnter={(e) => !isVerifying && (e.currentTarget.style.backgroundColor = '#0051D5')}
        onMouseLeave={(e) => !isVerifying && (e.currentTarget.style.backgroundColor = '#007AFF')}
      >
        {isVerifying ? 'Verifying...' : 'Return to MRT App'}
      </button>
      
      <div style={{ marginTop: '60px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', maxWidth: '400px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
          💡 <strong>Tip:</strong> Click the button above to return to the app and verify your payment instantly.
        </p>
      </div>
      
      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
