# AWS EC2 Deployment Guide for Arogya Sahayak (Beginner Friendly)

This document is a complete, practical record of what was done to deploy your project on EC2, with explanations for each step.

It is written for someone who is new to AWS and Linux.

---

## 0) What We Deployed

Your app has two parts:

1. Frontend (React + Vite) in the folder frontend
2. Backend (Django + Gunicorn) in the folder backend

On EC2, we hosted both on one Ubuntu server using:

1. Nginx as web server + reverse proxy
2. Gunicorn for Django app process
3. Systemd service for auto-restart and boot-start
4. Let’s Encrypt SSL certificate for HTTPS

---

## 1) EC2 Requirements

### Instance

- OS: Ubuntu 22.04 or 24.04
- Size: t3.medium recommended (t3.small can work for low load)
- Storage: 30-40 GB gp3

### Security Group Inbound Rules

Allow these ports:

1. 22 (SSH) from your IP only
2. 80 (HTTP) from anywhere
3. 443 (HTTPS) from anywhere

---

## 2) Connect to EC2 (from your Mac)

### 2.1 Fix key permissions (important)

Run this once on your local machine:

    chmod 400 "/Users/vikashkumar/Downloads/aarogya-sahayak.pem"

Why:
SSH refuses private keys with open permissions.

### 2.2 SSH into server

    ssh -i "/Users/vikashkumar/Downloads/aarogya-sahayak.pem" ubuntu@ec2-3-1-201-179.ap-southeast-1.compute.amazonaws.com

---

## 3) Server Updates + Base Packages

Run on EC2:

    sudo apt update && sudo apt upgrade -y
    sudo apt install -y python3-pip python3-venv nginx git certbot python3-certbot-nginx curl wget

Why:

- python3-pip + python3-venv: Django environment
- nginx: serves frontend and proxies API
- certbot: HTTPS certificate
- git/curl/wget: deployment utilities

---

## 4) Install Node.js 20 (required for your frontend)

Your frontend dependencies require Node 20+. Ubuntu default gave Node 18, which caused build warnings/failures.

Run on EC2:

    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    node --version
    npm --version

---

## 5) Clone Project on EC2

Run on EC2:

    cd /home/ubuntu
    git clone https://<YOUR_GITHUB_URL>.git arogya-app
    cd /home/ubuntu/arogya-app

Note:
Use a token-less secure URL if possible (SSH key or PAT via credential helper). Avoid storing personal tokens directly in commands.

---

## 6) Backend Setup (Django)

### 6.1 Create virtual environment + install dependencies

Run on EC2:

    cd /home/ubuntu/arogya-app/backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip setuptools wheel
    pip install -r requirements.txt

### 6.2 Create backend .env file

Create file: /home/ubuntu/arogya-app/backend/.env

Minimum important fields:

    SECRET_KEY=YOUR_SECRET
    DEBUG=False
    ALLOWED_HOSTS=ec2-3-1-201-179.ap-southeast-1.compute.amazonaws.com,3-1-201-179.nip.io,localhost,127.0.0.1
    CORS_ALLOWED_ORIGINS=https://3-1-201-179.nip.io,http://3-1-201-179.nip.io,http://localhost,http://localhost:3000
    CSRF_TRUSTED_ORIGINS=https://3-1-201-179.nip.io,http://3-1-201-179.nip.io
    DB_CONN_MAX_AGE=120

    DATABASE_URL=YOUR_SUPABASE_DATABASE_URL
    SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_KEY
    SUPABASE_JWT_SECRET=YOUR_SUPABASE_JWT_SECRET
    SUPABASE_PROFILE_BUCKET=YOUR_PROFILE_BUCKET_ID

    GEMINI_API_KEY=YOUR_GEMINI_API_KEY

    MAX_UPLOAD_SIZE=262144000

    TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
    TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
    TWILIO_WHATSAPP_NUMBER=YOUR_TWILIO_WHATSAPP_NUMBER

    SECURE_SSL_REDIRECT=True

Important:

- Before HTTPS is configured, keep SECURE_SSL_REDIRECT=False temporarily.
- After certificate is active, switch it to True.

### 6.3 Migrate + collect static

Run on EC2:

    cd /home/ubuntu/arogya-app/backend
    source venv/bin/activate
    python manage.py migrate
    python manage.py collectstatic --noinput

---

## 7) Frontend Setup (React)

### 7.1 Frontend env file

Create file: /home/ubuntu/arogya-app/frontend/.env.local

    VITE_API_BASE_URL=/api
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
    VITE_SUPABASE_PROFILE_BUCKET=YOUR_PROFILE_BUCKET_ID

Why VITE_API_BASE_URL=/api:
Nginx proxies /api to Django, so frontend and backend share same domain.

Why profile bucket vars:
- Keep bucket ID explicit and consistent between backend + frontend.
- Use the exact bucket ID from Supabase Storage (ID can differ from display name).

### 7.2 Install and build

Run on EC2:

    cd /home/ubuntu/arogya-app/frontend
    npm install
    npm run build

---

## 8) Configure Gunicorn as a Service

Create file: /etc/systemd/system/arogya-gunicorn.service

Use this content:

    [Unit]
    Description=Arogya Gunicorn Application Server
    After=network.target

    [Service]
    Type=notify
    User=ubuntu
    WorkingDirectory=/home/ubuntu/arogya-app/backend
    Environment="PATH=/home/ubuntu/arogya-app/backend/venv/bin"
    ExecStart=/home/ubuntu/arogya-app/backend/venv/bin/gunicorn \
      --workers 4 \
      --worker-class sync \
      --bind unix:/home/ubuntu/arogya-app/backend/gunicorn.sock \
      --timeout 120 \
      --access-logfile - \
      --error-logfile - \
      arogya.wsgi:application
    Restart=always
    RestartSec=10

    [Install]
    WantedBy=multi-user.target

Then run:

    sudo systemctl daemon-reload
    sudo systemctl enable arogya-gunicorn
    sudo systemctl start arogya-gunicorn
    sudo systemctl status arogya-gunicorn

### 8.1 Configure the ingestion worker

Document chunking and vector storage now run in a separate worker process, so uploads keep processing even if you close the browser or your PC.

Create file: /etc/systemd/system/arogya-ingestion-worker.service

Use this content:

    [Unit]
    Description=Arogya Document Ingestion Worker
    After=network.target

    [Service]
    User=ubuntu
    WorkingDirectory=/home/ubuntu/arogya-app/backend
    Environment="PATH=/home/ubuntu/arogya-app/backend/venv/bin"
    ExecStart=/home/ubuntu/arogya-app/backend/venv/bin/python manage.py process_document_jobs
    Restart=always
    RestartSec=10

    [Install]
    WantedBy=multi-user.target

Then run:

    sudo systemctl daemon-reload
    sudo systemctl enable arogya-ingestion-worker
    sudo systemctl start arogya-ingestion-worker
    sudo systemctl status arogya-ingestion-worker

---

## 9) Configure Nginx

Create file: /etc/nginx/sites-available/arogya-app

    upstream django_app {
        server unix:/home/ubuntu/arogya-app/backend/gunicorn.sock;
    }

    server {
        listen 80;
        server_name _ ec2-3-1-201-179.ap-southeast-1.compute.amazonaws.com 3.1.201.179 3-1-201-179.nip.io;
        client_max_body_size 250M;

        location / {
            alias /home/ubuntu/arogya-app/frontend/dist/;
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://django_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /static/ {
            alias /home/ubuntu/arogya-app/backend/staticfiles/;
        }

        location /media/ {
            alias /home/ubuntu/arogya-app/backend/media/;
        }
    }

Enable it:

    sudo ln -sf /etc/nginx/sites-available/arogya-app /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl enable nginx
    sudo systemctl restart nginx

---

## 10) Critical Permissions (fixed during deployment)

We hit permission errors and fixed them with:

    sudo chmod 755 /home
    sudo chmod 755 /home/ubuntu
    sudo chmod 755 /home/ubuntu/arogya-app
    sudo chmod -R 755 /home/ubuntu/arogya-app/frontend/dist
    sudo chmod -R 755 /home/ubuntu/arogya-app/backend/staticfiles
    sudo chmod -R 755 /home/ubuntu/arogya-app/backend/media

Then ownership for frontend served files:

    sudo chown -R www-data:www-data /home/ubuntu/arogya-app/frontend/dist

Backend uploads are written by Gunicorn (running as user ubuntu), so keep media owned by ubuntu:

    sudo mkdir -p /home/ubuntu/arogya-app/backend/media/documents
    sudo chown -R ubuntu:ubuntu /home/ubuntu/arogya-app/backend/media
    sudo chmod -R 755 /home/ubuntu/arogya-app/backend/media

If frontend build fails due to dist ownership, temporarily give ubuntu ownership to build, then return to www-data:

    sudo chown -R ubuntu:ubuntu /home/ubuntu/arogya-app/frontend/dist
    cd /home/ubuntu/arogya-app/frontend && npm run build
    sudo chown -R www-data:www-data /home/ubuntu/arogya-app/frontend/dist

---

## 11) Enable HTTPS (What was done)

We used a domain that resolves automatically to IP: 3-1-201-179.nip.io

Command used:

    sudo certbot --nginx -d 3-1-201-179.nip.io --non-interactive --agree-tos -m vikashkrmuz0512@gmail.com --redirect

Result:

- HTTPS certificate installed in Nginx
- HTTP auto-redirect to HTTPS enabled in Nginx

After HTTPS was active, SECURE_SSL_REDIRECT was set to True in backend .env and services restarted.

---

## 12) Login Reliability Fix Applied

Issue observed:

- stale token/invalid session edge case caused forced logout loop

Fix applied in frontend:

- api fetch now reads latest Supabase session token before requests
- retries once on 401 with refreshed token before signout

File changed:

- frontend/src/api.ts

Also ensured admin account sync:

- admin@arogyasahayak.in role forced to admin in Django profile
- Supabase admin user password reset for recovery

---

## 13) How to Deploy Code Updates (Routine)

When you change code later:

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
    sudo chown -R ubuntu:ubuntu /home/ubuntu/arogya-app/frontend/dist || true
    npm run build
    sudo chown -R www-data:www-data /home/ubuntu/arogya-app/frontend/dist

    # Ensure dataset uploads don't fail with PermissionError on media/documents
    sudo mkdir -p /home/ubuntu/arogya-app/backend/media/documents
    sudo chown -R ubuntu:ubuntu /home/ubuntu/arogya-app/backend/media
    sudo chmod -R 755 /home/ubuntu/arogya-app/backend/media

    sudo systemctl restart arogya-gunicorn
    sudo systemctl restart arogya-ingestion-worker
    sudo systemctl restart nginx

---

## 14) If You Stop EC2 to Save Money (Important)

You said you will shut down EC2 to save credits. Good approach.

### 14.1 Stop vs Terminate

- Stop instance: keeps disk, files, config (small storage cost continues)
- Terminate instance: deletes instance permanently (unless protected)

Use Stop, not Terminate.

### 14.2 What can break after restart

If you do NOT use Elastic IP, public IP can change. Then:

1. your old nip.io hostname no longer matches new IP
2. old SSL certificate hostname becomes wrong
3. CORS/CSRF/ALLOWED_HOSTS may mismatch

### 14.3 Best practice before stopping

Allocate and attach an Elastic IP once. Then IP stays fixed.

If Elastic IP is fixed, your domain and cert remain valid.

---

## 15) Start-Again Checklist (after EC2 starts)

Follow this every time you start instance again.

### Step A: connect and check services

    ssh -i "/Users/vikashkumar/Downloads/aarogya-sahayak.pem" ubuntu@<your-ec2-host>
    sudo systemctl status nginx
    sudo systemctl status arogya-gunicorn

If not active:

    sudo systemctl restart arogya-gunicorn
    sudo systemctl restart arogya-ingestion-worker
    sudo systemctl restart nginx

### Step B: verify app

    curl -I http://localhost
    curl -I https://localhost -k

### Step C: if public IP changed

Follow this exact checklist if your instance got a new public IP after restart.

#### C.1 Find the new IP in AWS Console

1. Open AWS Console.
2. Go to EC2.
3. Click Instances.
4. Click your running instance.
5. In Details tab, copy Public IPv4 address.

Example new IP: 54.12.34.56

#### C.2 Make new nip.io domain from that IP

Rule:
- Replace dots with dashes
- Add .nip.io

Example:
- 54.12.34.56 becomes 54-12-34-56.nip.io

Save this value. In this example, NEW_DOMAIN=54-12-34-56.nip.io

#### C.3 SSH using the new IP

On your Mac terminal:

    ssh -i "/Users/vikashkumar/Downloads/aarogya-sahayak.pem" ubuntu@54.12.34.56

Replace 54.12.34.56 with your actual new IP.

#### C.4 Update Nginx server_name

Open Nginx config:

    sudo nano /etc/nginx/sites-available/arogya-app

Find the server_name line and include the new domain. Example:

    server_name _ 54.12.34.56 54-12-34-56.nip.io;

Save and exit nano:
- Press Ctrl+O, Enter (save)
- Press Ctrl+X (exit)

Test and reload Nginx:

    sudo nginx -t
    sudo systemctl reload nginx

#### C.5 Update backend .env (ALLOWED_HOSTS/CORS/CSRF)

Open env file:

    nano /home/ubuntu/arogya-app/backend/.env

Update these 3 lines using your new IP/domain:

    ALLOWED_HOSTS=54.12.34.56,54-12-34-56.nip.io,localhost,127.0.0.1
    CORS_ALLOWED_ORIGINS=http://54.12.34.56,https://54.12.34.56,http://54-12-34-56.nip.io,https://54-12-34-56.nip.io,http://localhost,http://localhost:3000
    CSRF_TRUSTED_ORIGINS=http://54.12.34.56,https://54.12.34.56,http://54-12-34-56.nip.io,https://54-12-34-56.nip.io

Save and exit nano.

#### C.6 Issue fresh HTTPS certificate for new domain

Run:

    sudo certbot --nginx -d 54-12-34-56.nip.io --non-interactive --agree-tos -m your-email@example.com --redirect

Replace:
- 54-12-34-56.nip.io with your new nip.io domain
- your-email@example.com with your email

#### C.7 Restart backend and Nginx

    sudo systemctl restart arogya-gunicorn
    sudo systemctl restart nginx

#### C.8 Verify it works

Run these checks on EC2:

    sudo systemctl status arogya-gunicorn
    sudo systemctl status nginx
    curl -I http://54-12-34-56.nip.io
    curl -I https://54-12-34-56.nip.io

Expected:
- HTTP returns 301 redirect to HTTPS
- HTTPS returns 200 OK

#### C.9 Open app in browser

Use:

    https://54-12-34-56.nip.io

If login looks broken after IP/domain change, open in Incognito once to avoid old cached redirects/cookies.

#### C.10 One-command shortcut (optional)

If you want, you can run this helper after replacing 2 values (NEW_IP and YOUR_EMAIL):

    NEW_IP="54.12.34.56"
    YOUR_EMAIL="your-email@example.com"
    NEW_DOMAIN="${NEW_IP//./-}.nip.io"

    sudo sed -i "s/^ALLOWED_HOSTS=.*/ALLOWED_HOSTS=${NEW_IP},${NEW_DOMAIN},localhost,127.0.0.1/" /home/ubuntu/arogya-app/backend/.env
    sudo sed -i "s|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=http://${NEW_IP},https://${NEW_IP},http://${NEW_DOMAIN},https://${NEW_DOMAIN},http://localhost,http://localhost:3000|" /home/ubuntu/arogya-app/backend/.env
    sudo sed -i "s|^CSRF_TRUSTED_ORIGINS=.*|CSRF_TRUSTED_ORIGINS=http://${NEW_IP},https://${NEW_IP},http://${NEW_DOMAIN},https://${NEW_DOMAIN}|" /home/ubuntu/arogya-app/backend/.env
    sudo sed -i "s/server_name .*/server_name _ ${NEW_IP} ${NEW_DOMAIN};/" /etc/nginx/sites-available/arogya-app

    sudo nginx -t && sudo systemctl reload nginx
    sudo certbot --nginx -d "${NEW_DOMAIN}" --non-interactive --agree-tos -m "${YOUR_EMAIL}" --redirect
    sudo systemctl restart arogya-gunicorn
    sudo systemctl restart nginx

### Step D: browser cache

If login behaves strangely after restart/domain change, test in Incognito mode first.

---


## 16) Monitoring and Debug Commands

### Service status

    sudo systemctl status nginx
    sudo systemctl status arogya-gunicorn
    sudo systemctl status arogya-ingestion-worker

### Live backend logs

    sudo journalctl -u arogya-gunicorn -f

### Live ingestion worker logs

    sudo journalctl -u arogya-ingestion-worker -f

### Nginx error logs

    sudo tail -n 200 /var/log/nginx/error.log

### Test auth endpoint locally on server

    curl -i http://localhost/api/auth/me/

### Check listening ports

    ss -tulpen | grep -E ':80|:443'

---

## 17) Security Notes for Production

1. Change temporary admin password immediately.
2. Do not store secrets in git.
3. Restrict SSH (port 22) to your own IP.
4. Use Elastic IP to avoid repeated cert/domain rework.
5. Keep OS updated regularly:

    sudo apt update && sudo apt upgrade -y

---

## 18) Final Working URL (current)

Current HTTPS URL configured in this deployment:

https://3-1-201-179.nip.io

If the instance IP changes and no Elastic IP is attached, this URL must be updated as described in Section 15.
