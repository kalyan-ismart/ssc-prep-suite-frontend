import React from "react";
import { Link } from "react-router-dom";

export default function Analytics() {
  return (
    <div className="main-bg">
      <div className="modules-main-content">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '3rem' }}>📊</div>
          <h2 style={{ color: '#2563eb', margin: 0 }}>Analytics Dashboard</h2>
          <p style={{ color: '#64748b', textAlign: 'center' }}>
            Detailed analytics will appear here!
          </p>
          <Link
            to="/"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
