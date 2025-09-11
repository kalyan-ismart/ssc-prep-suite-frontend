// src/components/ai/DoubtSolver.js
import React, { useState } from 'react';
import axios from 'axios';

export default function DoubtSolver() {
  const [doubt, setDoubt] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSolve = async () => {
    if (!doubt) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/doubt-solver', { doubt });
      setSolution(res.data.solution);
    } catch {
      setSolution('Error solving doubt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tool-container">
      <h2>Doubt Solver</h2>
      <textarea
        value={doubt}
        onChange={e => setDoubt(e.target.value)}
        placeholder="Enter your doubt..."
      />
      <button onClick={handleSolve} disabled={loading}>
        {loading ? 'Solving…' : 'Solve Doubt'}
      </button>
      {solution && (
        <div className="ai-response">
          <h3>Solution:</h3>
          <p>{solution}</p>
        </div>
      )}
    </div>
  );
}
