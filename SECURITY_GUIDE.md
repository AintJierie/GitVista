# Security Guide - Protecting Sensitive Data

## 🔒 What to Keep Secret

### ❌ NEVER Commit These to GitHub:
- GitHub OAuth Client Secret
- Personal Access Tokens (PATs)
- User access tokens
- API keys
- `.env` files with secrets

### ✅ Safe to Commit (Already Public):
- OAuth Client ID (`Iv1.abc123...`)
- Redirect URIs
- GitHub API base URLs
- Frontend code that uses tokens from localStorage

---

## 🎯 Current Implementation (Secure)

GitVista's current setup is **already secure** because:

1. **Client ID is public** - OAuth Client IDs are meant to be public
2. **No secrets in code** - Client Secret is never used in frontend
3. **User-provided tokens** - Users enter their own PAT, stored only in their browser
4. **localStorage only** - Tokens stored locally, never sent to your servers

---

## 🚀 Production Setup (Optional Backend)

For full OAuth flow with automatic token exchange:

### Architecture:
```
User Browser ──► GitHub OAuth ──► Your Backend Server ──► User Browser
                                  (has Client Secret)     (gets token)
```

### Backend Server (Secure):

Already created: `oauth-server.js` handles this!

**Key Points:**
- Client Secret stays on server (never exposed)
- Frontend sends authorization code to backend
- Backend exchanges code for token using secret
- Backend returns token to frontend
- Frontend stores in localStorage

### Environment Variables (.env):
```bash
GITHUB_CLIENT_ID=Iv1.your_client_id_here
GITHUB_CLIENT_SECRET=your_secret_here  # NEVER commit this!
FRONTEND_URL=https://aintjierie.github.io/GitVista
```

### Deploy Backend To:
- **Vercel** (free tier, easy)
- **Netlify Functions** (serverless)
- **Railway** (simple deployment)
- **Heroku** (classic choice)
- **Any Node.js hosting**

---

## 🛡️ Security Checklist

### ✅ Already Done:
- [x] `.gitignore` includes `.env` files
- [x] No tokens hardcoded in source
- [x] Client Secret not used in frontend
- [x] Users provide their own credentials

### 🔐 Additional Best Practices:

#### 1. Keep `.gitignore` Updated
```gitignore
# Already in your .gitignore
.env
.env.local
.env.production
*secret*
*token*
*.pem
*.key
```

#### 2. Use Environment Variables
Never hardcode, always use `.env`:
```javascript
// ❌ BAD
const secret = 'ghp_abc123...';

// ✅ GOOD (backend only)
const secret = process.env.GITHUB_CLIENT_SECRET;
```

#### 3. Validate Before Commit
```powershell
# Check if secrets are in code
git diff --cached | Select-String -Pattern "ghp_|gho_|github_pat_"

# Check all files
grep -r "ghp_" . --exclude-dir=node_modules
```

---

## 🌐 For GitHub Pages (Current Setup)

### What You're Doing Now:
1. User clicks "Sign in with GitHub"
2. Redirected to GitHub OAuth page
3. GitHub asks: "Allow GitVista to access your repos?"
4. User authorizes
5. GitHub redirects back with **code** (not token)
6. Frontend prompts user to enter their PAT manually
7. Token stored in `localStorage` (only on user's machine)

**This is secure!** The PAT never touches your code or servers.

### Alternative: Skip OAuth, Just Use PAT
```javascript
// User action (browser console or UI prompt):
localStorage.setItem('github_access_token', 'ghp_USER_PROVIDED');
```

No OAuth setup needed, just:
1. User generates their own PAT
2. User enters it in browser
3. Stored locally
4. Used for API calls

---

## 🚀 Quick Start: Secure Backend Deployment

### Option 1: Vercel (Recommended - Free & Easy)

1. **Install Vercel CLI:**
```powershell
npm i -g vercel
```

2. **Create `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "oauth-server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "oauth-server.js"
    }
  ],
  "env": {
    "GITHUB_CLIENT_ID": "@github-client-id",
    "GITHUB_CLIENT_SECRET": "@github-client-secret"
  }
}
```

3. **Deploy:**
```powershell
cd oauth-server
vercel --prod
```

4. **Add secrets:**
```powershell
vercel env add GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET
```

5. **Update `app.js`:**
```javascript
// In exchangeCodeForToken function
const response = await fetch('https://your-app.vercel.app/api/github/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code })
});
```

### Option 2: Netlify Functions

1. **Create `netlify/functions/oauth.js`:**
```javascript
const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { code } = JSON.parse(event.body);

  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Token exchange failed' })
    };
  }
};
```

2. **Add to Netlify dashboard:**
- Settings → Environment Variables
- Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

3. **Deploy:**
```powershell
netlify deploy --prod
```

### Option 3: Railway (Simplest)

1. **Create `railway.json`:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node oauth-server.js"
  }
}
```

2. **Deploy:**
```powershell
railway login
railway init
railway up
```

3. **Add secrets in Railway dashboard**

---

## 📊 Token Security Comparison

| Method | Security | Ease | Best For |
|--------|----------|------|----------|
| **Manual PAT** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Personal use, demos |
| **OAuth + Backend** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Production apps |
| **OAuth Frontend Only** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Prototypes (your current) |
| **Hardcoded Tokens** | ❌ NEVER | - | Never use! |

---

## 🔍 How to Check for Exposed Secrets

### Before Every Commit:
```powershell
# Search for potential secrets
git diff | Select-String "ghp_|ghs_|gho_|github_pat_|secret"

# Check all files
Get-ChildItem -Recurse -File | Select-String "ghp_" | Select-Object Path, LineNumber
```

### Use Git Hooks (Auto-check):
Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
if git diff --cached | grep -E "ghp_|ghs_|gho_|github_pat_"; then
  echo "❌ ERROR: Potential secret detected!"
  echo "Remove secrets before committing"
  exit 1
fi
```

### GitHub Secret Scanning:
GitHub automatically scans for exposed tokens and will:
- Revoke exposed tokens
- Email you warnings
- Create security alerts

---

## 💡 Best Practices Summary

### ✅ DO:
1. Use environment variables for secrets
2. Add `.env` to `.gitignore`
3. Let users provide their own PATs
4. Use backend for Client Secret
5. Rotate tokens regularly
6. Use minimal scopes needed

### ❌ DON'T:
1. Commit secrets to Git
2. Hardcode tokens in code
3. Share tokens in public
4. Use root tokens (use scoped)
5. Store secrets in frontend code
6. Log tokens to console

---

## 🆘 If You Accidentally Commit a Secret

### Immediate Actions:

1. **Revoke the token immediately:**
   - Go to: https://github.com/settings/tokens
   - Find and delete the exposed token

2. **Remove from Git history:**
```powershell
# Use BFG Repo-Cleaner
git clone --mirror https://github.com/AintJierie/GitVista.git
bfg --replace-text passwords.txt GitVista.git
cd GitVista.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

3. **Alternative (smaller commits):**
```powershell
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

4. **Notify team** if collaborative project

5. **Generate new tokens** with fresh secrets

---

## 📚 Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OAuth Best Practices](https://www.oauth.com/oauth2-servers/oauth-best-practices/)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

## ✅ Your Current Setup is Secure!

GitVista's current implementation:
- ✅ No secrets in code
- ✅ Users provide own credentials
- ✅ Tokens stored locally only
- ✅ `.gitignore` protects secrets
- ✅ Ready for production backend upgrade

**You're good to go!** The frontend code is safe to push to GitHub.
