import React, { useState } from 'react';
import axios from 'axios';

export default function QuestionGenerator() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/question-generator', { topic });
      setQuestions(res.data.data.questions);
    } catch {
      setQuestions('Error generating questions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Question Generator</h2>
      <input
        type="text"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="Enter topic"
        style={{ width: '100%', padding: '0.75em', fontSize: '1rem' }}
      />
      <button onClick={handleGenerate} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Generating…' : 'Generate Questions'}
      </button>
      {questions && (
        <pre style={{ marginTop: '1rem', background: '#fef3c7', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
          {questions}
        </pre>
      )}
    </div>
  );
}
