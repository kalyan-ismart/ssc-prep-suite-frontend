import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiService';

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const [voiceInput, setVoiceInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Placeholder for real speech-to-text integration

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
    <div>
      <h2>Voice Assistant</h2>
      <textarea
        value={voiceInput}
        onChange={(e) => setVoiceInput(e.target.value)}
        placeholder="Speak or type here"
        rows={4}
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Processing...' : 'Send'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && <div className="response-box">{response}</div>}
    </div>
  );
}
