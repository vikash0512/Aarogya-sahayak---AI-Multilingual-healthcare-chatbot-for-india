# Aarogya Sahayak

AI-powered multilingual healthcare assistant for India.

This repository contains a React frontend and a Django backend for chat, medical knowledge ingestion, user management, profile settings, and production deployment on EC2 with Nginx, Gunicorn, and Supabase.

## What this project does

- Answers healthcare questions with a retrieval-augmented generation workflow.
- Supports admin ingestion of medical documents into vector search.
- Shows nearby healthcare locations through Google Maps integration.
- Uses Supabase for auth, storage, and database services.
- Includes profile photo upload, dashboard messaging, and admin dashboards.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Django, Django REST Framework
- Database: Supabase PostgreSQL with pgvector
- Auth and storage: Supabase
- Deployment: EC2, Nginx, Gunicorn, systemd

## Repository Layout

- [backend/](backend)
- [frontend/](frontend)
- [aws.md](aws.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)

## Requirements

- Node.js 20+
- Python 3.10+
- Supabase project with auth, storage, and PostgreSQL enabled
- A Google Maps API key
- Optional: Twilio account for WhatsApp integration

## Environment Variables

Backend `.env`:

```dotenv
SECRET_KEY=your-secret
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_PROFILE_BUCKET=profile photo

DATABASE_URL=your-postgres-url
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

Frontend `.env.local`:

```dotenv
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_SUPABASE_PROFILE_BUCKET=profile photo
```

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the app at `http://localhost:3000`.

## Common Commands

### Backend

```bash
cd backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py runserver
python manage.py process_document_jobs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
```

## How to Use the App

### 1. Sign up and log in

Create an account from the login or signup screens. The backend uses Supabase auth and syncs the user profile into Django.

### 2. Ask medical questions

Use the chat interface to ask health-related questions. The response is grounded in the ingested medical dataset.

### 3. Upload profile photo

Go to Settings, select an image, and upload it. The backend stores the file in the Supabase storage bucket configured in `SUPABASE_PROFILE_BUCKET`.

### 4. Manage documents

Admins can open the Knowledge Manager or Ingestion screen to upload documents, monitor progress, and re-index or delete records.

### 5. Review users and settings

Admins can manage users, LLM settings, Supabase settings, guardrails, and dashboard options from the admin panel.

## Deployment Guide Summary

The production setup runs on EC2 with:

- Nginx serving the frontend and reverse proxying `/api`
- Gunicorn serving Django
- A background worker for document ingestion
- Supabase for auth, storage, and vectors

Key deployment commands:

```bash
cd /home/ubuntu/arogya-app
git pull

cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

cd ../frontend
npm install
npm run build

sudo systemctl restart arogya-gunicorn
sudo systemctl restart arogya-ingestion-worker
sudo systemctl restart nginx
```

## Troubleshooting

- If profile upload fails, verify `SUPABASE_PROFILE_BUCKET` matches the exact bucket ID in Supabase.
- If ingestion is stuck, restart `arogya-ingestion-worker` and check the document status in the admin panel.
- If frontend changes do not appear, rebuild `frontend` and restart Nginx.
- If auth loops happen, clear browser storage and sign in again.

## Notes

- Secrets should stay in `.env` files and never be committed.
- `aws.md` contains the detailed EC2 runbook used during deployment.
- `DEPLOYMENT.md` and `API_Setup_Guide.md` are legacy reference notes.

## Deployment Ready

This project is set up for deployment on EC2 with the current production flow already validated and pushed.
