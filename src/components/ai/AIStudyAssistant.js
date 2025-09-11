import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AIStudyAssistant() {
  const navigate = useNavigate();
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
    </div>
  );
}
