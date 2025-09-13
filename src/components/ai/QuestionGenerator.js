import React, { useState } from 'react';
import api from '../apiService';

export default function QuestionGenerator() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setQuestions([]);
    try {
      const res = await api.post('/ai/question-generator', { topic });
      if (res.data && res.data.success) {
        setQuestions(res.data.data.questions);
      } else {
        setError('Unexpected response from AI.');
      }
    } catch (err) {
      console.error('Error calling AI question-generator:', err);
      setError('Error generating questions.');
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
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic"
        disabled={loading}
        className="input-box"
      />
      <button onClick={handleGenerate} disabled={loading || !topic.trim()}>
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
      {error && <p className="error-text">{error}</p>}
      {questions.length > 0 && (
        <ul className="output-list">
          {questions.map((question, index) => (
            <li key={index}>{question}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
