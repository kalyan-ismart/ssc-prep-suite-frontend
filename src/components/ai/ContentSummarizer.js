import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ContentSummarizer() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/content-summarizer', { text });
      setSummary(res.data.data.summary);
    } catch {
      setSummary('Error summarizing content.');
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
    </div>
  );
}
