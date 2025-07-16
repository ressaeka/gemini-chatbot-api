# 🤖 Gemini Chatbot (Node.js + Express)

**Gemini Chatbot** is a simple web application built with **Node.js + Express**, integrated with **Google Generative AI (Gemini API)**. This app allows users to send prompts **with files** such as **text, images, audio, video, or documents**, and get intelligent responses directly on a clean, interactive web interface.

![Preview](Assets/Implementasi.png)



## 🚀 Technologies Used

- **Node.js + Express** (backend)
- **Google Generative AI API (Gemini)**
- **Multer** – for uploading various file types
- **Dotenv** – for managing environment variables (API key)
- **HTML, CSS, JavaScript** – frontend structure
- **CORS, JSON Parser, URL Encoded Parser** – middleware


## ⚙️ Key Features

- ✅ Send text and receive AI response  
- ✅ Upload and analyze images (JPG, PNG)  
- ✅ Upload and transcribe/analyze audio (MP3, WAV, OGG)  
- ✅ Upload documents (PDF, DOCX, TXT)  
- ✅ Upload videos (MP4, WebM, OGG)  
- ✅ Real-time chatbot response bubbles  
- ✅ File name preview before sending  



## 📁 Project Structure

| File/Folder         | Description                                                              |
|---------------------|---------------------------------------------------------------------------|
| `index.js`          | Main server file (Express backend + Gemini routes)                       |
| `.env`              | Stores Google API Key securely                                            |
| `public/`           | Contains static frontend files: HTML, CSS, JS                            |
| `uploads/`          | Temporary storage for uploaded files (auto-deleted after processed)      |
| `package.json`      | Project config and dependency list                                       |
| `public/script.js`  | Client-side script for handling input and UI interactions                |
| `public/style.css`  | Styling for the chatbot interface                                         |



## 🛠️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourname/gemini-chatbot.git
   cd gemini-chatbot





