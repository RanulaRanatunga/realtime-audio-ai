// design & develop by Ranula

import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [nlpData, setNlpData] = useState(null);
  
  const ws = useRef(null);
  const mediaRecorder = useRef(null);
  const audioContext = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');
    
    ws.current.onopen = () => console.log('Connected to WS Server');
    
    ws.current.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const audioUrl = URL.createObjectURL(event.data);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        const data = JSON.parse(event.data);
        if (data.type === 'TRANSCRIPT') {
          setTranscript(data.payload);
        } else if (data.type === 'NLP_RESULTS') {
          setNlpData(data.payload);
        }
      }
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const startRecording = async () => {
    setTranscript('');
    setNlpData(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(event.data);
        }
      };

      mediaRecorder.current.start(250);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send('PROCESS_AUDIO');
      }
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Real-Time Audio Intelligence Platform</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: isRecording ? '#ff4d4d' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isRecording ? 'Stop Recording & Process' : 'Start Recording'}
        </button>
      </div>

      {transcript && (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '20px' }}>
          <h3>Transcription (Whisper)</h3>
          <p>{transcript}</p>
        </div>
      )}

      {nlpData && (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <h3>AI Analysis (GPT-4)</h3>
          <p><strong>Sentiment:</strong> {nlpData.sentiment}</p>
          <p><strong>Summary:</strong> {nlpData.summary}</p>
          <p><strong>Entities:</strong> {nlpData.entities?.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default App;