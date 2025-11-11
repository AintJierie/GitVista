# OAuth Testing & Validation Guide

## 🧪 Pre-Implementation Checklist

Before testing OAuth:
- [ ] GitHub OAuth App created
- [ ] Client ID copied to `app.js`
- [ ] Redirect URI configured correctly
- [ ] Application accessible via the redirect URI URL
- [ ] Browser console open for debugging

## 🎯 Testing Scenarios

### Scenario 1: First-Time Sign In (Unauthenticated User)

**Steps:**
1. Open GitVista in browser
2. Verify you see "Sign in with GitHub" button
3. Check rate limit shows "Unauthenticated" badge
4. Rate limit should show "/60"

**Expected Result:**
- ✅ Orange "Unauthenticated" badge visible
- ✅ Rate limit shows "-- / 60"
- ✅ Info hint: "💡 Sign in with GitHub for 5,000 requests/hour"
- ✅ Login button in header
- ✅ No logout button visible

**Visual:**
```
Header: [GitVista] [Sign in with GitHub] [🌙] [🕐] [📥]
Rate:   [⏱️] [Unauthenticated] API Limit: 45 / 60 remaining
        💡 Sign in with GitHub for 5,000 requests/hour
```

---

### Scenario 2: OAuth Authorization Flow

**Steps:**
1. Click "Sign in with GitHub"
2. Browser redirects to GitHub
3. Review permissions requested
4. Click "Authorize [YourAppName]"
5. Redirect back to GitVista

**Expected Result:**
- ✅ Redirects to github.com/login/oauth/authorize
- ✅ Shows app name and permissions
- ✅ After authorization, redirects back to your app
- ✅ URL contains `?code=...&state=...`

**What to Check:**
```
URL structure:
https://github.com/login/oauth/authorize?
  client_id=YOUR_CLIENT_ID
  &redirect_uri=http://localhost:5500
  &scope=read:user,repo,read:org
  &state=RANDOM_STRING
  &allow_signup=true
```

---

### Scenario 3: Token Exchange (Development Mode)

**Steps:**
1. After GitHub redirect, you'll see a prompt
2. Prompt asks for Personal Access Token
3. Enter your GitHub Personal Access Token
4. Click OK

**Expected Result:**
- ✅ Prompt appears with instructions
- ✅ After entering token, page updates
- ✅ Authentication completes

**Note:** In production with backend, this step is automatic.

---

### Scenario 4: Authenticated State

**Steps:**
1. After successful authentication
2. Check UI updates

**Expected Result:**
- ✅ Green "Authenticated" badge visible
- ✅ Rate limit shows "-- / 5000"
- ✅ User avatar appears in header
- ✅ Username displayed next to avatar
- ✅ "Sign out" button visible
- ✅ "Sign in" button hidden
- ✅ Info hint is hidden
- ✅ Rate limit container has green background

**Visual:**
```
Header: [GitVista] [👤 octocat] [Sign out] [🌙] [🕐] [📥]
Rate:   [⏱️] [Authenticated] API Limit: 4,987 / 5,000 remaining
```

---

### Scenario 5: API Calls with Authentication

**Steps:**
1. While authenticated, search for a user
2. Enter username (e.g., "octocat")
3. Click "Analyze Profile"

**Expected Result:**
- ✅ Profile loads successfully
- ✅ Rate limit decreases
- ✅ Can see private repos (if you're the user)
- ✅ No rate limit errors
- ✅ Fast response times

**Browser Console:**
```javascript
// Should see Authorization header in requests
Request Headers:
  Authorization: Bearer ghp_xxxxxxxxxxxx
  Accept: application/vnd.github.v3+json
```

---

### Scenario 6: Session Persistence

**Steps:**
1. While authenticated, refresh the page
2. Wait for page to load

**Expected Result:**
- ✅ Still authenticated after refresh
- ✅ User info still displayed
- ✅ Token loaded from localStorage
- ✅ API calls still work

**localStorage Check:**
```javascript
// In browser console
localStorage.getItem('github_access_token')
// Should return: "ghp_xxxxxxxxxxxx..."
```

---

### Scenario 7: Sign Out

**Steps:**
1. While authenticated, click "Sign out"
2. Confirm in dialog

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ After confirm, authentication cleared
- ✅ Back to unauthenticated state
- ✅ Token removed from localStorage
- ✅ Rate limit shows /60 again
- ✅ User info hidden

**Visual:**
```
Before: [👤 octocat] [Sign out]
After:  [Sign in with GitHub]
```

---

### Scenario 8: Rate Limit Monitoring

**Steps:**
1. Make several API calls
2. Watch rate limit counter

**Expected Result:**
- ✅ Counter decreases with each request
- ✅ Shows accurate remaining requests
- ✅ Updates in real-time

**Testing:**
```
Initial:  5000 / 5000
After 1:  4999 / 5000
After 5:  4995 / 5000
After 10: 4990 / 5000
```

---

## 🔍 Validation Points

### Browser Console Checks

**1. Check OAuth Config:**
```javascript
console.log(GITHUB_OAUTH_CONFIG);
// Should show:
// {
//   clientId: "Iv1.xxxxx...",
//   redirectUri: "http://localhost:5500",
//   scope: "read:user,repo,read:org",
//   authUrl: "https://github.com/login/oauth/authorize"
// }
```

**2. Check Authentication State:**
```javascript
console.log('Authenticated:', isAuthenticated);
console.log('Token:', accessToken);
console.log('User:', authenticatedUser);
// Should show your auth status and user object
```

**3. Check localStorage:**
```javascript
console.log(localStorage.getItem('github_access_token'));
// Should show token when authenticated, null when not
```

**4. Check Rate Limit:**
```javascript
console.log(rateLimitInfo);
// Should show: { remaining: 4987, limit: 5000 }
```

### Network Tab Checks

**1. OAuth Redirect:**
```
Request URL: https://github.com/login/oauth/authorize?...
Method: GET
Status: 302 (redirect)
```

**2. User Data Fetch:**
```
Request URL: https://api.github.com/user
Method: GET
Status: 200
Headers:
  Authorization: Bearer ghp_xxxxx
```

**3. Rate Limit Headers:**
```
Response Headers:
  X-RateLimit-Limit: 5000
  X-RateLimit-Remaining: 4987
  X-RateLimit-Reset: 1234567890
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "OAuth state mismatch"

**Symptoms:**
- Error message appears after redirect
- Authentication fails

**Solution:**
```javascript
// Clear sessionStorage
sessionStorage.clear();
// Try signing in again
```

---

### Issue 2: "No access token received"

**Symptoms:**
- Token prompt doesn't appear
- Console shows error

**Solution:**
- Check that redirect URI matches exactly
- Verify Client ID is correct
- Check GitHub OAuth app settings

---

### Issue 3: Rate limit still shows 60

**Symptoms:**
- Authenticated but limit shows /60
- API calls fail with rate limit

**Solution:**
```javascript
// Check token is valid
localStorage.getItem('github_access_token');
// Try signing out and back in
// Check token has correct scopes
```

---

### Issue 4: Avatar/username not showing

**Symptoms:**
- Authenticated but no user info
- Empty space in header

**Solution:**
- Check browser console for errors
- Verify user data fetch succeeded
- Check HTML elements exist (IDs correct)

---

### Issue 5: Token not persisting

**Symptoms:**
- Lose authentication on refresh
- Have to sign in every time

**Solution:**
```javascript
// Check localStorage is enabled
if (typeof(Storage) !== "undefined") {
  console.log("localStorage supported");
} else {
  console.log("localStorage NOT supported");
}
// Check browser privacy settings
// Disable "Clear cookies on exit"
```

---

## ✅ Acceptance Criteria

The OAuth integration is successful when:

### Functionality
- [ ] ✅ Can initiate OAuth flow
- [ ] ✅ Can authorize on GitHub
- [ ] ✅ Can receive and store token
- [ ] ✅ Can fetch authenticated user data
- [ ] ✅ Can make authenticated API calls
- [ ] ✅ Can sign out and clear token
- [ ] ✅ Token persists across page reloads

### UI/UX
- [ ] ✅ Shows correct auth state
- [ ] ✅ Displays user avatar and name
- [ ] ✅ Updates rate limit display
- [ ] ✅ Shows appropriate badges
- [ ] ✅ Hides/shows correct buttons
- [ ] ✅ Displays notifications

### Security
- [ ] ✅ State parameter validates
- [ ] ✅ Token stored securely
- [ ] ✅ No secrets in client code
- [ ] ✅ Minimal scopes requested
- [ ] ✅ Logout clears everything

### Performance
- [ ] ✅ Fast authentication flow
- [ ] ✅ No unnecessary API calls
- [ ] ✅ Rate limit respected
- [ ] ✅ Caching works correctly

---

## 📊 Performance Testing

### Rate Limit Test

**Unauthenticated:**
```javascript
// Make 60 requests rapidly
// Should hit rate limit
// Verify error handling
```

**Authenticated:**
```javascript
// Make 100+ requests
// Should have no issues
// Verify counter accuracy
```

### Load Time Test

**Without Auth:**
```
Initial load: ~2s
API call: ~500ms
Total: ~2.5s
```

**With Auth:**
```
Initial load: ~2s
Token validation: ~300ms
API call: ~400ms
Total: ~2.7s
```

---

## 🎓 Learning & Verification

### For Students
Test your understanding:
1. Can you explain the OAuth flow?
2. Why is state parameter important?
3. What are the security considerations?
4. How does token storage work?
5. What happens on page refresh?

### For Developers
Verify you can:
1. Set up GitHub OAuth App
2. Configure client application
3. Implement OAuth flow
4. Handle token management
5. Update UI based on auth state
6. Debug authentication issues

---

## 📝 Test Report Template

```markdown
# OAuth Testing Report

Date: [DATE]
Tester: [NAME]
Browser: [Chrome/Firefox/Safari/Edge]
Version: [VERSION]

## Test Results

### Scenario 1: First-Time Sign In
- Status: [PASS/FAIL]
- Notes: 

### Scenario 2: OAuth Flow
- Status: [PASS/FAIL]
- Notes:

### Scenario 3: Token Exchange
- Status: [PASS/FAIL]
- Notes:

### Scenario 4: Authenticated State
- Status: [PASS/FAIL]
- Notes:

### Scenario 5: API Calls
- Status: [PASS/FAIL]
- Notes:

### Scenario 6: Session Persistence
- Status: [PASS/FAIL]
- Notes:

### Scenario 7: Sign Out
- Status: [PASS/FAIL]
- Notes:

### Scenario 8: Rate Limit
- Status: [PASS/FAIL]
- Notes:

## Issues Found
1. [Issue description]
2. [Issue description]

## Overall Assessment
- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major fixes

## Recommendations
[Your recommendations]
```

---

## 🚀 Ready for Production?

Before deploying to production:
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Backend server set up (recommended)
- [ ] Environment variables configured
- [ ] Security review completed
- [ ] Documentation reviewed
- [ ] Rate limits monitored

---

**Happy Testing! 🎉**

If all tests pass, your OAuth integration is ready to impress! 🌟
