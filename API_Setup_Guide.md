# Arogya Sahayak - API Integration Guide

This guide provides step-by-step instructions for configuring **Google Maps API** and **Twilio Sandbox for WhatsApp** for the Arogya Sahayak application.

---

## 1. Google Maps API Setup

For the "Find Nearby PHC" feature to work properly, you need a single **Google Maps API Key** that has access to specific mapping services.

### Steps to get the API Key:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project (or select an existing one).
3. Open the **Navigation Menu** (top left) and go to **APIs & Services > Library**.
4. You will see a huge list of Maps options (SDK for Android, Static Maps, etc.). **You only need to enable these exact two from your list:**
   - **Maps JavaScript API** (Required: Renders the interactive map itself on the website)
   - **Places API** (Required: Allows searching for locations and autocomplete features)
   *(Note: You do NOT need the Maps SDK for Android/iOS, Static API, or Elevation API for this project since this is a web app).*
5. After enabling the APIs, go to **APIs & Services > Credentials**.
6. Click **+ CREATE CREDENTIALS** -> **API key**.
7. Your API key will be generated (it starts with `AIzaSy...`).
8. **IMPORTANT: Restrict your API key**
   - Click on the generated key.
   - Under *Application restrictions*, select **HTTP referrers (web sites)** and add your domain (e.g., `http://localhost:3000` or your production URL).
   - Under *API restrictions*, check **Restrict key** and select the 3 APIs you enabled above.

### Where to paste the key:
- Log in to the Arogya Sahayak Admin Panel.
- Go to the **WhatsApp API** tab (now named "Third-Party Integrations" in the sidebar).
- Under the **Google Maps API Integration** section, paste the key and click **Save Configuration**.
- *(Note: Your frontend should also have this key in the `.env` file as `VITE_GOOGLE_MAPS_API_KEY=your_key_here` for hot reloads during local development)*

---

## 2. Twilio WhatsApp Sandbox Setup

Twilio Sandbox allows you to develop and test WhatsApp features without needing to apply for a formal WhatsApp Business Account or go through Meta's verification process.

### Steps to configure Twilio Sandbox:
1. Go to [Twilio Console](https://console.twilio.com/) and sign up / log in.
2. In the console, search for **WhatsApp Sandbox** in the top search bar, or navigate to **Messaging > Try it out > Send a WhatsApp message**.
3. You will see a sandbox number (e.g., `+1 415 523 8886`) and a join code (e.g., `join your-word`).
4. To link your personal phone for testing, send the WhatsApp message `join your-word` to the Sandbox number from your mobile device.
5. In the Twilio Console, go to **Account Info** (on the dashboard):
   - You need your **Account SID** (optional for this UI, but good to know).
   - You need your **Auth Token** (this acts as your Access Token).

### Setting up the Webhook:
For Arogya Sahayak to reply to users automatically, Twilio must forward incoming messages to your backend.
1. In the Twilio WhatsApp Sandbox configuration page, look for the **"When a message comes in"** field (Webhook URL).
2. Paste the Webhook URL provided in the Admin Panel:
   `https://your-domain.com/api/chat/whatsapp/webhook/` (Replace `your-domain.com` with your active backend URL. E.g., if using ngrok: `https://abcd.ngrok.io/api/chat/whatsapp/webhook/`)
3. Set the method to **HTTP POST**.
4. Click **Save** in Twilio.

### Where to paste the credentials in Arogya Sahayak:
- Go to the Arogya Sahayak Admin Panel -> **Third-Party Integrations**.
- Under **WhatsApp Sandbox Integration**:
  - **Provider:** Select "Twilio Sandbox for WhatsApp"
  - **Twilio Phone Number:** Paste the Sandbox number (e.g. `+14155238886`)
  - **Access Token:** Paste your Twilio Auth Token
  - **Enable Validation:** Check the box.
- Click **Save Configuration**.
