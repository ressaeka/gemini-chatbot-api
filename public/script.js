// Ambil elemen-elemen penting dari HTML
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Event listener saat form dikirim
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Mencegah reload halaman

  const prompt = input.value.trim(); // Ambil dan bersihkan input user
  if (!prompt) return; // Jangan lanjut kalau kosong

  appendMessage('user', prompt); // Tampilkan pesan dari user ke chat
  input.value = ''; // Kosongkan input setelah dikirim

  // Tampilkan loading sementara saat menunggu jawaban dari AI
  const loadingMsg = appendMessage('bot', 'Gemini is thinking...');

  try {
    // Kirim permintaan ke backend untuk proses AI
    const res = await fetch('http://localhost:3000/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }) // Kirim input user ke backend
    });

    const data = await res.json(); // Ambil respons dari server

    // Tampilkan hasil jawaban AI dan bersihkan karakter bintang (*)
    loadingMsg.textContent = (data.output || data.text || 'Saya Tidak Mengerti.').replace(/\*/g, '');
  } catch (err) {
    // Tampilkan pesan error jika fetch gagal
    loadingMsg.textContent = 'Gagal menghubungi server.';
    console.error(err);
  }
});

// Fungsi bantu untuk menambahkan pesan ke chat box
function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`; // Tambah class message dan sender (user/bot)
  msg.textContent = text; // Isi teks
  chatBox.appendChild(msg); // Tambahkan ke chat box
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll otomatis ke bawah
  return msg;
}
