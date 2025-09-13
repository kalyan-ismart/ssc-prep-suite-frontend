import React, { useState } from 'react';
import api from '../../apiService';

export default function SmartFlashcards() {
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setFlashcards([]);
    try {
      const res = await api.post('/ai/smart-flashcards', { topic });
      if (res.data && res.data.success) {
        setFlashcards(res.data.data.flashcards);
      } else {
        setError('Unexpected response from AI.');
      }
    } catch (err) {
      console.error('Error calling AI smart-flashcards:', err);
      setError('Error generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tool-container">
      <h2>Smart Flashcards</h2>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic"
        disabled={loading}
        className="input-box"
      />
      <button onClick={handleGenerate} disabled={loading || !topic.trim()}>
        {loading ? 'Generating...' : 'Generate Flashcards'}
      </button>
      {error && <p className="error-text">{error}</p>}
      {flashcards.length > 0 && (
        <ul className="output-list">
          {flashcards.map((card, index) => (
            <li key={index}>{card}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
