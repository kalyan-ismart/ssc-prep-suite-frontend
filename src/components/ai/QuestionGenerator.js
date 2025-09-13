import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiService';

export default function QuestionGenerator() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setQuestions('');
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
    <div>
      <h2>Question Generator</h2>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic"
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {questions && (
        <ul>
          {questions.map((q, idx) => (
            <li key={idx}>{q}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
