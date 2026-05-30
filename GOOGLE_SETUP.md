
# Google Cloud Setup for Meetly

To enable Google Login and Google Calendar integration, you need to configure a project in the Google Cloud Console.

## 1. Create a Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `Meetly`.

## 2. Configure OAuth Consent Screen
1. Navigate to **APIs & Services** > **OAuth consent screen**.
2. User Type: **External**.
3. Fill in:
   - App name: `Meetly`
   - User support email: Your email.
   - Developer contact info: Your email.
4. **Scopes**: Add the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `.../auth/calendar.events` (To create and manage bookings)
   - `.../auth/calendar.readonly` (To check availability)

## 3. Create Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Application type: **Web application**.
4. **Authorized JavaScript origins**:
   - Local: `http://localhost:3000`
   - Production: `https://meetly.vercel.app`
5. **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://meetly.vercel.app/api/auth/callback/google`
6. Copy the **Client ID** and **Client Secret**.

## 4. Enable APIs
1. Go to **Library**.
2. Search and **Enable**:
   - Google Calendar API
   - Google People API
