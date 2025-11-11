# GitHub OAuth Integration Setup Guide

This guide will help you set up GitHub OAuth authentication for GitVista, enabling users to:
- Sign in with their GitHub account
- Access private repositories
- Get higher API rate limits (5,000 vs 60 requests/hour)
- Access personal user data

## Prerequisites

- A GitHub account
- Your GitVista application deployed (or running locally)

## Step 1: Create a GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
   - Direct link: https://github.com/settings/developers

2. Click **"New OAuth App"**

3. Fill in the application details:
   - **Application name**: `GitVista` (or your preferred name)
   - **Homepage URL**: Your application URL
     - For local development: `http://localhost:5500` (adjust port as needed)
     - For production: `https://yourdomain.com`
   - **Application description**: (Optional) "Comprehensive toolkit for GitHub developers and teams"
   - **Authorization callback URL**: Same as your Homepage URL
     - For local: `http://localhost:5500/index.html`
     - For production: `https://yourdomain.com/index.html`

4. Click **"Register application"**

5. You'll see your OAuth app details:
   - **Client ID**: Copy this (you'll need it)
   - **Client Secret**: Click "Generate a new client secret" and copy it securely

## Step 2: Configure Your Application

### Option A: Client-Side Only (Simple but Less Secure)

⚠️ **Not recommended for production** - Client secret would be exposed

1. Open `app.js`
2. Find the `GITHUB_OAUTH_CONFIG` object (around line 5)
3. Replace `YOUR_GITHUB_CLIENT_ID` with your actual Client ID:

```javascript
const GITHUB_OAUTH_CONFIG = {
  clientId: 'Iv1.1234567890abcdef', // Your actual Client ID
  redirectUri: window.location.origin + window.location.pathname,
  scope: 'read:user,repo,read:org',
  authUrl: 'https://github.com/login/oauth/authorize'
};
```

### Option B: With Backend Server (Recommended for Production)

For production apps, you should create a backend server to handle the OAuth token exchange securely.

#### Backend Setup (Node.js Example)

1. Create a simple Express server:

```javascript
// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// OAuth callback endpoint
app.post('/api/github/oauth/token', async (req, res) => {
  const { code } = req.body;
  
  try {
    // Exchange code for access token
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

2. Create `.env` file:

```
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
```

3. Install dependencies:

```bash
npm install express axios cors dotenv
```

4. Update `app.js` `exchangeCodeForToken` function:

```javascript
async function exchangeCodeForToken(code) {
  try {
    const response = await fetch('http://localhost:3000/api/github/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });
    
    const data = await response.json();
    
    if (data.access_token) {
      accessToken = data.access_token;
      localStorage.setItem('github_access_token', accessToken);
      await authenticateUser();
    } else {
      throw new Error('No access token received');
    }
  } catch (error) {
    console.error('OAuth exchange error:', error);
    showError('Failed to complete authentication');
  }
}
```

## Step 3: Testing the Integration

### Local Development

1. Start your application:
   ```bash
   # If using VS Code Live Server
   # Right-click index.html → "Open with Live Server"
   
   # Or use Python's simple HTTP server
   python -m http.server 5500
   ```

2. If using backend, start your server:
   ```bash
   node server.js
   ```

3. Open your browser and navigate to `http://localhost:5500`

4. Click **"Sign in with GitHub"**

5. You'll be redirected to GitHub's authorization page

6. Click **"Authorize"**

7. You'll be redirected back to your app, now authenticated!

### Verification

After successful authentication, you should see:
- Your GitHub avatar and username in the header
- "Authenticated" badge in the rate limit display
- Rate limit shows 5000 instead of 60
- "Sign out" button appears

## Step 4: Using Personal Access Token (Alternative Method)

For quick testing or personal use, you can use a Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Direct link: https://github.com/settings/tokens

2. Click **"Generate new token (classic)"**

3. Give it a name: `GitVista Development`

4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:user` (Read user profile data)
   - ✅ `read:org` (Read organization data)

5. Click **"Generate token"**

6. Copy the token (you won't see it again!)

7. In GitVista, when the OAuth flow prompts for a token, paste it there

8. Or manually set it:
   ```javascript
   // In browser console
   localStorage.setItem('github_access_token', 'ghp_your_token_here');
   location.reload();
   ```

## Security Best Practices

### For Production:

1. ✅ **Use HTTPS** - Always use HTTPS in production
2. ✅ **Backend Token Exchange** - Never expose your Client Secret
3. ✅ **Validate State Parameter** - Prevents CSRF attacks (already implemented)
4. ✅ **Token Storage** - Store tokens securely, consider encryption
5. ✅ **Token Expiration** - Implement token refresh logic
6. ✅ **Minimal Scopes** - Only request necessary permissions

### For Development:

1. ✅ Use separate OAuth apps for dev/prod
2. ✅ Never commit secrets to version control
3. ✅ Use environment variables
4. ✅ Test with test accounts first

## Troubleshooting

### Issue: "OAuth state mismatch"
- **Solution**: Clear your browser cache and try again

### Issue: "Authentication failed"
- **Solution**: Check that your Client ID is correct
- Verify your redirect URI matches exactly

### Issue: "Rate limit still shows 60"
- **Solution**: The token might not be valid
- Check browser console for errors
- Try signing out and back in

### Issue: "User not authorized"
- **Solution**: You need to authorize the app on GitHub
- Go to GitHub Settings → Applications → Authorized OAuth Apps
- Make sure your app is listed

## API Rate Limits

| Authentication | Rate Limit | Reset Window |
|----------------|------------|--------------|
| Unauthenticated | 60 requests/hour | 1 hour |
| Authenticated | 5,000 requests/hour | 1 hour |

## OAuth Scopes Explained

- `read:user` - Read user profile information
- `repo` - Full control of repositories (read/write access to public and private repos)
- `read:org` - Read organization membership and team data

You can adjust the scopes in `GITHUB_OAUTH_CONFIG.scope` based on your needs.

## Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub REST API Authentication](https://docs.github.com/en/rest/overview/authenticating-to-the-rest-api)
- [GitHub Rate Limiting](https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api)

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify all configuration steps
3. Test with a Personal Access Token first
4. Check GitHub OAuth app settings

---

**Note**: The current implementation includes a fallback to manually entering a Personal Access Token for development purposes. For production, implement the backend token exchange method.
