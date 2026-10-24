const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const path = require('path');

const client = new textToSpeech.TextToSpeechClient();

async function generateTTS(text) {
    const request = {
        input: { text: text },
        voice: { languageCode: 'en-US', name: 'en-US-Journey-F' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        const outputPath = path.join(__dirname, '..', 'tmp', `response_${Date.now()}.mp3`);
        
        await writeFile(outputPath, response.audioContent, 'binary');
        return outputPath;
    } catch (error) {
        console.error('Google TTS Error:', error);
        throw error;
    }
}

module.exports = { generateTTS };