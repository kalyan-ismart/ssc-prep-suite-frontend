import React, { useState } from 'react';
import api from '../apiService';

export default function PerformancePredictor() {
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
    <div className="ai-tool-container">
      <h2>Performance Predictor</h2>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Enter your details here..."
        rows={6}
        disabled={loading}
        className="input-box"
      />
      <button onClick={handlePredict} disabled={loading || !details.trim()}>
        {loading ? 'Predicting...' : 'Get Prediction'}
      </button>
      {error && <p className="error-text">{error}</p>}
      {prediction && (
        <div className="output-box">
          <h3>Prediction:</h3>
          <p>{prediction}</p>
        </div>
      )}
    </div>
  );
}
