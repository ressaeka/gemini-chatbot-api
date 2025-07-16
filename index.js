const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Upload handler
const upload = multer({ dest: 'uploads/' });

// Gemini API setup
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY belum diset di environment variable!');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

// Optional: Handle root route /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint untuk generate chat
app.post('/generate', upload.single('file'), async (req, res) => {
  const { prompt } = req.body;
  const file = req.file;

  if (!file && !prompt) {
    return res.status(400).json({ error: 'No input provided' });
  }

  // Jika hanya prompt (tanpa file)
  if (!file) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return res.json({ output: await response.text() });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Jika ada file, proses file
  const filePath = file.path;
  const buffer = fs.readFileSync(filePath);
  const base64Data = buffer.toString('base64');
  const mimeType = file.mimetype;

  const allowedMimeTypes = [
    'image/png', 'image/jpeg', 'image/jpg',
    'application/pdf', 'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg', 'audio/mp3', 'audio/wav',
    'audio/webm', 'audio/ogg',
    'video/mp4', 'video/webm', 'video/ogg'
  ];

  if (!allowedMimeTypes.includes(mimeType)) {
    try { fs.unlinkSync(filePath); } catch {}
    return res.status(400).json({ error: `Unsupported file type: ${mimeType}` });
  }

  try {
    const filePart = { inlineData: { data: base64Data, mimeType } };
    const parts = prompt ? [{ text: prompt }, filePart] : [filePart];

    const result = await model.generateContent(parts);
    const response = await result.response;
    res.json({ output: await response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    try { fs.unlinkSync(filePath); } catch {}
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
