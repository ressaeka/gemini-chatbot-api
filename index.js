const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post('/api/chat', upload.single('file'), async (req, res) => {
  const { prompt } = req.body;
  const file = req.file;

  if (!file && !prompt) {
    return res.status(400).json({ error: 'No input provided' });
  }

  if (!file) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return res.json({ output: await response.text() });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

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
    const response = result.response;
    res.json({ output: await response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    try { fs.unlinkSync(filePath); } catch {}
  }
});
