import React, { useState } from 'react';
import axios from 'axios';

export default function DoubtSolver() {
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
      <h2>Doubt Solver</h2>
      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Enter your doubt or question"
        rows={6}
        style={{ width: '100%', padding: '1em', fontSize: '1rem' }}
      />
      <button onClick={handleSolve} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Solving…' : 'Solve Doubt'}
      </button>
      {solution && (
        <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', background: '#dff7df', padding: '1rem' }}>
          <h3>Solution:</h3>
          <p>{solution}</p>
        </div>
      )}
    </div>
  );
}
