// TestAI.js - Component to test backend AI endpoints
import React, { useState } from 'react';
import api from '../apiService';

export default function TestAI() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testEndpoint = async (endpoint, payload, testName) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    
    try {
      console.log(`Testing ${testName}:`, endpoint, payload);
      const response = await api.post(endpoint, payload);
      
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: true,
          status: response.status,
          data: response.data,
          message: 'Success!'
        }
      }));
      
    } catch (error) {
      console.error(`${testName} failed:`, error);
      
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          status: error.response?.status || 'Network Error',
          data: error.response?.data || null,
          message: error.response?.data?.message || error.message || 'Unknown error'
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testHealthCheck = async () => {
    setLoading(prev => ({ ...prev, health: true }));
    
    try {
      const response = await api.get('/api/ai/health');
      setResults(prev => ({
        ...prev,
        health: {
          success: true,
          status: response.status,
          data: response.data,
          message: 'AI service is healthy!'
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        health: {
          success: false,
          status: error.response?.status || 'Network Error',
          data: error.response?.data || null,
          message: error.response?.data?.message || error.message
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, health: false }));
    }
  };

  const tests = [
    {
      name: 'health',
      label: 'AI Health Check',
      action: testHealthCheck
    },
    {
      name: 'chat',
      label: 'AI Chat Test',
      action: () => testEndpoint('/api/ai/chat', {
        message: 'Hello, can you help me with government exams?',
        context: 'You are a helpful AI assistant for government exam preparation.'
      }, 'chat')
    },
    {
      name: 'summarize', 
      label: 'AI Summarize Test',
      action: () => testEndpoint('/api/ai/summarize', {
        text: 'The Indian Constitution is the supreme law of India. It was adopted by the Constituent Assembly on 26th November 1949 and came into effect on 26th January 1950. It provides the framework for the organization of government and governance of the country.'
      }, 'summarize')
    }
  ];

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>🧪 Backend AI Endpoint Tests</h3>
          <small className="text-muted">Test your backend AI functionality</small>
        </div>
        
        <div className="card-body">
          <div className="row">
            {tests.map(test => (
              <div key={test.name} className="col-md-4 mb-3">
                <button
                  className="btn btn-primary w-100 mb-2"
                  onClick={test.action}
                  disabled={loading[test.name]}
                >
                  {loading[test.name] ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Testing...
                    </>
                  ) : (
                    test.label
                  )}
                </button>
                
                {results[test.name] && (
                  <div className={`alert ${results[test.name].success ? 'alert-success' : 'alert-danger'}`}>
                    <strong>Status:</strong> {results[test.name].status}<br/>
                    <strong>Message:</strong> {results[test.name].message}<br/>
                    {results[test.name].data && (
                      <details className="mt-2">
                        <summary>Response Data</summary>
                        <pre className="mt-2" style={{fontSize: '0.8rem'}}>
                          {JSON.stringify(results[test.name].data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <hr/>
          
          <div className="mt-3">
            <h5>🔧 Troubleshooting Tips:</h5>
            <ul>
              <li><strong>401 Unauthorized:</strong> You need to login first to access AI features</li>
              <li><strong>500 Internal Server Error:</strong> Check if OPENAI_API_KEY is set in Render backend</li>
              <li><strong>Timeout:</strong> OpenAI API might be slow, try again</li>
              <li><strong>Network Error:</strong> Backend might be sleeping (Render free tier)</li>
            </ul>
          </div>
          
          <div className="mt-3">
            <h5>📍 Backend AI Endpoints:</h5>
            <ul>
              <li><code>GET /api/ai/health</code> - Check AI service status</li>
              <li><code>POST /api/ai/chat</code> - Chat with AI assistant</li>
              <li><code>POST /api/ai/summarize</code> - Summarize text content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}