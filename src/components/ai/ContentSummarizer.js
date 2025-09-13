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
    <div>
      <h2>Content Summarizer</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type content here"
        rows={6}
      />
      <button onClick={handleSummarize} disabled={loading}>
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {summary && <div className="summary-box">{summary}</div>}
    </div>
  );
}
