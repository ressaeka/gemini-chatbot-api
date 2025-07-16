// URL Railway Backend
const API_URL = 'https://gemini-chatbot-api-production.up.railway.app';

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
  e.preventDefault();

  const prompt = input.value.trim();
  const file = fileInput.files[0];
  if (!prompt && !file) return;

  // Tampilkan pesan user
  let userMessage = prompt;
  if (file) userMessage += `\n📎 ${file.name}`;
  appendMessage('user', userMessage);

  input.value = '';
  fileInput.value = '';

  // Tampilkan pesan loading
  const loadingMsg = appendMessage('bot', '🤖 Gemini is thinking...');

  try {
    let response;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      if (prompt) formData.append('prompt', prompt);

      response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        body: formData
      });

    } else {
      response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
    }

    const data = await response.json();

    if (!response.ok) {
      loadingMsg.textContent = `❌ Server error: ${data.error || response.statusText}`;
      return;
    }

    // Tampilkan hasil Gemini
    loadingMsg.textContent = (data.output || data.text || 'Saya Tidak Mengerti.')
      .replace(/#+\s?/g, '')   // Hapus heading markdown
      .replace(/\*\*/g, '')    // Hapus bold markdown
      .replace(/\*/g, '');     // Hapus italic

  } catch (err) {
    loadingMsg.textContent = 'Gagal menghubungi server.';
    console.error(err);
  }
});

// Fungsi untuk menambahkan pesan ke chat box
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
