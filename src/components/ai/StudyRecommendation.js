import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiService';

export default function StudyRecommendation() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetRecommendations = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setRecommendations('');
    try {
      const res = await api.post('/ai/study-recommendation', { input });
      if (res.data && res.data.success) {
        setRecommendations(res.data.data.recommendations);
      } else {
        setError('Unexpected response from AI.');
      }
    } catch (err) {
      console.error('Error calling AI study-recommendation:', err);
      setError('Error fetching recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Study Recommendation</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your topic or challenge"
      />
      <button onClick={handleGetRecommendations} disabled={loading}>
        {loading ? 'Fetching...' : 'Get Recommendations'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {recommendations && (
        <ul>
          {recommendations.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
