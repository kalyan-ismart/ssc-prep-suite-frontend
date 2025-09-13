import React, { useState } from 'react';
import api from '../../apiService';

export default function DoubtSolver() {
  const [question, setQuestion] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSolve = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    setSolution('');
    try {
      const res = await api.post('/ai/doubt-solver', { question });
      if (res.data && res.data.success) {
        setSolution(res.data.data.solution);
      } else {
        setError('Unexpected response from AI.');
      }
    } catch (err) {
      console.error('Error calling AI doubt-solver:', err);
      setError('Error generating solution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tool-container">
      <h2>Doubt Solver</h2>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your question here..."
        rows={5}
        disabled={loading}
        className="input-box"
      />
      <button onClick={handleSolve} disabled={loading || !question.trim()}>
        {loading ? 'Solving...' : 'Get Solution'}
      </button>
      {error && <p className="error-text">{error}</p>}
      {solution && (
        <div className="output-box">
          <h3>Solution:</h3>
          <p>{solution}</p>
        </div>
      )}
    </div>
  );
}
