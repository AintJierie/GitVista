# GitHub OAuth - Quick Reference

## 🔑 Authentication Status

### Unauthenticated (Default)
- ⚠️ **Rate Limit**: 60 requests/hour
- ❌ **Private Repos**: No access
- 📊 **Data Access**: Public data only

### Authenticated (Signed In)
- ✅ **Rate Limit**: 5,000 requests/hour
- ✅ **Private Repos**: Full access
- ✅ **Data Access**: Public + private data
- ✅ **User Profile**: Displayed in header

## 🚀 Quick Setup (3 Steps)

### For Users:
1. Click "Sign in with GitHub" button
2. Authorize GitVista on GitHub
3. Done! You're authenticated

### For Developers:
1. Create GitHub OAuth App ([Instructions](OAUTH_SETUP_GUIDE.md))
2. Update `app.js` with your Client ID
3. (Optional) Set up backend server for production

## 🎯 Features Enabled by Authentication

| Feature | Unauthenticated | Authenticated |
|---------|----------------|---------------|
| View public profiles | ✅ | ✅ |
| View public repos | ✅ | ✅ |
| View private repos | ❌ | ✅ |
| API requests/hour | 60 | 5,000 |
| Rate limit warnings | Frequent | Rare |
| Session persistence | ❌ | ✅ |

## 📊 Rate Limit Comparison

```
Unauthenticated: 60 requests/hour
├── Profile lookup: ~2 requests
├── Repository list: ~1 request per 100 repos
├── Comparison: ~4 requests
└── Team analysis: ~2 requests per member

Authenticated: 5,000 requests/hour
├── 83x more requests!
├── Analyze 1,000+ profiles per hour
├── No rate limit worries
└── Instant data access
```

## 🔒 Security Features

✅ **OAuth 2.0** - Industry-standard authentication  
✅ **State Validation** - CSRF attack prevention  
✅ **Secure Token Storage** - localStorage with encryption option  
✅ **No Password Storage** - GitHub handles credentials  
✅ **Revocable Access** - Disconnect anytime from GitHub settings  
✅ **Minimal Scopes** - Only requests necessary permissions  

## 🛠️ Development vs Production

### Development (Simple)
```javascript
// Just add your Client ID
const GITHUB_OAUTH_CONFIG = {
  clientId: 'Iv1.YOUR_CLIENT_ID'
  // ...
};
```

### Production (Secure)
```javascript
// Backend server handles token exchange
// Client secret stays secure on server
// See OAUTH_SETUP_GUIDE.md for details
```

## 📱 User Interface Changes

### When Signed Out:
- "Sign in with GitHub" button in header
- Orange "Unauthenticated" badge
- Rate limit shows "/60"
- Info hint about signing in

### When Signed In:
- Your avatar and username in header
- "Sign out" button
- Green "Authenticated" badge
- Rate limit shows "/5000"
- No info hint (you're good!)

## ⚡ Quick Actions

| Action | How To |
|--------|--------|
| Sign In | Click "Sign in with GitHub" button |
| Sign Out | Click "Sign out" button |
| Check Auth Status | Look at rate limit badge |
| Revoke Access | GitHub Settings → Applications → OAuth Apps |
| Use Personal Token | Enter when prompted after OAuth flow |

## 🔄 Token Management

### Automatic (Recommended)
- Tokens stored in localStorage
- Persists across page reloads
- Auto-loads on app startup
- Sign out clears token

### Manual (Testing)
```javascript
// Set token manually (browser console)
localStorage.setItem('github_access_token', 'ghp_yourtoken');
location.reload();

// Clear token
localStorage.removeItem('github_access_token');
location.reload();
```

## 🎓 OAuth Scopes Used

| Scope | Purpose |
|-------|---------|
| `read:user` | Read your basic profile info |
| `repo` | Access public and private repositories |
| `read:org` | Read organization membership |

## 📞 Support

### Common Issues:

**"OAuth state mismatch"**
→ Clear browser cache and try again

**"Rate limit still 60"**
→ Check if token is valid, try signing out/in

**"Can't see private repos"**
→ Ensure `repo` scope is included

**"Authentication failed"**
→ Verify Client ID is correct

### Getting Help:
1. Check [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md)
2. Look at browser console for errors
3. Test with Personal Access Token
4. Verify GitHub OAuth app settings

## 🌟 Pro Tips

1. **For Developers**: Use separate OAuth apps for dev/staging/prod
2. **For Users**: Sign in for the best experience
3. **For Teams**: Each member should authenticate individually
4. **For Testing**: Use Personal Access Token for quick tests
5. **For Production**: Always use backend token exchange

## 📚 Learn More

- [Full Setup Guide](OAUTH_SETUP_GUIDE.md) - Detailed configuration
- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps) - Official documentation
- [Security Best Practices](OAUTH_SETUP_GUIDE.md#security-best-practices) - Keep your app secure

---

**💡 Tip**: Authentication is optional but highly recommended for the best GitVista experience!
