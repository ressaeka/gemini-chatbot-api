// Import library 
const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment 
dotenv.config();

// Inisialisasi Express
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Setup Multer untuk file upload
const upload = multer({ dest: 'uploads/' });

// Inisialisasi Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Route POST untuk generate text
app.post('/generate-text', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    res.json({ text });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Route POST untuk generate dari image        
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const filePath = req.file.path;
  const buffer = fs.readFileSync(filePath);
  const base64Data = buffer.toString('base64');
  const mimeType = req.file.mimetype;
  const prompt = req.body.prompt || 'Describe the image';

  try {
    const imagePart = {
      inlineData: { data: base64Data, mimeType }
    };

    const result = await model.generateContent([
      { text: prompt },
      imagePart
    ]);

    const response = await result.response;
    const text = await response.text();
    res.json({ output: text });
  } catch (error) {
    console.error('Error generating image content:', error);
    res.status(500).json({ error: error.message });
  } finally {
    try { fs.unlinkSync(filePath); } catch (e) {}
  }
});

// route untuk mengupload dokumen file (pdf, txt, doc, docx)
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No document file uploaded' });
  }
  const filePath = req.file.path;
  const buffer = fs.readFileSync(filePath);
  const base64Data = buffer.toString('base64');
  const mimeType = req.file.mimetype;

  const allowedMimeTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  ];

  if (!allowedMimeTypes.includes(mimeType)) {
    try { fs.unlinkSync(filePath); } catch (e) {}
    return res.status(400).json({
      error: `MIME type '${mimeType}' tidak didukung. Hanya PDF, TXT, DOC, dan DOCX yang diterima.`,
    });
  }

  try {
    const documentPart = {
      inlineData: { data: base64Data, mimeType }
    };

    const result = await model.generateContent([
      { text: 'Analisis dokumen ini:' },
      documentPart
    ]);

    const response = await result.response;
    res.json({ output: await response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    try { fs.unlinkSync(filePath); } catch (e) {}
  }
});

//route untuk mengupload file audio
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }
  const filePath = req.file.path;
  const audioBuffer = fs.readFileSync(filePath);
  const base64Audio = audioBuffer.toString('base64');
  const mimeType = req.file.mimetype;

  const audioPart = {
    inlineData: {
      data: base64Audio,
      mimeType
    }
  };

  try {
    const result = await model.generateContent([
      { text: 'Transkripsikan atau analisis audio berikut:' },
      audioPart
    ]);

    const response = await result.response;
    const text = await response.text();
    res.json({ output: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    try { fs.unlinkSync(filePath); } catch (e) {}
  }
});
