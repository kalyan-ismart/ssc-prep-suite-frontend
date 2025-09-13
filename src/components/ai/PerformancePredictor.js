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
    <div>
      <h2>Performance Predictor</h2>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Provide your details"
        rows={5}
      />
      <button onClick={handlePredict} disabled={loading}>
        {loading ? 'Predicting...' : 'Get Prediction'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {prediction && <div className="prediction-box">{prediction}</div>}
    </div>
  );
}
