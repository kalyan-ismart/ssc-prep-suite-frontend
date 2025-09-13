import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiService';

export default function DoubtSolver() {
  const navigate = useNavigate();
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
    <div>
      <h2>Doubt Solver</h2>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your question"
        rows={4}
      />
      <button onClick={handleSolve} disabled={loading}>
        {loading ? 'Solving...' : 'Get Solution'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {solution && <div className="solution-box">{solution}</div>}
    </div>
  );
}
