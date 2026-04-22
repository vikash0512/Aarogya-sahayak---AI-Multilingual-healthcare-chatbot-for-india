# Minimum AWS Demo Hosting Guide (No Kubernetes)

This guide is for the simplest possible demo deployment with minimum effort.

Scope:
- Amazon Web Services only
- Frontend and backend hosting only
- Keep your current external database and AI setup exactly as-is
- No Kubernetes
- No architecture redesign

## 1. Smallest Practical Architecture

- 1 Amazon Elastic Compute Cloud server (Ubuntu 22.04)
- 1 public internet address attached to this server
- 1 Nginx web server
- 1 Gunicorn process for Django backend
- Frontend built once and served as static files by Nginx

For your traffic (1 to 2 users per day), this is enough.

## 2. Minimum Server Size

- Instance type: t3.medium
- Storage: 30 to 40 gigabytes General Purpose Solid State Drive
- Operating system: Ubuntu Server 22.04

If chat response is still slow, upgrade only to t3.large.

## 3. AWS Setup Steps (Beginner Friendly)

## Step 1: Launch server

1. Open Amazon Elastic Compute Cloud console.
2. Click Launch instance.
3. Name it `arogya-demo-server`.
4. Select Ubuntu Server 22.04.
5. Select instance type t3.medium.
6. Create a key pair and download private key file.
7. Set storage to 40 gigabytes.

## Step 2: Configure security group

Allow inbound:

- Port 22 for Secure Shell from your internet address only
- Port 80 for Hypertext Transfer Protocol from anywhere
- Port 443 for Hypertext Transfer Protocol Secure from anywhere

## Step 3: Allocate static public internet address

1. Create one Elastic IP address.
2. Attach it to your server.

This avoids URL change when instance restarts.

## 4. Deployment Steps on Server

## Step 1: Install required packages

Install:

- Python 3 and pip
- virtual environment package
- Nginx
- Git
- Node.js version 20 and npm

## Step 2: Upload project

1. Clone repository on server.
2. Go to backend folder.
3. Create Python virtual environment.
4. Install backend requirements.

## Step 3: Backend environment file

1. Create backend environment file with your existing values.
2. Keep current database and AI keys unchanged.
3. Set production values:

- DEBUG=False
- ALLOWED_HOSTS=<your-domain-or-elastic-ip>
- CORS_ALLOWED_ORIGINS=<your-frontend-domain>
- CSRF_TRUSTED_ORIGINS=<your-frontend-domain>
- DB_CONN_MAX_AGE=120

## Step 4: Run Django backend

1. Run database migrations.
2. Run collectstatic.
3. Test Gunicorn command manually first.
4. Create systemd service for Gunicorn.
5. Enable and start Gunicorn service.

## Step 5: Build frontend

1. Go to frontend folder.
2. Install dependencies with npm.
3. Create production frontend environment file if needed.
4. Build frontend using npm run build.
5. Copy build output to Nginx web root.

## Step 6: Configure Nginx reverse proxy

1. Create Nginx site config:
- Serve frontend static files at /
- Proxy /api/ to Gunicorn at localhost:8000
2. Test Nginx config.
3. Restart Nginx.

## Step 7: Add Hypertext Transfer Protocol Secure

If you have a domain:

1. Point domain to Elastic IP in Domain Name System.
2. Install Certbot.
3. Generate and apply Let us Encrypt certificate.
4. Enable automatic certificate renewal.

If you do not have domain yet, run demo over Hypertext Transfer Protocol first.

## 5. Monitoring Minimum (No New Heavy Stack)

For minimum effort demo:

- Use `journalctl` for Gunicorn logs
- Use Nginx access and error logs
- Optionally install `htop` for quick resource check

This avoids extra setup like Prometheus and Grafana for a 1 to 2 user demo.

## 6. Basic Performance Settings

Use these for current project:

- Gunicorn workers: 2
- Gunicorn timeout: 120 seconds
- Django DB_CONN_MAX_AGE=120
- Keep frontend on Nginx static hosting

## 7. Pre-Deployment Checklist

- Amazon Elastic Compute Cloud server created
- Elastic IP attached
- Security group ports 22, 80, 443 configured
- Domain ready (optional)
- Existing backend environment values ready
- Repository access ready

## 8. What You Share Before Secure Shell Handover

1. Elastic IP address
2. Secure Shell username (usually ubuntu)
3. Private key file
4. Domain name if available
5. Confirmation to keep existing database and AI configuration unchanged

## 9. What Will Be Done After Access Is Shared

1. Server hardening and package installation
2. Backend setup with Gunicorn and systemd
3. Frontend build and Nginx hosting
4. Reverse proxy setup for /api
5. Hypertext Transfer Protocol Secure setup if domain is ready
6. Final test and handover commands
