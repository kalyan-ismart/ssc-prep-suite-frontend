// src/components/ai/ContentSummarizer.js
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
      setSummary(res.data.summary);
    } catch {
      setSummary('Error summarizing content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tool-container">
      <h2>Content Summarizer</h2>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste content to summarize..."
      />
      <button onClick={handleSummarize} disabled={loading}>
        {loading ? 'Summarizing…' : 'Summarize'}
      </button>
      {summary && (
        <div className="ai-response">
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
