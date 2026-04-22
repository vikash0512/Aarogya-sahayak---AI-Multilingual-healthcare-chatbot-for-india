<div align="center">

# 🏥 Aarogya Sahayak
### AI-Powered Multilingual Healthcare Assistant for India

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![Gunicorn](https://img.shields.io/badge/Gunicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white)

An end-to-end healthcare platform built for accessible medical guidance, document-powered retrieval, admin operations, and EC2-ready deployment.

</div>

---

## Overview

Aarogya Sahayak combines a React + Vite frontend with a Django backend to deliver multilingual healthcare assistance across web and WhatsApp-friendly workflows. It uses Supabase for authentication, storage, and PostgreSQL, while pgvector powers document retrieval from trusted medical datasets.

The project is designed to be practical, deployment-ready, and easy to operate for both technical and non-technical users.

## What It Can Do

- Answer healthcare questions through a retrieval-augmented generation flow.
- Ingest medical documents and turn them into searchable vectors.
- Show nearby healthcare locations with Google Maps integration.
- Support patient settings, profile photos, and account management.
- Provide an admin dashboard for documents, users, settings, and guardrails.
- Run cleanly on EC2 behind Nginx and Gunicorn.

## Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React icons

### Backend

- Django
- Django REST Framework
- SimpleJWT
- Supabase auth and service APIs

### Data and Search

- Supabase PostgreSQL
- pgvector
- ChromaDB fallback support for local development

### Deployment

- EC2
- Nginx
- Gunicorn
- systemd services

## Project Structure

- [backend/](backend)
- [frontend/](frontend)
- [aws.md](aws.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [API_Setup_Guide.md](API_Setup_Guide.md)

## Requirements

- Node.js 20+
- Python 3.10+
- Supabase project with auth, storage, and PostgreSQL enabled
- Google Maps API key
- Optional Twilio account for WhatsApp integration

## Environment Setup

### Backend `.env`

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

### Frontend `.env.local`

```dotenv
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_SUPABASE_PROFILE_BUCKET=profile photo
```

## Local Development

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

## How To Use The App

### 1. Create an account

Sign up from the login page. The backend syncs Supabase authentication into Django user profiles.

### 2. Start a chat

Ask a health-related question in the chat interface. Answers are grounded in the configured dataset and guardrails.

### 3. Update your profile

Go to Settings to edit your name, health details, and profile photo.

### 4. Upload medical documents

Admins can go to the ingestion page, upload a dataset, and monitor processing progress until the vectors are ready.

### 5. Manage the system

Admins can review users, update configuration, change guardrails, and inspect audit logs.

## Useful Commands

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

## Deployment Guide

The production stack runs on EC2 with:

- Nginx serving the frontend and proxying `/api`
- Gunicorn running Django
- A background ingestion worker for document processing
- Supabase for auth, storage, and database services

### Routine Update Flow

```bash
ssh -i "/Users/vikashkumar/Downloads/aarogya-sahayak.pem" ubuntu@ec2-3-1-201-179.ap-southeast-1.compute.amazonaws.com

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

- If profile photo upload fails, confirm `SUPABASE_PROFILE_BUCKET` matches the exact bucket ID in Supabase.
- If document processing appears stuck, restart `arogya-ingestion-worker` and check the admin ingestion page.
- If frontend changes do not show up, rebuild the frontend and restart Nginx.
- If auth behavior looks stale, clear browser storage and sign in again.

## Notes

- Do not commit secrets into the repository.
- `aws.md` contains the detailed EC2 runbook.
- `DEPLOYMENT.md` and `API_Setup_Guide.md` remain as reference guides.

<div align="center">
	<b>Made with ❤️ by Vikash Kumar</b>
</div>
