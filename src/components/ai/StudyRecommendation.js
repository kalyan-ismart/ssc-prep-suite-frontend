import React, { useState } from 'react';
import axios from 'axios';

export default function StudyRecommendation() {
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
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Study Recommendation</h2>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Enter your study goals or challenges"
        rows={6}
        style={{ width: '100%', padding: '1em', fontSize: '1rem' }}
      />
      <button onClick={handleGetRecommendations} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Fetching…' : 'Get Recommendations'}
      </button>
      {recommendations && (
        <div style={{ marginTop: '1rem', background: '#d1e7dd', padding: '1rem', whiteSpace: 'pre-wrap' }}>
          <h3>Recommendations:</h3>
          <p>{recommendations}</p>
        </div>
      )}
    </div>
  );
}
