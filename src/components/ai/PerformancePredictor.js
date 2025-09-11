import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PerformancePredictor() {
  const navigate = useNavigate();
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
      <button onClick={() => navigate('/')} style={{ marginBottom: 16 }}>← Back to Dashboard</button>
      <h2>Performance Predictor</h2>
      <textarea
        rows={6}
        value={details}
        onChange={e => setDetails(e.target.value)}
        placeholder="Enter your study details..."
        style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <button onClick={handlePredict} disabled={loading} style={{ marginTop: 16, padding: '10px 20px' }}>
        {loading ? 'Predicting…' : 'Predict Performance'}
      </button>
      {prediction && (
        <div style={{ marginTop: 24, background: '#ede9fe', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
          <h3>Prediction:</h3>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}
