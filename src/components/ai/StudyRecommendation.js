// src/components/ai/StudyRecommendation.js
import React, { useState } from 'react';
import axios from 'axios';

export default function StudyRecommendation() {
  const [profile, setProfile] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/study-recommendation', { profile });
      setRecommendations(res.data.recommendations);
    } catch {
      setRecommendations(['Error getting recommendations.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tool-container">
      <h2>Study Recommendation</h2>
      <textarea
        value={profile}
        onChange={e => setProfile(e.target.value)}
        placeholder="Enter your study profile..."
      />
      <button onClick={handleRecommend} disabled={loading}>
        {loading ? 'Generating…' : 'Get Recommendations'}
      </button>
      {recommendations.length > 0 && (
        <div className="ai-response">
          <h3>Recommendations:</h3>
          <ul>
            {recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
