// GANTI DENGAN URL RAILWAY PUNYA LO
const API_URL = 'https://your-project.up.railway.app'; 

// Ambil elemen-elemen DOM yang diperlukan
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const chatBox = document.getElementById('chat-box');

// Saat tombol upload diklik, buka file picker
uploadBtn.addEventListener('click', () => fileInput.click());

// Event saat form dikirim (user submit chat)
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Mencegah reload halaman

  const prompt = input.value.trim(); // Ambil input user
  const file = fileInput.files[0];   // Ambil file jika ada
  if (!prompt && !file) return;      // Jika kosong, tidak lanjut

  // Tampilkan pesan user di chat
  let userMessage = prompt;
  if (file) userMessage += `\n📎 ${file.name}`;
  appendMessage('user', userMessage);

  input.value = '';
  fileInput.value = '';

  // Tampilkan pesan loading dari bot
  const loadingMsg = appendMessage('bot', 'Gemini is thinking...');

  try {
    let res;
    if (file) {
      // Jika ada file, kirim sebagai FormData (multipart)
      const formData = new FormData();
      formData.append('file', file);
      if (prompt) formData.append('prompt', prompt);

      res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        body: formData
      });
    } else {
      // Jika hanya teks, kirim sebagai JSON
      res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
    }

    // Ambil respon dari server dan tampilkan ke chat
    const data = await res.json();
    loadingMsg.textContent = (data.output || data.text || 'Saya Tidak Mengerti.')
      .replace(/#+\s?/g, '')   // Hapus heading markdown: ###, ##, #
      .replace(/\*\*/g, '')    // Hapus bold markdown: **bold**
      .replace(/\*/g, '');     // Hapus italic: *italic*

  } catch (err) {
    // Jika gagal, tampilkan pesan error
    loadingMsg.textContent = '❌ Gagal menghubungi server.';
  }
});

// Fungsi untuk menambah pesan ke chat box
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
