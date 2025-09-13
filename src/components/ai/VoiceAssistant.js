import React, { useState } from 'react';
import api from '../apiService';

export default function VoiceAssistant() {
  const [voiceInput, setVoiceInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Placeholder for real speech input integration

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
    <div className="ai-tool-container">
      <h2>Voice Assistant</h2>
      <textarea
        rows={4}
        value={voiceInput}
        onChange={(e) => setVoiceInput(e.target.value)}
        placeholder="Speak or type here"
        disabled={loading}
        className="input-box"
      />
      <button onClick={handleSend} disabled={loading || !voiceInput.trim()}>
        {loading ? 'Processing...' : 'Send'}
      </button>
      {error && <p className="error-text">{error}</p>}
      {response && (
        <div className="output-box">
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
