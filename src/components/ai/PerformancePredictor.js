// src/components/ai/PerformancePredictor.js
import React, { useState } from 'react';
import axios from 'axios';

export default function PerformancePredictor() {
  const [data, setData] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/performance-predictor', { data });
      setPrediction(res.data.prediction);
    } catch {
      setPrediction('Error predicting performance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tool-container">
      <h2>Performance Predictor</h2>
      <textarea
        value={data}
        onChange={e => setData(e.target.value)}
        placeholder="Enter your past scores/data..."
      />
      <button onClick={handlePredict} disabled={loading}>
        {loading ? 'Predicting…' : 'Predict Performance'}
      </button>
      {prediction && (
        <div className="ai-response">
          <h3>Predicted Score:</h3>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}
