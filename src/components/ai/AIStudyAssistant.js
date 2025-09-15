// Fix for AI Study Assistant Component
// This component should call the correct backend AI endpoint

import React, { useState } from 'react';
import api from '../../apiService';

export default function AIStudyAssistant() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      console.log('Sending message to AI:', message);
      
      // ✅ FIXED: Use correct backend AI endpoint
      const res = await api.post('/api/ai/chat', {
        message: message.trim(),
        context: "You are a helpful AI assistant for government exam preparation. Help students with their studies, provide explanations, and answer questions related to SSC, UPSC, and other government exams."
      });

      console.log('AI Response:', res.data);
      
      // Handle response based on backend structure
      const aiResponse = res.data.data?.message || res.data.message || res.data;
      setResponse(aiResponse);
      
    } catch (err) {
      console.error('AI API Error:', err);
      
      // Better error handling
      if (err.response?.status === 401) {
        setError('Authentication required. Please login first.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. AI service is taking longer than expected.');
      } else if (!err.response) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.response?.data?.message || 'Failed to get AI response. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">🤖 AI Study Assistant</h3>
              <small className="text-muted">Get help with your government exam preparation</small>
            </div>
            
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Ask your question:</label>
                  <textarea
                    id="message"
                    className="form-control"
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about government exams, study strategies, topics, or get explanations..."
                    disabled={loading}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !message.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Getting Answer...
                    </>
                  ) : (
                    'Get Answer'
                  )}
                </button>
              </form>

              {/* Error Display */}
              {error && (
                <div className="alert alert-danger mt-3">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Response Display */}
              {response && (
                <div className="mt-4">
                  <h5>AI Response:</h5>
                  <div className="bg-light p-3 rounded">
                    <pre style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                      {response}
                    </pre>
                  </div>
                </div>
              )}

              {/* Example Questions */}
              <div className="mt-4">
                <h6>Example Questions:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {[
                    "Explain the Indian Constitution basics",
                    "What are the important current affairs topics?",
                    "How to prepare for SSC CGL quantitative aptitude?",
                    "Tell me about UPSC exam pattern"
                  ].map((question, index) => (
                    <button
                      key={index}
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setMessage(question)}
                      disabled={loading}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}