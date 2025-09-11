import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DoubtSolver() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSolve = async () => {
    if (!question) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/doubt-solver', { question });
      setSolution(res.data.data.solution);
    } catch {
      setSolution('Error generating solution.');
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
    </div>
  );
}
