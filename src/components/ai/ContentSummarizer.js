import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiService';

export default function ContentSummarizer() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const res = await api.post('/ai/content-summarizer', { text });
      if (res.data && res.data.success) {
        setSummary(res.data.data.summary);
      } else {
        setError('Unexpected response from AI.');
      }
    } catch (err) {
      console.error('Error calling AI content-summarizer:', err);
      setError('Error summarizing content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: 16 }}>← Back to Dashboard</button>
      <h2>Content Summarizer</h2>
      <textarea
        rows={6}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste text to summarize..."
        style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <button onClick={handleSummarize} disabled={loading} style={{ marginTop: 16, padding: '10px 20px' }}>
        {loading ? 'Summarizing…' : 'Summarize'}
      </button>
      {summary && (
        <div style={{ marginTop: 24, background: '#ecfdf5', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
          <h3>Summary:</h3>
          <p>{summary}</p>
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
