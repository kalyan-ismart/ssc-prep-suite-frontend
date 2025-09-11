import React, { useState } from 'react';
import axios from 'axios';

export default function SmartFlashcards() {
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
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Smart Flashcards</h2>
      <input
        type="text"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="Enter topic"
        style={{ width: '100%', padding: '0.75em', fontSize: '1rem' }}
      />
      <button onClick={handleGenerate} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Generating…' : 'Generate Flashcards'}
      </button>
      {flashcards && (
        <pre style={{ marginTop: '1rem', background: '#efe8ff', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
          {flashcards}
        </pre>
      )}
    </div>
  );
}
