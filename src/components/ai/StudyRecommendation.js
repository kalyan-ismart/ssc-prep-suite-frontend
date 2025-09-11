import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudyRecommendation() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetRecommendations = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/study-recommendation', { input });
      setRecommendations(res.data.data.recommendations);
    } catch {
      setRecommendations('Error fetching recommendations.');
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
    </div>
  );
}
