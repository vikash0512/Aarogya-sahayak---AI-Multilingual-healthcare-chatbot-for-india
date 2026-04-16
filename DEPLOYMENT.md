# Arogya Sahayak - Official Deployment Guide

This guide provides a comprehensive, start-to-finish walkthrough for deploying **Arogya Sahayak** for production. We cover three deployment strategies:
1. **Serverless Flow**: **Vercel** (Frontend) + **Render** (Backend) (Recommended for simple scaling)
2. **Traditional Cloud**: **AWS EC2** (Full Control & Virtual Machine Setup)

All deployments utilize **Supabase** to handle PostgreSQL (Vector DB mappings) and Authentication.

---

## Prerequisites Before Deployment

1. **GitHub Account**: Both your `frontend` and `backend` must be pushed to a GitHub repository.
2. **Supabase Account**: Sign up at [Supabase](https://supabase.com) and create a new project.
3. **API Keys Ready**:
   - Google Maps API Key (For `VITE_GOOGLE_MAPS_API_KEY` with JS Maps/Places enabled)
   - OpenAI or Google Gemini AI Key
   - Twilio Account Details (If using WhatsApp Sandbox)

---

## Part 1: Setting up Supabase Database

Supabase provides our Postgres database and pgvector extension needed for the RAG engine.

1. In your new Supabase Project, go to **Settings → API**, and copy:
   - `Project URL`
   - `Anon Key` (Public)
   - `Service Role Key` (Secret Server Key)
   - `JWT Secret`
2. Go to **Settings → Database**, and copy the **Connection string URI** (make sure you use the `Session Mode` connection string, which typically looks like `postgresql://postgres.[id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`).
3. In the Supabase menu, go to **SQL Editor**, and run this command to enable Vector search:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
*(The backend will automatically create the tables on its first run, no further setup needed!)*

---

## Part 2: Deployment via Render & Vercel (Easier Route)

### A. Deploy Backend on Render
1. Create an account on [Render.com](https://render.com).
2. Click **New +** → **Web Service** → Connect your GitHub repository.
3. Configure the Build Settings:
   - **Root directory**: `backend` (Important!)
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   - **Start Command**:
     ```bash
     gunicorn arogya.wsgi:application --bind 0.0.0.0:$PORT
     ```
4. Scroll down to **Environment Variables** and add all of these:
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `*`
   - `CORS_ALLOWED_ORIGINS`: `https://[your-vercel-domain].vercel.app` (You can add `*` temporarily during setup)
   - `SECRET_KEY`: *(Generate a long random password)*
   - `DATABASE_URL`: *(Your Supabase Database Connection URI)*
   - `SUPABASE_URL`: *(Your Supabase Project URL)*
   - `SUPABASE_ANON_KEY`: *(Your Supabase Anon Key)*
   - `SUPABASE_SERVICE_KEY`: *(Your Supabase Service Role Key)*
   - `SUPABASE_JWT_SECRET`: *(Your Supabase JWT Secret)*
5. Click **Create Web Service**. Wait 5-10 minutes. Copy the Live URL (e.g., `https://arogya-backend.onrender.com`).

### B. Deploy Frontend on Vercel
1. Create an account on [Vercel.com](https://vercel.com).
2. Click **Add New Project** and import your GitHub repository.
3. Configure Build Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
4. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL`: `https://arogya-backend.onrender.com/api` *(Paste your Render backend URL with /api)*
   - `VITE_SUPABASE_URL`: *(Your Supabase Project URL)*
   - `VITE_SUPABASE_ANON_KEY`: *(Your Supabase Anon Key)*
   - `VITE_GOOGLE_MAPS_API_KEY`: *(Your Google Cloud API Key starting with AIzaSy...)*
5. Click **Deploy**. Your app is now live!

---

## Part 3: Full Custom Deployment via AWS (EC2)

Follow these steps if you want to host both the frontend and backend yourself on a virtual Linux machine.

### Step 1: Launch EC2 Instance
1. In AWS Console, go to **EC2** and click **Launch Instance**.
2. Select **Ubuntu 24.04 LTS**.
3. Instance Type: Minimum `t3.small` (due to AI embedding vector requirements).
4. Network Settings: Allow **HTTPS (443)**, **HTTP (80)**, and **SSH (22)**.
5. Launch and connect via SSH terminal.

### Step 2: Install System Dependencies
Once logged in, install Python, Node, and NGINX:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv python3-venv nginx certbot python3-certbot-nginx curl git -y

# Setup Node Repository and Install Node 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 3: Clone Code & Build Frontend
```bash
git clone https://github.com/your-username/arogya-sahayak.git
cd arogya-sahayak/frontend
npm install

# Write production environment variables
cat << EOF > .env.production
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
EOF

npm run build
```

### Step 4: Setup Backend
```bash
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file with Supabase variables
cat << EOF > .env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SECRET_KEY=generate_a_secure_random_key_here
DATABASE_URL=YOUR_SUPABASE_DATABASE_URL
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_KEY
SUPABASE_JWT_SECRET=YOUR_SUPABASE_JWT_SECRET
EOF

# Collect static assets for the admin panel and push DB structure
python manage.py collectstatic --noinput
python manage.py migrate
```

### Step 5: Start Backend with Gunicorn
We use Gunicorn and systemd to keep the backend running forever:
```bash
sudo nano /etc/systemd/system/arogya.service
```
Paste the following:
```ini
[Unit]
Description=Gunicorn daemon for Arogya Sahayak
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/arogya-sahayak/backend
ExecStart=/home/ubuntu/arogya-sahayak/backend/venv/bin/gunicorn --workers 3 --timeout 120 --bind unix:/home/ubuntu/arogya-sahayak/backend/arogya.sock arogya.wsgi:application

[Install]
WantedBy=multi-user.target
```
Start it up:
```bash
sudo systemctl start arogya
sudo systemctl enable arogya
```

### Step 6: Configure NGINX Server
Connect the frontend build to the backend socket efficiently:
```bash
sudo nano /etc/nginx/sites-available/arogya
```
Paste this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve the React Frontend
    location / {
        root /home/ubuntu/arogya-sahayak/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API traffic to Django Backend
    location /api/ {
        proxy_pass http://unix:/home/ubuntu/arogya-sahayak/backend/arogya.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve Django Admin Static Files
    location /static/ {
        alias /home/ubuntu/arogya-sahayak/backend/staticfiles/;
    }
}
```
Enable the server:
```bash
sudo ln -s /etc/nginx/sites-available/arogya /etc/nginx/sites-enabled
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Secure with SSL (Let's Encrypt)
Run Certbot to automatically attach a Free HTTPS certificate to your servers:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Final Steps:
Use the Admin Portal natively on your deployed domain. Use the integrated "Third-Party Config" tool inside your site's sidebar to register your **Twilio WhatsApp** Sandbox details and apply **LLM / AI Model Settings** globally.
