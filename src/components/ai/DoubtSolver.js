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
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: 16 }}>← Back to Dashboard</button>
      <h2>Doubt Solver</h2>
      <textarea
        rows={6}
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Enter your doubt..."
        style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <button onClick={handleSolve} disabled={loading} style={{ marginTop: 16, padding: '10px 20px' }}>
        {loading ? 'Solving…' : 'Solve Doubt'}
      </button>
      {solution && (
        <div style={{ marginTop: 24, background: '#fef3c7', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
          <h3>Solution:</h3>
          <p>{solution}</p>
        </div>
      )}
      {error && (
        <div style={{ marginTop: 24, background: '#fee2e2', color: '#b91c1c', padding: 16, borderRadius: 8 }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
