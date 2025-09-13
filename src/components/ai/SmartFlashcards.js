import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiService';

export default function SmartFlashcards() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setFlashcards('');
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
    <div>
      <h2>Smart Flashcards</h2>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic"
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Flashcards'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {flashcards && (
        <ul>
          {flashcards.map((card, idx) => (
            <li key={idx}>{card}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
