// src/components/ai/QuestionGenerator.js
import React, { useState } from 'react';
import axios from 'axios';

export default function QuestionGenerator() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/question-generator', { topic });
      setQuestions(res.data.questions);
    } catch {
      setQuestions(['Error generating questions.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tool-container">
      <h2>Question Generator</h2>
      <input
        type="text"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="Enter topic for questions..."
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Questions'}
      </button>
      {questions.length > 0 && (
        <div className="ai-response">
          <h3>Generated Questions:</h3>
          <ul>
            {questions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
