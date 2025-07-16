const express = require('express');           // Framework web server
const dotenv = require('dotenv');             // Untuk load variabel lingkungan (.env)
const multer = require('multer');             // Untuk handle upload file
const fs = require('fs');                     // Untuk operasi file (baca, hapus)
const cors = require('cors');                 // Agar API bisa diakses dari frontend
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Library Gemini

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));            // Serve file statis (frontend)

const upload = multer({ dest: 'uploads/' });  // Konfigurasi upload file ke folder uploads

// Inisialisasi Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Endpoint utama untuk generate chat
app.post('/generate', upload.single('file'), async (req, res) => {
  const { prompt } = req.body;
  const file = req.file;

  // Jika tidak ada input sama sekali
  if (!file && !prompt) {
    return res.status(400).json({ error: 'No input provided' });
  }

  // Jika hanya prompt (teks saja)
  if (!file) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return res.json({ output: await response.text() });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Jika ada file yang diupload
  const filePath = file.path;
  const buffer = fs.readFileSync(filePath);           // Baca file
  const base64Data = buffer.toString('base64');       // Ubah ke base64
  const mimeType = file.mimetype;                     // Ambil tipe file

  // Daftar tipe file yang didukung
  const allowedMimeTypes = [
    'image/png', 'image/jpeg', 'image/jpg',
    'application/pdf', 'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg', 'audio/mp3', 'audio/wav',
    'audio/webm', 'audio/ogg',
    'video/mp4', 'video/webm', 'video/ogg'
  ];

  // Jika tipe file tidak didukung
  if (!allowedMimeTypes.includes(mimeType)) {
    try { fs.unlinkSync(filePath); } catch {}
    return res.status(400).json({ error: `Unsupported file type: ${mimeType}` });
  }

  try {
    // Siapkan data untuk Gemini (prompt + file)
    const filePart = { inlineData: { data: base64Data, mimeType } };
    const parts = prompt ? [{ text: prompt }, filePart] : [filePart];

    // Kirim ke Gemini dan ambil hasilnya
    const result = await model.generateContent(parts);
    const response = await result.response;
    res.json({ output: await response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    // Hapus file upload dari server setelah diproses
    try { fs.unlinkSync(filePath); } catch {}
  }
});