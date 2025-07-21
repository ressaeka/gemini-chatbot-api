const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const chatBox = document.getElementById('chat-box');

uploadBtn.addEventListener('click', () => fileInput.click());

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const prompt = input.value.trim();
  const file = fileInput.files[0];
  if (!prompt && !file) return;

  let userMessage = prompt;
  if (file) userMessage += `\n📎 ${file.name}`;
  appendMessage('user', userMessage);

  input.value = '';
  fileInput.value = '';

  const loadingMsg = appendMessage('bot', 'Gemini is thinking...');

  try {
    let res;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      if (prompt) formData.append('prompt', prompt);

      res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        body: formData
      });
    } else {
      res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
    }

    const data = await res.json();
    loadingMsg.textContent = (data.output || data.text || 'Saya Tidak Mengerti.')
    .replace(/[*#`~_>\-=]+/g, '')

  } catch (err) {
    loadingMsg.textContent = 'Gagal menghubungi server.';
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
