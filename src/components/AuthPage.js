// Enhanced AuthPage.js with better timeout handling and UX
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
        if (!form.username || !form.password) throw new Error('Username and password are required.');
        
        // Show backend wake-up message
        setSuccessMsg('Connecting to server...');
        
        const res = await api.post('/api/users/login', { 
          username: form.username, 
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
        // Register mode
        if (!form.username || !form.email || !form.password || !form.fullName)
          throw new Error('All fields are required for registration.');
          
        // Show backend wake-up message
        setSuccessMsg('🚀 Waking up server... This may take 30-60 seconds on first request.');
        
        const res = await api.post('/api/users/register', form);
        
        if (res.data?.data?.token) {
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
          setSuccessMsg('✅ Registration successful! Welcome to SarkariSuccess Hub!');
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
      <div className="card shadow-lg" style={{ maxWidth: 420, width: '100%', padding: 32 }}>
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
                <label className="form-label">Full Name</label>
                <input
                  type="text" className="form-control" name="fullName"
                  value={form.fullName} onChange={handleChange} autoFocus
                  disabled={loading} placeholder="Your Full Name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email" className="form-control" name="email"
                  value={form.email} onChange={handleChange}
                  disabled={loading} placeholder="your@email.com"
                />
              </div>
            </>
          )}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text" className="form-control" name="username"
              value={form.username} onChange={handleChange}
              disabled={loading} placeholder="Choose a username"
              autoFocus={mode === 'login'}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password" className="form-control" name="password"
              value={form.password} onChange={handleChange}
              disabled={loading} placeholder="Enter password" autoComplete="new-password"
            />
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