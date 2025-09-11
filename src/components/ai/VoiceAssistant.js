import React, { useState } from 'react';
import axios from 'axios';

export default function VoiceAssistant() {
  const [voiceInput, setVoiceInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple text input simulation for voice input (you can add real voice APIs)
  const handleSend = async () => {
    if (!voiceInput) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/voice-assistant', { voiceInput });
      setResponse(res.data.data.response);
    } catch {
      setResponse('Error processing voice input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Voice Assistant (Text Input Simulation)</h2>
      <input
        type="text"
        value={voiceInput}
        onChange={e => setVoiceInput(e.target.value)}
        placeholder="Speak or type your query here"
        style={{ width: '100%', padding: '0.75em', fontSize: '1rem' }}
      />
      <button onClick={handleSend} disabled={loading} style={{ marginTop: '1rem' }}>
        {loading ? 'Listening…' : 'Send'}
      </button>
      {response && (
        <div style={{ marginTop: '1rem', background: '#cff4fc', padding: '1rem', whiteSpace: 'pre-wrap' }}>
          <h3>Assistant Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
