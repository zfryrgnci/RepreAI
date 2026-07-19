<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div><div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Architecture-AI_First-purple.svg?style=for-the-badge" alt="Architecture" />

  <h1>💬 ReproAI</h1>
  <p><em>Elite B2B Customer Reputation SaaS</em></p>
</div>

---

## 🚀 Overview

**ReproAI** is an advanced AI assistant tailored for B2B client reputation management. By integrating with `gemini-3.5-flash`, it analyzes incoming customer reviews to extract deep sentiment metrics, pinpoint actionable insights, and automatically draft culturally-aware, tonally-perfect responses in multiple languages.

## ✨ Key Features
- 🧠 **Sentiment & Insight Engine**: Classifies reviews and extracts core pain points instantly.
- 🎨 **Adaptive Multilingual Output**: Generates flawless responses natively in the selected target language and tone.
- ⚡ **Premium Dashboard**: Built with a sleek, dark-mode-first aesthetic using Tailwind v4.

## 🛠 Tech Stack
- **Frontend**: React 19, TailwindCSS v4, Vite, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript.
- **AI Core**: `@google/genai` (Gemini API) enforcing rigorous JSON structure.

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v24+)
- A Free [Google Gemini API Key](https://aistudio.google.com/)

### 2. Setup
Clone the repo and configure the environment:
```bash
git clone https://github.com/zfryrgnci/ReproAI.git
cd ReproAI
npm install
```

Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_free_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

## 🧪 Testing Suite
Guaranteed reliability via `Vitest` testing infrastructure:
```bash
npm run test
```

## 🤝 Open Source
Created by [Zafer Yorganci](https://github.com/zfryrgnci). Revolutionizing B2B communication!
