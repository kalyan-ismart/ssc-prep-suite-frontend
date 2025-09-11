import React, { useState } from 'react';
import axios from 'axios';

export default function AIStudyAssistant() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/study-assistant', { prompt });
      setAnswer(res.data.data.answer);
    } catch {
      setAnswer('Error generating response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>AI Study Assistant</h2>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Ask your study question..."
        rows={6}
        style={{ width: '100%', padding: '1em', fontSize: '1rem' }}
      />
      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Thinking…' : 'Ask AI'}
      </button>
      {answer && (
        <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', background: '#eef6ff', padding: '1rem' }}>
          <h3>AI Response:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
