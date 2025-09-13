import React, { useState } from 'react';
import api from '../../apiService';

export default function ContentSummarizer() {
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
    <div className="ai-tool-container">
      <h2>Content Summarizer</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or enter content to summarize..."
        rows={8}
        disabled={loading}
        className="input-box"
      />
      <button onClick={handleSummarize} disabled={loading || !text.trim()}>
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>
      {error && <p className="error-text">{error}</p>}
      {summary && (
        <div className="output-box">
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
