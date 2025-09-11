import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const [voiceInput, setVoiceInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Currently simple text input simulation; integrate real voice APIs if desired
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
    <div style={{ maxWidth: 600, margin: '2rem auto', whiteSpace: 'pre-wrap' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: 16 }}>← Back to Dashboard</button>
      <h2>Voice Assistant</h2>
      <input
        type="text"
        value={voiceInput}
        onChange={e => setVoiceInput(e.target.value)}
        placeholder="Type voice input here (simulate)"
        style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <button onClick={handleSend} disabled={loading} style={{ marginTop: 16, padding: '10px 20px' }}>
        {loading ? 'Processing…' : 'Send'}
      </button>
      {response && (
        <div style={{ marginTop: 24, background: '#dbebfa', padding: 16, borderRadius: 8 }}>
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
