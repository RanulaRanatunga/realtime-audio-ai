const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function processAudioWithWhisper(filePath) {
    try {
        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1',
        });
        return response.text;
    } catch (error) {
        console.error('Whisper API Error:', error);
        throw error;
    }
}

async function analyzeText(text) {
    try {
        const prompt = `Analyze the following text. Extract the sentiment (Positive, Negative, Neutral), key entities, and provide a 1-sentence summary.\n\nText: "${text}"\n\nOutput in JSON format with keys: sentiment, entities (array), summary.`;
        
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
        });

        const resultText = response.choices[0].message.content;
        return JSON.parse(resultText);
    } catch (error) {
        console.error('NLP Analysis Error:', error);
        throw error;
    }
}

module.exports = { processAudioWithWhisper, analyzeText };