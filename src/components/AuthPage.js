// Enhanced AuthPage.js with fixed login/register fields
import React, { useState } from 'react';
import api from '../apiService';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function switchMode() {
    setError('');
    setSuccessMsg('');
    setForm({ username: '', email: '', password: '', fullName: '' });
    setMode(mode === 'login' ? 'register' : 'login');
  }

  // Wake up backend function
  async function wakeUpBackend() {
    try {
      await fetch('https://ssc-prep-suite-backend-123.onrender.com/health', { 
        method: 'GET',
        timeout: 5000 
      });
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        // ✅ FIXED: Login requires email, not username
        if (!form.email || !form.password) {
          throw new Error('Email and password are required.');
        }
        
        // Show backend wake-up message
        setSuccessMsg('🔐 Logging you in...');
        
        const res = await api.post('/api/users/login', { 
          email: form.email,        // ✅ Changed from username to email
          password: form.password 
        });
        
        if (res.data?.data?.token) {
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
          setSuccessMsg('✅ Login successful! Redirecting...');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          throw new Error(res.data.message || 'Login failed');
        }
      } else {
        // Register mode - Enhanced validation
        if (!form.fullName || !form.email || !form.username || !form.password) {
          throw new Error('All fields are required for registration.');
        }
        
        setSuccessMsg('📝 Creating your account...');
        const res = await api.post('/api/users/register', form);
        
        if (res.data?.data?.token) {
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
          setSuccessMsg('🎉 Registration successful! Welcome to SarkariSuccess Hub!');
          setTimeout(() => window.location.reload(), 2000);
        } else if (res.data?.success && res.data?.accessToken) {
          // Handle different response format
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          setSuccessMsg('🎉 Registration successful! Welcome to SarkariSuccess Hub!');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          throw new Error(res.data.message || 'Registration failed');
        }
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('⏰ Server is waking up from sleep. Please try again in 30 seconds.');
      } else {
        setError(err.response?.data?.message || err.message || 'Something went wrong!');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <div className="card shadow-lg" style={{ maxWidth: 450, width: '100%', padding: 32 }}>
        <h2 className="text-center mb-4">{mode === 'login' ? '🔐 Login' : '📝 Register'}</h2>
        
        {/* Backend Status Info */}
        <div className="alert alert-info mb-3" style={{ fontSize: '0.9em' }}>
          <strong>💡 Note:</strong> First request may take 30-60 seconds as our free server wakes up.
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error}
            {error.includes('waking up') && (
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => window.open('https://ssc-prep-suite-backend-123.onrender.com', '_blank')}
                >
                  🚀 Wake Up Server
                </button>
              </div>
            )}
          </div>
        )}
        
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        
        <form onSubmit={handleSubmit} autoComplete="off">
          {mode === 'register' && (
            <>
              <div className="mb-3">
                <label className="form-label">Full Name *</label>
                <input
                  type="text" className="form-control" name="fullName"
                  value={form.fullName} onChange={handleChange} autoFocus
                  disabled={loading} placeholder="Your Full Name"
                  required
                />
                <small className="text-muted">Enter your complete name</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email" className="form-control" name="email"
                  value={form.email} onChange={handleChange}
                  disabled={loading} placeholder="your@email.com"
                  required
                />
                <small className="text-muted">Valid email address required</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Username *</label>
                <input
                  type="text" className="form-control" name="username"
                  value={form.username} onChange={handleChange}
                  disabled={loading} placeholder="Choose a unique username"
                  minLength={3}
                  required
                />
                <small className="text-muted">3+ characters, letters, numbers, underscore allowed</small>
              </div>
            </>
          )}

          {/* ✅ FIXED: Different fields for login vs register */}
          {mode === 'login' && (
            <div className="mb-3">
              <label className="form-label">Email *</label>
              <input
                type="email" className="form-control" name="email"
                value={form.email} onChange={handleChange}
                disabled={loading} placeholder="your@email.com"
                autoFocus required
              />
              <small className="text-muted">Enter your registered email address</small>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Password *</label>
            <input
              type="password" className="form-control" name="password"
              value={form.password} onChange={handleChange}
              disabled={loading} 
              placeholder={mode === 'register' ? 'Strong password (8+ chars, mixed case, numbers, symbols)' : 'Enter your password'}
              autoComplete="new-password"
              minLength={mode === 'register' ? 8 : 1}
              required
            />
            {mode === 'register' && (
              <small className="text-muted">
                Must contain: uppercase, lowercase, number, special character
              </small>
            )}
          </div>
          
          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                {mode === 'login' ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? '🔐 Login' : '📝 Register'
            )}
          </button>
        </form>
        
        <div className="text-center mt-3">
          <button className="btn btn-link" onClick={switchMode} disabled={loading}>
            {mode === 'login'
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>

        {/* Quick Test Credentials */}
        {mode === 'login' && (
          <div className="alert alert-light mt-3" style={{ fontSize: '0.85em' }}>
            <strong>🧪 Test Credentials:</strong><br/>
            Email: <code>kalyan.success2025@gmail.com</code><br/>
            Password: <code>SarkariHub123!</code>
          </div>
        )}
        
        {/* Quick Server Wake Button */}
        <div className="text-center mt-2">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => window.open('https://ssc-prep-suite-backend-123.onrender.com', '_blank')}
          >
            🚀 Wake Up Server
          </button>
        </div>
      </div>
    </div>
  );
}