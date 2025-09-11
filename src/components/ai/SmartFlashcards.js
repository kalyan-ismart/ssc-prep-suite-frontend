// src/components/ai/SmartFlashcards.js
import React, { useState } from 'react';
import axios from 'axios';

export default function SmartFlashcards() {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/smart-flashcards', { topic });
      setCards(res.data.cards);
    } catch {
      setCards([{ question: 'Error generating flashcards.', answer: '' }]);
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
        onChange={e => setTopic(e.target.value)}
        placeholder="Enter topic for flashcards..."
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating…' : 'Generate Flashcards'}
      </button>
      {cards.length > 0 && (
        <div className="ai-response">
          <h3>Flashcards:</h3>
          {cards.map((c, i) => (
            <div key={i} className="flashcard">
              <strong>Q:</strong> {c.question}
              <br />
              <strong>A:</strong> {c.answer}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
