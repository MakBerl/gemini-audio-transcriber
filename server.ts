import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Gemini transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const { base64Audio, mimeType } = req.body;

    if (!base64Audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please verify GEMINI_API_KEY.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/mp3',
        data: base64Audio,
      },
    };

    const promptText = `Please provide a high-quality transcription of the audio provided.
1. Identify different speakers if possible (e.g., Speaker 1, Speaker 2).
2. Ignore filler words like "um", "uh" unless they add meaning to the hesitation.
3. Format the text cleanly with proper punctuation and paragraph breaks.`;

    let responseText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            audioPart,
            { text: promptText },
          ],
        },
      });
      responseText = response.text || '';
    } catch (modelError: any) {
      console.warn('gemini-3.6-flash transcription error:', modelError?.message);
      throw modelError;
    }

    if (!responseText) {
      responseText = 'The model did not return any text. The audio might be silent or unrecognizable.';
    }

    return res.json({ text: responseText });
  } catch (error: any) {
    console.error('Server transcription error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to transcribe audio. Please ensure the file is a valid audio format and try again.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
