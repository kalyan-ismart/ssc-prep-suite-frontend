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
    <div style={{ maxWidth: 600, margin: '2rem auto', whiteSpace: 'pre-wrap' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: 16 }}>← Back to Dashboard</button>
      <h2>Study Recommendation</h2>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Enter input for recommendations"
        style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <button onClick={handleGetRecommendations} disabled={loading} style={{ marginTop: 16, padding: '10px 20px' }}>
        {loading ? 'Fetching…' : 'Get Recommendations'}
      </button>
      {recommendations && <pre style={{ marginTop: 24 }}>{recommendations}</pre>}
      {error && (
        <div style={{ marginTop: 24, background: '#fee2e2', color: '#b91c1c', padding: 16, borderRadius: 8 }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
