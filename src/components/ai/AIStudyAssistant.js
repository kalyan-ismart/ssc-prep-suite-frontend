// src/components/ai/AIStudyAssistant.js
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
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer('Error generating response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tool-container">
      <h2>AI Study Assistant</h2>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Ask your study question..."
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Thinking…' : 'Ask AI'}
      </button>
      {answer && (
        <div className="ai-response">
          <h3>AI Response:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
