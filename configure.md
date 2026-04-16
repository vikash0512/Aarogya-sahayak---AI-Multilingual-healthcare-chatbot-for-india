# 🏥 Arogya Sahayak — Complete Setup & Configuration Guide

> A step-by-step guide to set up, configure, and run the Arogya Sahayak AI Healthcare Chatbot platform.

---

## 📋 Prerequisites

| Requirement | Minimum Version | Check Command |
|---|---|---|
| Python | 3.9+ | `python3 --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Any | `git --version` |

---

## 🚀 Step 1: Initial Setup

### 1.1 Clone / Navigate to the Project

```bash
cd /path/to/arogya-sahayak
```

### 1.2 Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (if not already created)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate         # macOS/Linux
# venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Also install the new Google GenAI SDK
pip install google-genai
```

### 1.3 Database Setup

```bash
# Create all database tables
python manage.py migrate

# Create admin superuser
python manage.py createsuperuser
# Enter: username, email, password when prompted
```

> **Default Admin Credentials** (if already created):
> - Email: `admin@arogyasahayak.in`
> - Password: `admin123`

### 1.4 Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install Node.js dependencies
npm install
```

---

## 🔑 Step 2: Get Your Google Gemini API Key

### 2.1 Create a Gemini API Key

1. Go to **[Google AI Studio](https://aistudio.google.com/apikey)**
2. Click **"Create API Key"**
3. Select or create a Google Cloud project
4. Copy the generated API key (starts with `AIza...`)

> ⚠️ **Important**: Use the key from **Google AI Studio** (aistudio.google.com), NOT from Google Cloud Console's Vertex AI. The AI Studio keys work directly with the Gemini API.

### 2.2 Verify Your API Key Works

You can test your key with this quick curl command:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}'
```

If you get a JSON response with generated text, your key works! ✅

---

## ⚙️ Step 3: Configure the Platform

### 3.1 Start Both Servers

Open **two terminal windows**:

**Terminal 1 — Backend (Django):**
```bash
cd backend
source venv/bin/activate
python manage.py runserver 8000
```

**Terminal 2 — Frontend (React):**
```bash
cd frontend
npm run dev
```

The platform will be available at: **http://localhost:3000**

### 3.2 Login as Admin

1. Open **http://localhost:3000/login** in your browser
2. Click **"Admin Portal"** button (uses default admin credentials)
3. Or enter your email and password if you created a custom superuser

### 3.3 Configure the LLM (AI Model)

1. Navigate to **Admin Panel → LLM Configuration** (sidebar menu)
2. Select **Google Gemini** as the provider
3. In the **API Key** field, paste your Gemini API key from Step 2
4. Select a model:
   - `gemini-2.5-flash` — Latest, fastest (recommended)
   - `gemini-2.5-pro` — Most capable, best quality
   - `gemini-2.0-flash-lite` — Lightweight and fast
5. Set **Temperature**: `0.3` (recommended for medical — more precise)
6. Set **Max Tokens**: `2048`
7. The **System Prompt** is pre-configured for medical use. You can customize it.
8. Click **"Save Configuration"** ✅

### 3.4 Configure Vector Database (Optional)

The platform uses **ChromaDB** by default (local, no setup needed). To change settings:

1. Navigate to **Admin Panel → Vector Database**
2. Default settings work out of the box:
   - **Provider**: ChromaDB (Local)
   - **Dimensions**: 384 (matches default embedding model)
   - **Distance Metric**: Cosine Similarity
   - **Top-K**: 5 (number of chunks retrieved per query)
   - **Similarity Threshold**: 0.75 (minimum relevance score)
3. Click **"Save Configuration"** if you make changes

### 3.5 Configure Safety Guardrails (Optional)

1. Navigate to **Admin Panel → Safety Guardrails**
2. Review and toggle:
   - **Block Self-Diagnosis** — Prevents AI from giving definitive diagnoses
   - **Block Self-Prescription** — Prevents AI from recommending medications
   - **PII Redaction** — Auto-removes phone numbers, Aadhaar, emails
   - **Toxicity Filter** — Blocks harmful language
3. Customize **Emergency Keywords** (comma-separated):
   ```
   suicide, heart attack, stroke, chest pain, bleeding heavily, unconscious, poison
   ```
4. Customize the **Emergency Response** message
5. Click **"Save Guardrails"**

---

## 📄 Step 4: Upload Your Medical Dataset

This is the most important step — the AI uses your dataset as the knowledge base for answering health queries.

### 4.1 Prepare Your Dataset

Supported file formats:

| Format | Best For |
|---|---|
| **PDF** | Medical textbooks, clinical guidelines, research papers |
| **TXT** | Plain text medical FAQ, notes |
| **JSON** | Structured medical databases, Q&A pairs |
| **DOCX** | Documents, reports |
| **CSV** | Tabular medical data |

### 4.2 Upload via Admin Panel

1. Navigate to **Admin Panel → Ingest New Records**
2. Configure ingestion settings:
   - **Source Language**: English (or Hindi, Bengali, Tamil)
   - **Source Authority**: Verified (High Trust)
   - **Chunk Size**: `512` (recommended) — controls how text is split
3. Click the **upload area** or **"Browse Files"** button
4. Select your dataset file(s)
5. The system will automatically:
   - Upload the file
   - Extract text content
   - Split into chunks (using RecursiveCharacterTextSplitter)
   - Generate vector embeddings (using all-MiniLM-L6-v2)
   - Store in ChromaDB vector database
6. Watch the **Processing Status** panel on the right for progress

### 4.3 Verify Ingestion

1. Navigate to **Admin Panel → Knowledge Base Manager**
2. You should see your documents listed with status **"Indexed"** ✅
3. Check the **Chunks** column to see how many chunks were created

> **Pro Tip**: For best results with a large dataset, upload files one at a time and use a chunk size between 256–1024 characters.

---

## 💬 Step 5: Test the Chat

1. Navigate to **Chat** in the main sidebar
2. Type a health-related query, for example:
   - "What are the symptoms of dengue fever?"
   - "How to manage high blood pressure?"
   - "What should I eat during pregnancy?"
3. The AI will:
   - Search your knowledge base for relevant information
   - Use the Gemini model to generate a response
   - Show a **"Verified from Knowledge Base"** badge if data was found
   - Append a medical disclaimer
4. Try different languages using the **language selector** (EN, HI, BN, TA, TE, MR)
5. Use **voice input** by clicking the microphone button

---

## 🔍 Troubleshooting

### "I'm sorry, the AI service is not configured yet"
- **Cause**: No API key set
- **Fix**: Go to Admin → LLM Configuration → enter your Gemini API key

### "Error: 400 API key not valid"
- **Cause**: Invalid or expired API key
- **Fix**: Generate a new key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### "Error: 403 Forbidden"
- **Cause**: API key doesn't have Gemini API enabled
- **Fix**: Ensure you're using an AI Studio key, not a Cloud Console key. Or enable the "Generative Language API" in your Google Cloud project

### "Error: Model not found"
- **Cause**: Wrong model name
- **Fix**: Use one of: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash-lite`

### Chat responses don't use my uploaded data
- **Cause**: Documents not indexed, or similarity threshold too high
- **Fix**: 
  1. Check Admin → Knowledge Base — status should be "Indexed"
  2. Try lowering similarity threshold to `0.5` in Admin → Vector Database
  3. Ensure your query is related to the uploaded data

### Backend won't start
```bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate
python manage.py runserver 8000

# If migration errors occur:
python manage.py makemigrations
python manage.py migrate
```

### Frontend won't start
```bash
cd frontend
npm install     # Re-install if needed
npm run dev     # Start dev server
```

### CORS errors in browser console
- The backend has CORS enabled by default (`CORS_ALLOW_ALL_ORIGINS = True`)
- The Vite dev server proxies `/api` calls to Django on port 8000
- Make sure Django is running on port **8000**

---

## 🏗️ Project Structure

```
arogya-sahayak/
├── backend/                     # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                     # Environment variables
│   ├── arogya/                  # Django project config
│   │   └── settings.py
│   ├── core/                    # Auth & User management
│   ├── config/                  # LLM, Vector DB, Settings, Guardrails
│   ├── knowledge/               # Document upload & RAG processing
│   ├── chat/                    # Chat API & RAG pipeline
│   ├── audit/                   # Audit logs & dashboard stats
│   ├── db.sqlite3               # SQLite database
│   ├── chroma_db/               # ChromaDB vector storage
│   └── media/documents/         # Uploaded files
│
└── frontend/                    # React + Vite + Tailwind
    ├── src/
    │   ├── api.ts               # API client (JWT + all endpoints)
    │   ├── pages/               # All pages (Chat, Admin panels)
    │   └── components/          # Layout components
    └── vite.config.ts           # Dev server + API proxy
```

---

## 🔒 Security Notes

- **API keys** are stored encrypted in SQLite and masked in API responses
- **PII redaction** automatically strips phone numbers, Aadhaar numbers, and emails
- **JWT authentication** with 1-day access tokens and 7-day refresh tokens
- **Emergency detection** overrides normal responses for life-threatening queries
- **Medical disclaimers** are automatically appended to all AI responses

---

## 🎯 Recommended Configuration for Production

| Setting | Value | Reason |
|---|---|---|
| Temperature | 0.2–0.4 | Lower = more factual, crucial for medical |
| Max Tokens | 2048 | Sufficient for detailed medical responses |
| Chunk Size | 512 | Good balance of context and precision |
| Top-K | 5 | Retrieves 5 most relevant chunks |
| Similarity Threshold | 0.6 | Broader retrieval, less likely to miss info |
| Model | gemini-2.5-flash | Best balance of speed and quality |

---

## 📞 Quick Reference — API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/login/` | POST | Login (email + password) |
| `/api/auth/signup/` | POST | Register new user |
| `/api/chat/` | POST | Send chat message |
| `/api/admin/llm-config/` | GET/PUT | LLM settings |
| `/api/admin/vector-config/` | GET/PUT | Vector DB settings |
| `/api/admin/guardrails/` | GET/PUT | Safety rules |
| `/api/admin/settings/` | GET/PUT | Platform settings |
| `/api/admin/documents/upload/` | POST | Upload dataset file |
| `/api/admin/documents/{id}/process/` | POST | Process & index file |
| `/api/admin/documents/` | GET | List all documents |
| `/api/admin/dashboard/stats/` | GET | Dashboard metrics |
| `/api/admin/audit-logs/` | GET | System logs |
| `/api/users/` | GET | List users |
