import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiService';

export default function AIStudyAssistant() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await api.post('/ai/study-assistant', { prompt });
      if (res.data && res.data.success) {
        setAnswer(res.data.data.answer);
      } else {
        setError('Unexpected response from AI.');
      }
    } catch (err) {
      console.error('Error calling AI study-assistant:', err);
      setError('Error generating response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: 16 }}>← Back to Dashboard</button>
      <h2>AI Study Assistant</h2>
      <textarea
        rows={6}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Ask your study question..."
        style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 16, padding: '10px 20px' }}>
        {loading ? 'Thinking…' : 'Ask AI'}
      </button>
      {answer && (
        <div style={{ marginTop: 24, background: '#f0f9ff', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
          <h3>AI Response:</h3>
          <p>{answer}</p>
        </div>
      )}
      {error && (
        <div style={{ marginTop: 24, background: '#fee2e2', color: '#b91c1c', padding: 16, borderRadius: 8 }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
