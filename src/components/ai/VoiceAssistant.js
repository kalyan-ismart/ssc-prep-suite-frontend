// src/components/ai/VoiceAssistant.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  let recognition;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
    };
    recognition.onend = () => setListening(false);
  }, []);

  const handleListen = () => {
    if (!recognition) return;
    setListening(true);
    setTranscript('');
    recognition.start();
  };

  const handleSend = async () => {
    if (!transcript) return;
    setLoading(true);
    try {
      const res = await axios.post('/ai/voice-assistant', { transcript });
      setResponse(res.data.reply);
    } catch {
      setResponse('Error processing voice message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-tool-container">
      <h2>Voice Assistant</h2>
      <button onClick={handleListen} disabled={listening}>
        {listening ? 'Listening…' : 'Start Listening'}
      </button>
      {transcript && (
        <>
          <p><strong>You said:</strong> {transcript}</p>
          <button onClick={handleSend} disabled={loading}>
            {loading ? 'Processing…' : 'Send to AI'}
          </button>
        </>
      )}
      {response && (
        <div className="ai-response">
          <h3>Assistant:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
