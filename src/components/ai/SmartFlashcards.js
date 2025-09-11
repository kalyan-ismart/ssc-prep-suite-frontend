import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SmartFlashcards() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/smart-flashcards', { topic });
      setFlashcards(res.data.data.flashcards);
    } catch {
      setFlashcards('Error generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', whiteSpace: 'pre-wrap' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: 16 }}>← Back to Dashboard</button>
      <h2>Smart Flashcards</h2>
      <input
        type="text"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="Enter topic"
        style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <button onClick={handleGenerate} disabled={loading} style={{ marginTop: 16, padding: '10px 20px' }}>
        {loading ? 'Generating…' : 'Generate Flashcards'}
      </button>
      {flashcards && <pre style={{ marginTop: 24 }}>{flashcards}</pre>}
    </div>
  );
}
