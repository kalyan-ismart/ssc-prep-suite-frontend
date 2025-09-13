import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiService';

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const [voiceInput, setVoiceInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Currently simple text input simulation; integrate real voice APIs if desired
  const handleSend = async () => {
    if (!voiceInput.trim()) return;
    setLoading(true);
    setError('');
    setResponse('');
    try {
      const res = await api.post('/ai/voice-assistant', { voiceInput });
      if (res.data && res.data.success) {
        setResponse(res.data.data.response);
      } else {
        setError('Unexpected response from AI.');
      }
    } catch (err) {
      console.error('Error calling AI voice-assistant:', err);
      setError('Error processing voice input.');
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
      {error && (
        <div style={{ marginTop: 24, background: '#fee2e2', color: '#b91c1c', padding: 16, borderRadius: 8 }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
