# GitVista Quick Start Guide

## 🚀 Getting Started in 60 Seconds

### Step 1: Open GitVista
Simply open `index.html` in your browser or visit the hosted version.

### Step 2: Search for a Profile
1. Enter a GitHub username (try `torvalds`, `gvanrossum`, or `octocat`)
2. Press `Enter` or click **Analyze Profile**
3. View comprehensive analytics in seconds!

### Step 3: Explore Features
Use the navigation tabs to explore different tools:
- **Analytics Dashboard** - Deep dive into any profile
- **Developer Comparison** - Compare two developers side-by-side
- **Team Metrics** - Analyze entire teams
- **Auto-Labeler** - Learn GitHub automation
- **Release Notes** - Generate release notes automatically

---

## 🎨 Theme Switching

**Toggle Dark Mode:**
- Click the moon/sun icon (🌙/☀️) in the header
- Your preference is automatically saved

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Focus search input |
| `Enter` | Submit search |
| `Escape` | Clear input or close dropdowns |

---

## 🔍 Pro Tips

### 1. Search History
- Click the clock icon (🕐) to see your recent searches
- Click any history item to reload that profile
- Clear history anytime with "Clear All"

### 2. Repository Filtering
- Use the filter box in "Top Repositories" section
- Search by name, language, description, or topic
- Results update instantly

### 3. Load More Repositories
- Initially shows 5 repositories
- Click "Load More" to see additional repos
- Shows count of remaining repositories

### 4. Export Data
- Click the download icon (⬇️) to export analytics
- Downloads complete profile data as JSON
- Perfect for reports and presentations

### 5. Copy URLs
- Hover over repositories to see copy button
- Click "Copy Profile Link" for GitHub profile URL
- One-click copying for easy sharing

---

## 📊 Understanding the Analytics

### Profile Card
- Avatar, name, and bio
- GitHub profile link
- Location (if available)
- Quick copy profile URL button

### Statistics
- **Public Repositories**: Total public repos
- **Followers**: People following the user
- **Following**: People the user follows
- **Public Gists**: Code snippets shared

### Repository Stats
- **Total Stars**: Aggregate stars across all repos
- **Total Forks**: Aggregate forks across all repos
- **Average Size**: Mean repository size in KB

### Top Repositories
- Sorted by stars, forks, or recent updates
- Shows language, metrics, and topics
- Click repo name to open on GitHub
- Filter to find specific repositories

### Language Distribution
- Pie chart showing programming language usage
- Based on primary language per repository
- Hover for detailed percentages

### Recent Activity
- Last 10 updated repositories
- Shows update date and star count
- Quick overview of active projects

---

## 🔄 Developer Comparison

### How to Use:
1. Switch to "Developer Comparison" tab
2. Enter two GitHub usernames
3. Click "Compare Developers"
4. View side-by-side metrics and charts

### What You'll See:
- Profile cards for both developers
- Metric comparison (repos, stars, forks, followers)
- Winner badges for higher metrics
- Visual bar chart comparison
- Top languages for each developer

---

## 👥 Team Metrics

### How to Use:
1. Switch to "Team Metrics" tab
2. Enter team member usernames (comma-separated or one per line)
3. Click "Analyze Team"
4. View aggregated team statistics

### Team Insights:
- Combined team statistics
- Total repositories, stars, forks
- Team language preferences
- Individual member contributions
- Composition breakdown

---

## 🏷️ Auto-Labeler Configuration

### Learning Tool:
- View predefined label mapping patterns
- Copy sample JSON configurations
- See GitHub API examples
- Get GitHub Actions workflow templates

### Quick Copy:
- Click any "Copy" button
- Code is copied to clipboard instantly
- Use in your own repositories

---

## 📝 Release Notes Generator

### How to Use:
1. Switch to "Release Notes" tab
2. Enter repository owner username
3. Enter repository name
4. Optionally specify version number
5. Click "Generate Release Notes"

### Features:
- Automatically categorizes commits
- Extracts contributor information
- Formats as professional markdown
- Copy or download instantly

---

## 🔴 Rate Limits

### Understanding API Limits:
- **Without Authentication**: 60 requests per hour
- **With Authentication**: 5,000 requests per hour
- Check remaining requests in the header

### Tips to Manage:
- Use the built-in 5-minute cache
- Recent searches won't use API calls
- Export data to avoid re-fetching
- Wait an hour if limit exceeded

---

## 📱 Mobile Usage

### Optimized for Mobile:
- Responsive design adapts to small screens
- Horizontal scroll for tabs
- Touch-friendly buttons
- Stacked layouts for better readability

### Mobile Tips:
- Use landscape mode for charts
- Swipe to navigate tabs
- Tap history for recent searches
- Export data for later viewing

---

## 🐛 Troubleshooting

### Issue: "User not found"
**Solution**: Double-check username spelling, try a popular user like `octocat`

### Issue: "Rate limit exceeded"
**Solution**: Wait 1 hour or use authenticated requests (future feature)

### Issue: Charts not displaying
**Solution**: Ensure JavaScript is enabled, check browser console

### Issue: Dark mode not working
**Solution**: Clear browser cache, try incognito mode

### Issue: Export not working
**Solution**: Ensure popups allowed, try different browser

---

## 🎯 Common Use Cases

### 1. Portfolio Review
"I want to showcase my GitHub profile"
- Search your username
- Export analytics as JSON
- Share profile link
- Use for resume/portfolio

### 2. Developer Evaluation
"I'm hiring and need to assess candidates"
- Compare multiple candidates
- Check recent activity
- View language expertise
- Export data for team review

### 3. Team Analysis
"I want to understand my team's strengths"
- Use Team Metrics tool
- Identify language trends
- Find contribution leaders
- Plan skill development

### 4. Competitive Analysis
"I want to see how I compare to others"
- Use Developer Comparison
- Compare metrics head-to-head
- Find areas for improvement
- Set growth goals

### 5. Project Management
"I need to track project activity"
- Monitor recent activity
- Generate release notes
- Track issue counts
- Export for reporting

---

## 💡 Advanced Features

### Caching System
- 5-minute cache for API responses
- Automatic cache expiration
- Faster repeat searches
- Reduced API usage

### Local Storage
- Saves theme preference
- Stores search history (last 10)
- Persists across sessions
- Can be cleared via browser settings

### Performance
- Debounced repository search (300ms)
- Progressive repository loading
- Optimized rendering
- Minimal re-renders

---

## 🔐 Privacy & Security

### Data Privacy:
- ✅ No data sent to external servers
- ✅ All processing in your browser
- ✅ Only accesses public GitHub data
- ✅ No tracking or analytics
- ✅ LocalStorage only for preferences

### Safe to Use:
- Open source code
- Can be self-hosted
- No authentication required
- No personal data collected

---

## 📚 Learning Resources

### GitHub API:
- [GitHub REST API Docs](https://docs.github.com/en/rest)
- [API Rate Limits](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Authentication Guide](https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api)

### Chart.js:
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Chart Types](https://www.chartjs.org/docs/latest/charts/)

---

## 🎓 Best Practices

### Do's:
- ✅ Export data before rate limit expires
- ✅ Use search history for repeat searches
- ✅ Filter repositories for large profiles
- ✅ Toggle dark mode for comfort
- ✅ Copy URLs for easy sharing

### Don'ts:
- ❌ Don't spam API with rapid searches
- ❌ Don't ignore rate limit warnings
- ❌ Don't expect private repo data
- ❌ Don't use for unauthorized purposes

---

## 🚀 Next Steps

1. **Try all tabs** - Explore each feature
2. **Compare yourself** - See your GitHub stats
3. **Analyze your team** - Understand team composition
4. **Export data** - Save your analytics
5. **Share GitVista** - Tell others about it!

---

## 💬 Feedback

Found a bug or have a suggestion?
- Open an issue on GitHub
- Contribute via pull request
- Share your use case
- Star the repository!

---

**Happy Analyzing! 🎉**

*GitVista - Powered by GitHub REST API*
