import React, { useState } from 'react';
import axios from 'axios';

export default function PerformancePredictor() {
  const [details, setDetails] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!details) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/performance-predictor', { details });
      setPrediction(res.data.data.prediction);
    } catch {
      setPrediction('Error making prediction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Performance Predictor</h2>
      <textarea
        value={details}
        onChange={e => setDetails(e.target.value)}
        placeholder="Enter your study details or current scores"
        rows={5}
        style={{ width: '100%', padding: '1em', fontSize: '1rem' }}
      />
      <button onClick={handlePredict} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Predicting…' : 'Predict Performance'}
      </button>
      {prediction && (
        <div style={{ marginTop: '1rem', background: '#e0e7ff', padding: '1rem', whiteSpace: 'pre-wrap' }}>
          <h3>Prediction:</h3>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}
