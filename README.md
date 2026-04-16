<div align="center">
  
# 🏥 Aarogya Sahayak
### AI-Powered Multilingual Healthcare Chatbot for India

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=green)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![Google Maps API](https://img.shields.io/badge/Google%20Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)

*[Arogya Sahayak](https://github.com/vikash0512/Aarogya-sahayak---AI-Multilingual-healthcare-chatbot-for-india) is a highly accessible, production-grade diagnostic engine designed to bridge the healthcare divide in rural & urban India.*
</div>

---

## 📖 The Vision
In many parts of India, access to immediate, accurate primary healthcare information is severely limited by language barriers, internet bandwidth, and distance. **Arogya Sahayak** (Health Assistant) solves this by providing a hyper-localized, RAG-powered diagnostic AI that operates seamlessly across the Web and **WhatsApp**—meaning users can get lifesaving insights even on a 2G connection.

This project was built to demonstrate full-stack engineering proficiency, AI pipeline construction over vector databases, and real-world system architecture designed for scalable public use.

## ✨ Core Features

* 🧠 **RAG-Powered Diagnostic Engine**:
  * Utilizes **pgvector (Supabase)** and **Sentence Transformers** to securely chunk, embed, and query massive custom medical datasets.
  * Ensures that AI responses are strictly anchored in verified medical literature (Guardrails implemented to prevent AI hallucinations).
* 📱 **WhatsApp Sandbox Integration**:
  * Engineered a webhook listening architecture connecting the Twilio Sandbox / Meta Graph API directly to the Django backend. 
  * Allows offline/low-bandwidth villagers to text symptoms and receive automated diagnostics in their native language—no app download required.
* 🗺️ **Dynamic Nearby PHC Mapping**:
  * Integrated **Google Maps & Places APIs** with HTML5 Geolocation to dynamically map out nearby Primary Health Centers (PHC), Clinics, and Hospitals in real-time based on a smart 8km radius.
* 🛠️ **Administrative CMS Command Center**:
  * Included a full internal Dashboard for non-technical operators to actively monitor Chat Sessions, update Google Maps API keys dynamically, re-index Vector Documents, and swap out LLM constraints on the fly without rewriting code.

---

## 🏗️ System Architecture

### Frontend (React + Vite + Tailwind CSS)
- Fully responsive, dark-mode-enabled UI utilizing **Lucide React** for modern iconography.
- Dynamic routing via `react-router-dom` prioritizing rapid client-side hydration.
- Uses strict TypeScript rules to ensure enterprise-grade stability and zero unhandled type exceptions.

### Backend (Django + Django REST Framework)
- Stateful API management routing RAG processes safely behind `IsAuthenticated` endpoints.
- Pluggable AI backend supporting Gemini/OpenAI interfaces contextually.
- Configured connection limits via `dj_database_url` pooling to ensure concurrent scale-up without locking Postgres.

### Database Layer (Supabase Postgres)
- Uses `pgvector` to run cosine similarity queries internally on the database.
- Deep integration via `vector_store.py` transitioning from heavy local file-bloat directly into cloud-accessible matrices.

---

## 🚀 Quick Start / Development Guide

Want to run this project locally to explore the codebase? 

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# You MUST add a .env file locally containing your Supabase DATABASE_URL
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Add your VITE_GOOGLE_MAPS_API_KEY inside frontend/.env.local
npm run dev
```
*Visit `http://localhost:3000` to interact with the platform natively!*

---

## 📈 Future Road Map
* **Multilingual Expansion**: Add native whisper.cpp integration for audio-based localized translation logic (Hindi, Tamil, Marathi, etc).
* **Telehealth Bridge**: Direct push-notification or SMS relaying to an on-call physician if the AI diagnostic detects a high-severity guardrail match (`Emergency=True`).
* **Prescription OCR**: Integrate Google Cloud Vision so patients can take photos of handwritten doctor prescriptions and have the AI translate dosage timings into local languages.

---

<div align="center">
  <b>Built with ❤️ by Vikash Kumar</b> <br>
  <i>Open to Software Engineering & AI Architect Roles</i> 
</div>
