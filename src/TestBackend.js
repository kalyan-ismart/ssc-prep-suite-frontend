// src/TestBackend.js - Component to test backend connection
import React, { useState, useEffect } from 'react';
import api from './apiService';

export default function TestBackend() {
  const [status, setStatus] = useState({
    loading: true,
    connected: false,
    error: null,
    data: null
  });

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('Testing backend connection...');
      console.log('API Base URL:', api.defaults.baseURL);
      
      // Test basic connection
      const response = await api.get('/');
      console.log('Backend response:', response.data);
      
      setStatus({
        loading: false,
        connected: true,
        error: null,
        data: response.data
      });
    } catch (err) {
      console.error('Backend connection failed:', err);
      setStatus({
        loading: false,
        connected: false,
        error: err.response?.data?.message || err.message || 'Connection failed',
        data: null
      });
    }
  };

  const testHealthCheck = async () => {
    try {
      console.log('Testing health endpoint...');
      const response = await api.get('/health');
      console.log('Health check response:', response.data);
      alert('Health check successful: ' + JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('Health check failed:', err);
      alert('Health check failed: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">🔧 Backend Connection Test</h3>
            </div>
            <div className="card-body">
              
              {/* Connection Status */}
              <div className="mb-4">
                <h5>Connection Status:</h5>
                {status.loading ? (
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    <span>Testing connection...</span>
                  </div>
                ) : (
                  <div className={`alert ${status.connected ? 'alert-success' : 'alert-danger'}`}>
                    {status.connected ? (
                      <>
                        <strong>✅ Connected!</strong> Backend is responding.
                      </>
                    ) : (
                      <>
                        <strong>❌ Connection Failed</strong>
                        <br />
                        <small>{status.error}</small>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Backend URL */}
              <div className="mb-4">
                <h5>Backend URL:</h5>
                <code>{api.defaults.baseURL || 'Not configured'}</code>
              </div>

              {/* Response Data */}
              {status.data && (
                <div className="mb-4">
                  <h5>Backend Response:</h5>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(status.data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Test Buttons */}
              <div className="d-flex gap-2 flex-wrap">
                <button 
                  className="btn btn-primary"
                  onClick={testConnection}
                  disabled={status.loading}
                >
                  🔄 Test Connection
                </button>
                
                <button 
                  className="btn btn-success"
                  onClick={testHealthCheck}
                >
                  🏥 Health Check
                </button>
                
                <button 
                  className="btn btn-info"
                  onClick={() => {
                    console.log('Opening backend URL in new tab...');
                    window.open(api.defaults.baseURL, '_blank');
                  }}
                >
                  🌐 Open Backend
                </button>
                
                <button 
                  className="btn btn-warning"
                  onClick={() => {
                    console.log('Current API configuration:', {
                      baseURL: api.defaults.baseURL,
                      timeout: api.defaults.timeout,
                      headers: api.defaults.headers,
                      token: localStorage.getItem('token') ? 'Present' : 'Not found'
                    });
                  }}
                >
                  🔍 Debug Info
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-4 pt-3 border-top">
                <h5>Instructions:</h5>
                <ol>
                  <li>If connection fails, check if your backend is running</li>
                  <li>Verify the backend URL in your environment variables</li>
                  <li>Check browser console for detailed error messages</li>
                  <li>Ensure CORS is properly configured on backend</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}