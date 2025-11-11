# GitVista

A comprehensive GitHub API analytics and automation suite for developers. Analyze profiles, compare developers, track team metrics, learn GitHub automation patterns, and generate release notes—all powered by the GitHub REST API.

<div align="center">

![GitHub](https://img.shields.io/badge/Built_for-GitHub_Developer_Program-181717?style=for-the-badge&logo=github&logoColor=white)
![API](https://img.shields.io/badge/GitHub_API-REST_v3-00ADD8?style=for-the-badge&logo=github&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)

[🚀 Live Demo](#) • [📖 Documentation](DOCS_INDEX.md) • [✨ Features](#features) • [🎓 Developer Program](#github-developer-program)

</div>

---

## 🎯 GitHub Developer Program Integration

GitVista is built for the **GitHub Developer Program** and demonstrates deep integration with GitHub's REST API:

### API Integration Highlights:
- ✅ **5+ GitHub API Endpoints** - Users, repos, commits, releases
- ✅ **Rate Limit Management** - Smart caching and monitoring
- ✅ **Error Handling** - Graceful failures and user feedback  
- ✅ **Real-time Data** - Live GitHub statistics and analytics
- ✅ **Best Practices** - Follows GitHub API guidelines

### Value to GitHub Community:
- 📊 Professional profile analytics for developers
- 🔄 Developer comparison and benchmarking tools
- 👥 Team metrics and composition analysis
- 🏷️ Automation education (auto-labeler patterns)
- 📝 Release notes generation from commits

---

## ✨ What's New (Latest Enhancements)

🎨 **Dark Mode** - Toggle between light and dark themes with persistent preferences  
🕐 **Search History** - Quick access to your last 10 searches  
📊 **Export Analytics** - Download complete profile data as JSON  
🔍 **Repository Search** - Filter repositories by name, language, description, or topics  
⌨️ **Keyboard Shortcuts** - Power user features (Ctrl+K to search, Escape to clear)  
📱 **Mobile Optimized** - Better responsive design for all devices  
⚡ **Performance Boost** - 5-minute API caching for faster repeat searches  
🎯 **Enhanced UX** - Better loading states, notifications, and visual feedback  

[View Complete Enhancement List](ENHANCEMENTS.md) | [Quick Start Guide](QUICK_START.md)

---

✨ Features
📊 Analytics Dashboard
Real-time GitHub profile analysis for any developer

Repository statistics (stars, forks, size, language distribution)

Top repositories ranked by stars and activity

Programming language breakdown visualization

Recent repository activity timeline

Contribution metrics and insights

🔄 Developer Comparison
Compare two GitHub developers side-by-side

Visual metric comparison (repositories, stars, forks, followers)

Identify shared programming languages

Analyze coding patterns and productivity

Highlight strengths of each developer

👥 Team Metrics
Analyze multiple team members simultaneously

Combined team statistics and aggregated metrics

Language preferences across the team

Team composition insights

Contribution leaderboard

Identify team specializations and strengths

🏷️ Auto-Labeler Configuration
Educational tool for GitHub automation

Learn predefined label mapping patterns

View JSON configuration examples

Understand GitHub API automation best practices

Get code snippets ready to use in GitHub Actions

📝 Release Notes Generator
Automatically generate release notes from commits

Categorize commits (Features, Bugfixes, Improvements, Documentation)

Extract contributor information

Format as professional markdown

Copy or download release notes instantly

## 🚀 Quick Start

### Using GitVista Online

1. Open the application in your browser (or run locally with any web server)

**New Feature**: Toggle dark mode using the theme button in the header

Search for any GitHub username in the Analytics Dashboard

**Pro Tip**: Use keyboard shortcut `Ctrl/Cmd + K` to quickly focus search

Navigate between tabs to explore different tools

**New**: Check your search history by clicking the clock icon

Use Developer Comparison to compare two developers

Check Team Metrics to analyze multiple developers

Generate release notes from any repository

**New**: Export your analytics data as JSON using the download button

📖 [Read the Quick Start Guide](QUICK_START.md) for detailed instructions

### No Setup Required

GitVista works entirely in your browser using the public GitHub API. No authentication or backend server needed for basic usage.

🔧 Technologies Used
Frontend: HTML5, CSS3, JavaScript (Vanilla ES6+)

API: GitHub REST API v3

Charts: Chart.js for data visualization

Storage: LocalStorage for preferences and history caching

Performance: In-memory caching with 5-minute expiration

Hosting: Deployable on GitHub Pages, Vercel, Netlify

## 📡 GitHub API Integration

GitVista demonstrates best practices for GitHub API integration:

Endpoints Used
text
GET /users/{username}                 - User profile information
GET /users/{username}/repos           - User repositories
GET /repos/{owner}/{repo}             - Repository details
GET /repos/{owner}/{repo}/commits     - Repository commits
API Features Demonstrated
✅ Real-time data fetching

✅ Error handling and validation

✅ Rate limit monitoring (X-RateLimit headers)

✅ Pagination handling (per_page=100)

✅ Response header parsing

✅ Graceful failure modes

### Rate Limits

- **Unauthenticated requests**: 60 per hour
- **With authentication**: 5,000 per hour

GitVista shows remaining requests for monitoring

📖 How to Use Each Tool
Analytics Dashboard
Enter a GitHub username

View profile card with bio, followers, public repos

See top 5 repositories by stars

Analyze language distribution

Check recent activity

Developer Comparison
Enter first developer's username

Enter second developer's username

View side-by-side comparison of metrics

Identify differences in repositories, stars, followers

See shared programming languages

Team Metrics
Enter multiple usernames (comma-separated or line-by-line)

Click "Analyze Team"

View combined statistics

See team composition by language

Check individual contributions

Auto-Labeler Configuration
Review predefined label mapping rules

Understand pattern matching for issues/PRs

Copy JSON configuration

View API call examples

Learn how to integrate with GitHub Actions

Release Notes Generator
Enter GitHub username

Enter repository name

Click "Generate Release Notes"

View auto-formatted release notes

Copy markdown or download file

🔐 Security & Privacy
No data stored: All processing happens in your browser

Public data only: Only accesses publicly available GitHub information

No authentication required: Uses GitHub's public API

Safe to share: Generate shareable links for specific searches

## 🛠️ Deployment

### Deploy to GitHub Pages

```bash
git clone https://github.com/yourusername/gitvista.git
cd gitvista
# Push to GitHub
git push origin main

# Enable GitHub Pages in repository settings
# Select main branch as source
# Your site will be live at: https://yourusername.github.io/gitvista
```
Deploy to Vercel
bash
npm install -g vercel
vercel
# Follow prompts, select HTML project type
Deploy to Netlify
Drag and drop the project folder to Netlify

Or connect your GitHub repository

Automatic deployments on push

📊 Example Use Cases
Portfolio Building: Analyze your GitHub profile to showcase your best work

Team Evaluation: Compare team members to understand strengths

Recruitment: Analyze candidates' GitHub activity and projects

Learning: Understand GitHub API integration patterns

Automation: Learn how to automate GitHub workflows

🎓 GitHub API Learning
This project is excellent for learning:

GitHub REST API fundamentals

Handling API responses and errors

Rate limit management

Data visualization from API data

Real-time data fetching patterns

Pagination and large dataset handling

## 🤝 Contributing

Have ideas to improve GitVista? Contributions welcome!

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Make your changes

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📝 License
This project is open source and available under the MIT License.

## 🎓 GitHub Developer Program

GitVista is built as part of the **GitHub Developer Program** initiative to create tools that seamlessly integrate with GitHub.

### Why GitVista for GitHub Developer Program?

**API Integration Excellence:**
- Uses 5+ GitHub REST API endpoints
- Demonstrates rate limit management
- Shows error handling best practices
- Implements response caching
- Follows GitHub API guidelines

**Community Value:**
- Helps developers showcase their GitHub profiles
- Enables team analysis and metrics
- Educates about GitHub automation
- Generates professional release notes
- Free and open source

**Technical Quality:**
- Production-ready code
- Comprehensive documentation
- Fully responsive design
- Accessibility compliant
- Performance optimized

### GitHub API Endpoints Used:
```
GET /users/{username}                 - User profile information
GET /users/{username}/repos           - User repositories  
GET /repos/{owner}/{repo}             - Repository details
GET /repos/{owner}/{repo}/commits     - Repository commits
Response Headers                       - Rate limit monitoring
```

### Join the GitHub Developer Program:
Interested in building GitHub integrations? [Learn more about the GitHub Developer Program](https://docs.github.com/en/developers/overview/github-developer-program)

🙏 Acknowledgments
Built with ❤️ for the GitHub Developer Program

Powered by GitHub REST API

Data visualization with Chart.js

Octocat logo used with permission from GitHub

📞 Support
For issues, questions, or suggestions:

Open an issue on GitHub

Check existing documentation

Review GitHub API docs at https://docs.github.com/en/rest
