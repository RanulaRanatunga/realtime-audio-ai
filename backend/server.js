// design & develop by Ranula

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { processAudioWithWhisper, analyzeText } = require('./services/openaiService');
const { generateTTS } = require('./services/ttsService');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected for real-time audio streaming');
    let audioBuffer = [];

    ws.on('message', async (message) => {
        if (typeof message === 'string' && message === 'PROCESS_AUDIO') {
            try {
                console.log('Processing audio chunk...');
                const tempFilePath = path.join(__dirname, 'tmp', `audio_${Date.now()}.webm`);
                
                const completeBuffer = Buffer.concat(audioBuffer);
                fs.writeFileSync(tempFilePath, completeBuffer);
                
                const transcript = await processAudioWithWhisper(tempFilePath);
                ws.send(JSON.stringify({ type: 'TRANSCRIPT', payload: transcript }));

                const nlpResults = await analyzeText(transcript);
                ws.send(JSON.stringify({ type: 'NLP_RESULTS', payload: nlpResults }));

                const responseText = `You said: ${transcript}. The sentiment is ${nlpResults.sentiment}.`;
                const audioResponsePath = await generateTTS(responseText);
                
                const responseAudio = fs.readFileSync(audioResponsePath);
                ws.send(responseAudio);

                fs.unlinkSync(tempFilePath);
                fs.unlinkSync(audioResponsePath);
                audioBuffer = [];

            } catch (error) {
                console.error('Error processing audio pipeline:', error);
                ws.send(JSON.stringify({ type: 'ERROR', payload: error.message }));
            }
        } else {
            audioBuffer.push(message);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`WebSocket Server listening on port ${PORT}`);
});