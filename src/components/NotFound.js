import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="main-bg">
      <div className="modules-main-content">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          flexDirection: 'column',
          textAlign: 'center',
          gap: '1.5rem'
        }}>
          {/* 404 Animation */}
          <div style={{
            fontSize: '8rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
            animation: 'bounce 2s infinite'
          }}>
            404
          </div>

          {/* Error Message */}
          <div>
            <h1 style={{
              margin: '0 0 1rem 0',
              color: '#1e293b',
              fontSize: '2.5rem',
              fontWeight: '700'
            }}>
              Page Not Found
            </h1>
            <p style={{
              margin: '0 0 2rem 0',
              color: '#64748b',
              fontSize: '1.2rem',
              lineHeight: '1.6',
              maxWidth: '500px'
            }}>
              The page you're looking for doesn't exist. It might have been moved, 
              deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Link
              to="/"
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'inline-block',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              🏠 Go to Dashboard
            </Link>
            
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            >
              ← Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            maxWidth: '600px'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: '#374151',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              Popular Pages
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem'
            }}>
              <Link
                to="/"
                style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#eff6ff'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/profile"
                style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#eff6ff'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                👤 User Profile
              </Link>
              <span style={{
                color: '#64748b',
                padding: '0.5rem'
              }}>
                🔍 Search Tools
              </span>
              <span style={{
                color: '#64748b',
                padding: '0.5rem'
              }}>
                📚 Study Materials
              </span>
            </div>
          </div>

          {/* Contact Support */}
          <div style={{
            marginTop: '1rem',
            color: '#64748b',
            fontSize: '0.9rem'
          }}>
            Still can't find what you're looking for?{' '}
            <a
              href="mailto:support@sarkarisuccesshub.com"
              style={{
                color: '#2563eb',
                textDecoration: 'none'
              }}
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
}
