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
    <div>
      <h2>AI Study Assistant</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your question or topic"
        rows={5}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Generating...' : 'Get Answer'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {answer && <div className="answer-box">{answer}</div>}
    </div>
  );
}
