import React, { useState } from 'react';
import axios from 'axios';

export default function ContentSummarizer() {
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
      <h2>Content Summarizer</h2>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste your study material or notes here..."
        rows={8}
        style={{ width: '100%', padding: '1em', fontSize: '1rem' }}
      />
      <button onClick={handleSummarize} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Summarizing…' : 'Summarize'}
      </button>
      {summary && (
        <div style={{ marginTop: '1rem', background: '#fff3cd', padding: '1rem', whiteSpace: 'pre-wrap' }}>
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
