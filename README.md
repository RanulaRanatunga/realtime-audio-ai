# Real-Time Audio Intelligence Platform

An end-to-end full-stack application that captures spoken audio in real-time, transcribes it using OpenAI's Whisper model, analyzes the sentiment and context with GPT-4, and speaks back a synthesized audio response using Google Cloud Text-to-Speech.

---

## What It Does

When you speak into your microphone:
1. **Audio Streaming**: Your browser records audio in chunks and streams them in real-time to a Node.js backend over WebSockets.
2. **Speech-to-Text**: The backend passes the audio to **OpenAI Whisper** to generate an accurate transcription.
3. **Language Intelligence**: **GPT-4** extracts key details from your words:
   - Overall sentiment (Positive, Negative, Neutral)
   - Key entities and names
   - A concise 1-sentence summary
4. **Voice Synthesis**: **Google Cloud TTS** synthesizes a personalized spoken response (`"You said: ... The sentiment is ..."`), which is streamed straight back to your browser and played aloud automatically.

---

## System Architecture

```text
  [ User Microphone ]
           │
           ▼ (WebM Audio Chunks)
  [ React Frontend ]
           │
           ▼ (WebSocket - ws://localhost:8080)
  [ Node.js & Express Backend ]
     ├── 1. OpenAI Whisper  ───► Text Transcription
     ├── 2. OpenAI GPT-4    ───► Sentiment & Entity Extraction
     └── 3. Google Cloud TTS ──► Voice Audio Response (MP3)
           │
           ▼ (Binary Audio Stream + JSON Data)
  [ React Frontend ] ──► Auto-plays audio response & displays AI insights
```

---

## Project Structure

```text
realtime-audio-ai/
├── backend/
│   ├── services/
│   │   ├── openaiService.js   
│   │   └── ttsService.js      
│   ├── tmp/                  
│   ├── .env.example          
│   ├── package.json
│   └── server.js              
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js           
│   │   └── index.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **OpenAI API Key** ([platform.openai.com](https://platform.openai.com))
- **Google Cloud Service Account** with Text-to-Speech API enabled ([cloud.google.com](https://cloud.google.com/text-to-speech))

---

### 2. Configure Environment Variables

Navigate to the `backend/` directory and create your `.env` file (you can copy `.env.example`):

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your keys:

```env
PORT=8080
OPENAI_API_KEY=sk-your-openai-api-key-here
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

> **Note on Google Credentials:** Place your downloaded service account JSON key file in the `backend/` directory and ensure the filename matches `GOOGLE_APPLICATION_CREDENTIALS` (e.g., `google-credentials.json`).

---

### 3. Installation

Install dependencies for both the backend and frontend:

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

---

### 4. Running the Application

You'll need two terminal windows running side-by-side:

#### Terminal 1 — Start the Backend Server
```bash
cd backend
npm start
```
*The WebSocket server will start on `ws://localhost:8080`.*

#### Terminal 2 — Start the Frontend
```bash
cd frontend
npm start
```
*The app will automatically compile and open at `http://localhost:3000`.*

---

## How to Test It

1. Open `http://localhost:3000` in Chrome, Edge, or Firefox.
2. Grant browser microphone permissions when prompted.
3. Click **"Start Recording"** and speak clearly into your mic (e.g. *"I'm really excited about launching our new product this Friday!"*).
4. Click **"Stop Recording & Process"**.
5. Within seconds:
   - Your transcript will appear on screen.
   - The sentiment, summary, and entities detected by GPT-4 will display in the AI analysis card.
   - Your speakers will play back the synthesized voice reply from Google TTS.

---


## License

This project is licensed under the [MIT License](LICENSE).
