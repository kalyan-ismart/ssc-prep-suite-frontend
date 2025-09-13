import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiService';

export default function PerformancePredictor() {
  const navigate = useNavigate();
  const [details, setDetails] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    if (!details.trim()) return;
    setLoading(true);
    setError('');
    setPrediction('');
    try {
      const res = await api.post('/ai/performance-predictor', { details });
      if (res.data && res.data.success) {
        setPrediction(res.data.data.prediction);
      } else {
        setError('Unexpected response from AI.');
      }
    } catch (err) {
      console.error('Error calling AI performance-predictor:', err);
      setError('Error making prediction.');
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
      {error && (
        <div style={{ marginTop: 24, background: '#fee2e2', color: '#b91c1c', padding: 16, borderRadius: 8 }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
