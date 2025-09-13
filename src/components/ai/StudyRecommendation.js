import React, { useState } from 'react';
import api from '../../apiService';

export default function StudyRecommendation() {
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetRecommendations = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setRecommendations([]);
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
    <div className="ai-tool-container">
      <h2>Study Recommendation</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter topic or question"
        disabled={loading}
        className="input-box"
      />
      <button onClick={handleGetRecommendations} disabled={loading || !input.trim()}>
        {loading ? 'Fetching...' : 'Get Recommendations'}
      </button>
      {error && <p className="error-text">{error}</p>}
      {recommendations.length > 0 && (
        <ul className="output-list">
          {recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
