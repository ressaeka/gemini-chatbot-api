const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  //  Kirim ke backend /generate-text
  try {
    const res = await fetch('http://localhost:3000/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage }) // sinkron sama backend
    });

    const data = await res.json();
    appendMessage('bot', data.text || 'Jawaban kosong. Cek API Key atau kuota.'); // Jawaban Gemini beneran ditampilkan
  } catch (err) {
    appendMessage('bot', ' Error: gagal menghubungi server.');
    console.error(err);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
