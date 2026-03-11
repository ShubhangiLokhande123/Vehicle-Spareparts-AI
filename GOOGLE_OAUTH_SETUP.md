# Google OAuth Setup Guide for GAE Spare Parts AI

## Problem
Google Sign-In is not working because the OAuth provider is not properly configured in Supabase.

## Solution Steps

### Step 1: Configure Google OAuth in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `fhmglayzfzzbhqqqffcc`

2. **Enable Google Provider**
   - Go to **Authentication** → **Providers**
   - Find **Google** in the list
   - Click on it to configure

3. **Get Google OAuth Credentials**
   You need to create OAuth credentials in Google Cloud Console:

   a. Go to [Google Cloud Console](https://console.cloud.google.com/)
   
   b. Create a new project or select existing one
   
   c. Enable Google+ API:
      - Go to **APIs & Services** → **Library**
      - Search for "Google+ API"
      - Click **Enable**
   
   d. Create OAuth 2.0 Credentials:
      - Go to **APIs & Services** → **Credentials**
      - Click **Create Credentials** → **OAuth client ID**
      - Choose **Application type**: Web application
      - **Name**: GAE Spare Parts AI
      
   e. Configure Authorized redirect URIs:
      ```
      https://fhmglayzfzzbhqqqffcc.supabase.co/auth/v1/callback
      ```
      
   f. Click **Create** and copy:
      - **Client ID**
      - **Client Secret**

4. **Configure in Supabase**
   - Back in Supabase Dashboard → Authentication → Providers → Google
   - Enable the provider
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Click **Save**

### Step 2: Configure Deep Linking (Already Done)

The app.json already has the correct scheme configured:
```json
"scheme": "sparepartsai"
```

### Step 3: Add Redirect URL to Google Cloud Console

After configuring Supabase, you need to add the mobile redirect URL:

1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:
   ```
   https://fhmglayzfzzbhqqqffcc.supabase.co/auth/v1/callback
   sparepartsai://auth/callback
   ```
4. Click **Save**

### Step 4: Test the Integration

1. **Rebuild your app** (important after configuration changes):
   ```bash
   npm run android
   ```

2. **Test Google Sign-In**:
   - Open the app
   - Click "Sign in with Google"
   - You should see the Google sign-in page
   - After signing in, you should be redirected back to the app

### Step 5: Troubleshooting

If you still encounter issues:

#### Check Console Logs
The updated code now includes detailed logging. Check your terminal for:
- `Redirect URL:` - Should show `sparepartsai://auth/callback`
- `Opening OAuth URL:` - Should show the Google OAuth URL
- `Browser result:` - Should show the result after authentication
- `Auth response:` - Should show if code or tokens were received

#### Common Issues:

1. **"localhost refused to connect"**
   - This means Supabase Google OAuth is not configured
   - Follow Step 1 above

2. **"Invalid redirect URI"**
   - Make sure the redirect URI in Google Cloud Console matches exactly:
     `https://fhmglayzfzzbhqqqffcc.supabase.co/auth/v1/callback`

3. **"No OAuth URL received from Supabase"**
   - Google provider is not enabled in Supabase
   - Check Authentication → Providers → Google is enabled

4. **Browser opens but doesn't redirect back**
   - Check that the scheme in app.json matches the redirect URL
   - Rebuild the app after any app.json changes

5. **"Sign-in was cancelled"**
   - User cancelled the sign-in process
   - This is normal behavior

#### Enable Debug Mode

To see more detailed logs, you can check:
- React Native logs: `npx react-native log-android`
- Supabase logs in the dashboard under Logs → Auth

### Step 6: Alternative - Use Email Authentication

If Google OAuth is taking time to set up, users can still sign in using:
- Email/Password sign up
- Email/Password sign in
- Password reset via email

These features are already working in your app.

## Code Changes Made

The following improvements were made to `App.tsx`:

1. **Better error handling** - More descriptive error messages
2. **Detailed logging** - Console logs for debugging OAuth flow
3. **Fixed skipBrowserRedirect** - Changed to `false` for proper OAuth flow
4. **Better result handling** - Handles both code and token-based responses
5. **Cancel handling** - Properly handles when user cancels sign-in

## Testing Checklist

- [ ] Google OAuth credentials created in Google Cloud Console
- [ ] Google provider enabled in Supabase Dashboard
- [ ] Client ID and Secret configured in Supabase
- [ ] Redirect URIs added to Google Cloud Console
- [ ] App rebuilt after configuration changes
- [ ] Google Sign-In button clicked
- [ ] Google sign-in page opens in browser
- [ ] After signing in, redirects back to app
- [ ] User is logged in successfully

## Support

If you continue to face issues:
1. Check the console logs for specific error messages
2. Verify all redirect URIs match exactly
3. Ensure Google+ API is enabled in Google Cloud Console
4. Try clearing app data and reinstalling

## Quick Start (If Already Configured)

If you've already set up Google OAuth before:

1. Verify credentials in Supabase Dashboard
2. Rebuild the app: `npm run android`
3. Test sign-in

The code improvements should now provide better error messages to help identify any remaining issues.
