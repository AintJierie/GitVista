// GitHub API Configuration
const GITHUB_API_BASE = 'https://api.github.com';

// State Management
let currentUsername = '';
let allRepositories = [];
let filteredRepositories = [];
let displayedReposCount = 5;
let languageChart = null;
let comparisonChart = null;
let teamChart = null;
let currentTab = 'analytics';
let rateLimitInfo = { remaining: 60, limit: 60 };
let searchHistory = [];
let currentTheme = 'light';
let repoSortBy = 'stars';
let debounceTimer = null;

// Cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// DOM Elements - Analytics
const usernameInput = document.getElementById('username-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const dashboard = document.getElementById('dashboard');
const copyProfileBtn = document.getElementById('copy-profile-btn');
const clearSearchBtn = document.getElementById('clear-search-btn');
const repoSearchInput = document.getElementById('repo-search');
const loadMoreReposBtn = document.getElementById('load-more-repos');

// DOM Elements - Navigation & Theme
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');
const themeToggle = document.getElementById('theme-toggle');
const historyToggle = document.getElementById('history-toggle');
const historyDropdown = document.getElementById('history-dropdown');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const exportDataBtn = document.getElementById('export-data-btn');

// DOM Elements - Comparison
const dev1Input = document.getElementById('dev1-input');
const dev2Input = document.getElementById('dev2-input');
const compareBtn = document.getElementById('compare-btn');
const comparisonResults = document.getElementById('comparison-results');

// DOM Elements - Team
const teamInput = document.getElementById('team-input');
const analyzeTeamBtn = document.getElementById('analyze-team-btn');
const teamResults = document.getElementById('team-results');

// DOM Elements - Release
const releaseUsernameInput = document.getElementById('release-username');
const releaseRepoInput = document.getElementById('release-repo');
const releaseVersionInput = document.getElementById('release-version');
const generateReleaseBtn = document.getElementById('generate-release-btn');
const releaseResults = document.getElementById('release-results');

// Initialize App
function init() {
  // Load saved preferences
  loadPreferences();
  
  // Apply saved theme
  applyTheme(currentTheme);
  
  // Navigation tabs
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Analytics Dashboard
  searchBtn.addEventListener('click', handleSearch);
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  usernameInput.addEventListener('input', handleSearchInput);
  clearSearchBtn.addEventListener('click', clearSearch);
  copyProfileBtn.addEventListener('click', copyProfileLink);
  
  // Repository filtering and sorting
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', handleFilterChange);
  });
  repoSearchInput.addEventListener('input', handleRepoSearch);
  loadMoreReposBtn.addEventListener('click', loadMoreRepositories);

  // Theme and History
  themeToggle.addEventListener('click', toggleTheme);
  historyToggle.addEventListener('click', toggleHistoryDropdown);
  clearHistoryBtn.addEventListener('click', clearSearchHistory);
  exportDataBtn.addEventListener('click', exportAnalyticsData);
  
  // Close history dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!historyToggle.contains(e.target) && !historyDropdown.contains(e.target)) {
      historyDropdown.classList.add('hidden');
    }
  });

  // Developer Comparison
  compareBtn.addEventListener('click', handleComparison);
  dev1Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleComparison();
  });
  dev2Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleComparison();
  });

  // Team Metrics
  analyzeTeamBtn.addEventListener('click', handleTeamAnalysis);

  // Auto-Labeler (copy buttons)
  document.querySelectorAll('.copy-code-btn').forEach(btn => {
    btn.addEventListener('click', () => copyCode(btn.dataset.target));
  });

  // Release Notes Generator
  generateReleaseBtn.addEventListener('click', handleReleaseGeneration);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Check rate limit on load
  checkRateLimit();

  // Auto-search default username
  if (usernameInput.value) {
    handleSearch();
  }
  
  // Update search history display
  updateHistoryDisplay();
}

// Load preferences from localStorage
function loadPreferences() {
  try {
    const savedTheme = localStorage.getItem('gitvista_theme');
    if (savedTheme) currentTheme = savedTheme;
    
    const savedHistory = localStorage.getItem('gitvista_history');
    if (savedHistory) searchHistory = JSON.parse(savedHistory);
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
}

// Save preferences to localStorage
function savePreferences() {
  try {
    localStorage.setItem('gitvista_theme', currentTheme);
    localStorage.setItem('gitvista_history', JSON.stringify(searchHistory));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

// Theme Management
function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(currentTheme);
  savePreferences();
  
  // Update button icon
  const icon = themeToggle.querySelector('svg path');
  if (currentTheme === 'dark') {
    icon.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
  } else {
    icon.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
  }
  
  // Recreate charts with new theme colors
  if (languageChart) {
    displayLanguageBreakdown(allRepositories);
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// Search History Management
function addToHistory(username) {
  // Remove if already exists
  searchHistory = searchHistory.filter(item => item.username !== username);
  
  // Add to beginning
  searchHistory.unshift({
    username,
    timestamp: Date.now(),
    url: `https://github.com/${username}`
  });
  
  // Keep only last 10
  searchHistory = searchHistory.slice(0, 10);
  
  savePreferences();
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  if (searchHistory.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No recent searches</div>';
    return;
  }
  
  historyList.innerHTML = searchHistory.map(item => `
    <div class="history-item" data-username="${item.username}">
      <div class="history-item-info">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span class="history-username">${item.username}</span>
      </div>
      <span class="history-time">${formatTimeAgo(item.timestamp)}</span>
    </div>
  `).join('');
  
  // Add click handlers
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const username = item.dataset.username;
      usernameInput.value = username;
      historyDropdown.classList.add('hidden');
      handleSearch();
    });
  });
}

function toggleHistoryDropdown() {
  historyDropdown.classList.toggle('hidden');
}

function clearSearchHistory() {
  if (confirm('Clear all search history?')) {
    searchHistory = [];
    savePreferences();
    updateHistoryDisplay();
  }
}

// Handle search input changes
function handleSearchInput() {
  if (usernameInput.value.trim()) {
    clearSearchBtn.classList.remove('hidden');
  } else {
    clearSearchBtn.classList.add('hidden');
  }
}

function clearSearch() {
  usernameInput.value = '';
  clearSearchBtn.classList.add('hidden');
  usernameInput.focus();
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + K: Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (currentTab === 'analytics') {
      usernameInput.focus();
      usernameInput.select();
    }
  }
  
  // Escape: Clear search or close modals
  if (e.key === 'Escape') {
    if (!historyDropdown.classList.contains('hidden')) {
      historyDropdown.classList.add('hidden');
    } else if (document.activeElement === usernameInput) {
      usernameInput.blur();
    }
  }
}

// Tab Switching
function switchTab(tabName) {
  currentTab = tabName;
  
  navTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabName}`);
  });
}

// Handle Search
async function handleSearch() {
  const username = usernameInput.value.trim();
  
  if (!username) {
    showError('Please enter a GitHub username');
    return;
  }

  currentUsername = username;
  displayedReposCount = 5;
  showLoading();
  hideError();
  hideDashboard();

  try {
    // Check cache first
    const cacheKey = `user_${username}`;
    const cached = getCachedData(cacheKey);
    
    let userData, reposData;
    
    if (cached) {
      userData = cached.userData;
      reposData = cached.reposData;
    } else {
      // Fetch user data and repositories in parallel
      [userData, reposData] = await Promise.all([
        fetchUserData(username),
        fetchUserRepositories(username)
      ]);
      
      // Cache the results
      setCachedData(cacheKey, { userData, reposData });
    }

    allRepositories = reposData;
    filteredRepositories = reposData;
    
    displayUserProfile(userData);
    displayRepositoryStats(reposData);
    displayTopRepositories(reposData, repoSortBy);
    displayLanguageBreakdown(reposData);
    displayRecentActivity(reposData);
    
    // Add to search history
    addToHistory(username);
    
    hideLoading();
    showDashboard();
    
    // Show success notification
    showNotification(`Successfully loaded ${username}'s profile`, 'success');
  } catch (error) {
    hideLoading();
    showError(error.message);
  }
}

// Cache management
function getCachedData(key) {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  apiCache.delete(key);
  return null;
}

function setCachedData(key, data) {
  apiCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<circle cx="12" cy="12" r="10"></circle>'}
      </svg>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('notification--show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('notification--show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Fetch User Data
async function fetchUserData(username) {
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}`);
  updateRateLimit(response);
  
  if (response.status === 404) {
    throw new Error('User not found. Please check the username and try again.');
  }
  
  if (response.status === 403) {
    throw new Error('GitHub API rate limit exceeded. Please try again later.');
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch user data. Please try again.');
  }
  
  return await response.json();
}

// Fetch User Repositories
async function fetchUserRepositories(username) {
  const response = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated`);
  updateRateLimit(response);
  
  if (response.status === 403) {
    throw new Error('GitHub API rate limit exceeded. Please try again later.');
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch repositories. Please try again.');
  }
  
  return await response.json();
}

// Display User Profile
function displayUserProfile(user) {
  document.getElementById('user-avatar').src = user.avatar_url;
  document.getElementById('user-name').textContent = user.name || user.login;
  document.getElementById('user-link').href = user.html_url;
  document.getElementById('user-link').textContent = `@${user.login}`;
  
  const bioElement = document.getElementById('user-bio');
  if (user.bio) {
    bioElement.textContent = user.bio;
    bioElement.style.display = 'block';
  } else {
    bioElement.style.display = 'none';
  }
  
  const locationElement = document.getElementById('user-location');
  if (user.location) {
    locationElement.textContent = `📍 ${user.location}`;
    locationElement.classList.remove('hidden');
  } else {
    locationElement.classList.add('hidden');
  }
  
  document.getElementById('stat-repos').textContent = formatNumber(user.public_repos);
  document.getElementById('stat-followers').textContent = formatNumber(user.followers);
  document.getElementById('stat-following').textContent = formatNumber(user.following);
  document.getElementById('stat-gists').textContent = formatNumber(user.public_gists);
}

// Display Repository Statistics
function displayRepositoryStats(repos) {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalSize = repos.reduce((sum, repo) => sum + repo.size, 0);
  const avgSize = repos.length > 0 ? Math.round(totalSize / repos.length) : 0;
  
  document.getElementById('total-stars').textContent = formatNumber(totalStars);
  document.getElementById('total-forks').textContent = formatNumber(totalForks);
  document.getElementById('avg-size').textContent = `${formatNumber(avgSize)} KB`;
}

// Display Top Repositories
function displayTopRepositories(repos, sortBy = 'stars') {
  repoSortBy = sortBy;
  
  const sortedRepos = [...repos].sort((a, b) => {
    if (sortBy === 'stars') {
      return b.stargazers_count - a.stargazers_count;
    } else if (sortBy === 'forks') {
      return b.forks_count - a.forks_count;
    } else if (sortBy === 'updated') {
      return new Date(b.updated_at) - new Date(a.updated_at);
    }
    return 0;
  });
  
  filteredRepositories = sortedRepos;
  renderRepositories();
}

function renderRepositories() {
  const reposToShow = filteredRepositories.slice(0, displayedReposCount);
  const reposContainer = document.getElementById('top-repos');
  
  if (filteredRepositories.length === 0) {
    reposContainer.innerHTML = '<div class="empty-state">No repositories found</div>';
    loadMoreReposBtn.classList.add('hidden');
    return;
  }
  
  reposContainer.innerHTML = reposToShow.map(repo => `
    <div class="repo-item card">
      <div class="repo-header">
        <div class="repo-main-info">
          <a href="${repo.html_url}" target="_blank" class="repo-name">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            ${repo.name}
          </a>
          ${repo.private ? '<span class="badge badge--private">Private</span>' : ''}
          ${repo.fork ? '<span class="badge badge--fork">Fork</span>' : ''}
          <p class="repo-description">${repo.description || 'No description provided'}</p>
        </div>
        <button class="btn btn--icon btn--ghost copy-repo-btn" data-url="${repo.html_url}" title="Copy repository URL">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      <div class="repo-meta">
        ${repo.language ? `
          <div class="language-badge">
            <span class="language-dot" style="background-color: ${getLanguageColor(repo.language)}"></span>
            ${repo.language}
          </div>
        ` : ''}
        <div class="repo-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          ${formatNumber(repo.stargazers_count)}
        </div>
        <div class="repo-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          ${formatNumber(repo.forks_count)}
        </div>
        ${repo.open_issues_count > 0 ? `
          <div class="repo-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            ${formatNumber(repo.open_issues_count)} issues
          </div>
        ` : ''}
        <div class="repo-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${formatDate(repo.updated_at)}
        </div>
      </div>
      ${repo.topics && repo.topics.length > 0 ? `
        <div class="repo-topics">
          ${repo.topics.slice(0, 5).map(topic => `
            <span class="topic-tag">${topic}</span>
          `).join('')}
          ${repo.topics.length > 5 ? `<span class="topic-tag">+${repo.topics.length - 5}</span>` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');
  
  // Add copy button handlers
  document.querySelectorAll('.copy-repo-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.dataset.url;
      copyToClipboard(url, 'Repository URL copied!');
    });
  });
  
  // Show/hide load more button
  if (filteredRepositories.length > displayedReposCount) {
    loadMoreReposBtn.classList.remove('hidden');
    loadMoreReposBtn.textContent = `Load More (${filteredRepositories.length - displayedReposCount} remaining)`;
  } else {
    loadMoreReposBtn.classList.add('hidden');
  }
}

function loadMoreRepositories() {
  displayedReposCount += 5;
  renderRepositories();
}

// Handle repository search/filter
function handleRepoSearch(e) {
  clearTimeout(debounceTimer);
  
  debounceTimer = setTimeout(() => {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
      filteredRepositories = [...allRepositories].sort((a, b) => {
        if (repoSortBy === 'stars') return b.stargazers_count - a.stargazers_count;
        if (repoSortBy === 'forks') return b.forks_count - a.forks_count;
        if (repoSortBy === 'updated') return new Date(b.updated_at) - new Date(a.updated_at);
        return 0;
      });
    } else {
      filteredRepositories = allRepositories.filter(repo => {
        return repo.name.toLowerCase().includes(query) ||
               (repo.description && repo.description.toLowerCase().includes(query)) ||
               (repo.language && repo.language.toLowerCase().includes(query)) ||
               (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(query)));
      });
    }
    
    displayedReposCount = 5;
    renderRepositories();
  }, 300);
}

// Display Language Breakdown
function displayLanguageBreakdown(repos) {
  const languageCounts = {};
  
  repos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });
  
  const sortedLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  const labels = sortedLanguages.map(([lang]) => lang);
  const data = sortedLanguages.map(([, count]) => count);
  const colors = labels.map(lang => getLanguageColor(lang));
  
  const ctx = document.getElementById('language-chart');
  
  // Destroy existing chart if it exists
  if (languageChart) {
    languageChart.destroy();
  }
  
  languageChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface').trim()
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--color-text').trim(),
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} repos (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Display Recent Activity
function displayRecentActivity(repos) {
  const recentRepos = [...repos]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 10);
  
  const activityContainer = document.getElementById('recent-activity');
  
  activityContainer.innerHTML = recentRepos.map(repo => `
    <div class="activity-item card">
      <div class="activity-info">
        <div class="activity-repo-name">${repo.name}</div>
        <div class="activity-date">Updated ${formatDate(repo.updated_at)}</div>
      </div>
      <div class="activity-stars">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        ${formatNumber(repo.stargazers_count)}
      </div>
    </div>
  `).join('');
}

// Handle Filter Change
function handleFilterChange(e) {
  const sortBy = e.target.dataset.sort;
  
  // Update active state
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  e.target.classList.add('active');
  
  // Reset displayed count and re-display repositories with new sort
  displayedReposCount = 5;
  displayTopRepositories(allRepositories, sortBy);
}

// Export analytics data
async function exportAnalyticsData() {
  if (!currentUsername || allRepositories.length === 0) {
    showNotification('No data to export. Please analyze a profile first.', 'error');
    return;
  }
  
  try {
    const userData = {
      username: currentUsername,
      exportDate: new Date().toISOString(),
      profile: {
        name: document.getElementById('user-name').textContent,
        bio: document.getElementById('user-bio').textContent,
        location: document.getElementById('user-location').textContent,
        publicRepos: document.getElementById('stat-repos').textContent,
        followers: document.getElementById('stat-followers').textContent,
        following: document.getElementById('stat-following').textContent,
        publicGists: document.getElementById('stat-gists').textContent
      },
      statistics: {
        totalStars: document.getElementById('total-stars').textContent,
        totalForks: document.getElementById('total-forks').textContent,
        avgSize: document.getElementById('avg-size').textContent
      },
      repositories: allRepositories.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        url: repo.html_url,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        topics: repo.topics
      }))
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `gitpulse-${currentUsername}-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Analytics data exported successfully!', 'success');
  } catch (error) {
    showNotification('Failed to export data', 'error');
    console.error('Export error:', error);
  }
}

// Helper function for copying to clipboard
function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showNotification(successMessage, 'success');
  } catch (error) {
    showNotification('Failed to copy', 'error');
  }
  
  document.body.removeChild(textarea);
}

// Copy Profile Link
function copyProfileLink() {
  const profileUrl = `https://github.com/${currentUsername}`;
  
  // Create temporary textarea to copy text
  const textarea = document.createElement('textarea');
  textarea.value = profileUrl;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    
    // Update button text temporarily
    const originalHTML = copyProfileBtn.innerHTML;
    copyProfileBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Copied!
    `;
    
    setTimeout(() => {
      copyProfileBtn.innerHTML = originalHTML;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
  
  document.body.removeChild(textarea);
}

// Utility Functions
function showLoading() {
  loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
}

function showError(message) {
  errorText.textContent = message;
  errorMessage.classList.remove('hidden');
}

function hideError() {
  errorMessage.classList.add('hidden');
}

function showDashboard() {
  dashboard.classList.remove('hidden');
}

function hideDashboard() {
  dashboard.classList.add('hidden');
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

function getLanguageColor(language) {
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C': '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Dart': '#00B4AB',
    'Shell': '#89e051',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Vue': '#41b883',
    'React': '#61dafb',
    'Jupyter Notebook': '#DA5B0B',
    'Makefile': '#427819',
    'Objective-C': '#438eff',
    'Assembly': '#6E4C13',
    'Perl': '#0298c3',
    'Lua': '#000080',
    'R': '#198CE7',
    'Scala': '#c22d40',
    'Haskell': '#5e5086',
    'Elixir': '#6e4a7e',
    'Clojure': '#db5855'
  };
  
  return colors[language] || '#1FB8CD';
}

// Rate Limit Management
function updateRateLimit(response) {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const limit = response.headers.get('X-RateLimit-Limit');
  
  if (remaining && limit) {
    rateLimitInfo.remaining = parseInt(remaining);
    rateLimitInfo.limit = parseInt(limit);
    displayRateLimit();
  }
}

function displayRateLimit() {
  document.getElementById('rate-limit-remaining').textContent = rateLimitInfo.remaining;
  document.getElementById('rate-limit-total').textContent = rateLimitInfo.limit;
  
  const container = document.querySelector('.rate-limit-container');
  if (rateLimitInfo.remaining < 10) {
    container.style.background = 'rgba(192, 21, 47, 0.1)';
  } else if (rateLimitInfo.remaining < 30) {
    container.style.background = 'var(--color-bg-6)';
  }
}

async function checkRateLimit() {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`);
    const data = await response.json();
    rateLimitInfo.remaining = data.rate.remaining;
    rateLimitInfo.limit = data.rate.limit;
    displayRateLimit();
  } catch (error) {
    console.error('Failed to check rate limit:', error);
  }
}

// TOOL 2: Developer Comparison
async function handleComparison() {
  const username1 = dev1Input.value.trim();
  const username2 = dev2Input.value.trim();
  
  if (!username1 || !username2) {
    alert('Please enter both developer usernames');
    return;
  }
  
  comparisonResults.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Comparing developers...</p></div>';
  comparisonResults.classList.remove('hidden');
  
  try {
    const [dev1Data, dev1Repos, dev2Data, dev2Repos] = await Promise.all([
      fetchUserData(username1),
      fetchUserRepositories(username1),
      fetchUserData(username2),
      fetchUserRepositories(username2)
    ]);
    
    displayComparison(dev1Data, dev1Repos, dev2Data, dev2Repos);
  } catch (error) {
    comparisonResults.innerHTML = `<div class="error-message"><div class="error-content"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>${error.message}</span></div></div>`;
  }
}

function displayComparison(dev1, repos1, dev2, repos2) {
  const stats1 = calculateStats(repos1);
  const stats2 = calculateStats(repos2);
  
  const html = `
    <h2 class="section-title">Developer Comparison</h2>
    
    <div class="comparison-grid">
      <div class="developer-card card">
        <div class="dev-header">
          <img src="${dev1.avatar_url}" alt="${dev1.login}" class="dev-avatar">
          <div>
            <h3>${dev1.name || dev1.login}</h3>
            <a href="${dev1.html_url}" target="_blank">@${dev1.login}</a>
          </div>
        </div>
        <div class="dev-stats">
          <div class="dev-stat-row">
            <span>Repositories</span>
            <strong>${dev1.public_repos} ${dev1.public_repos > dev2.public_repos ? '<span class="winner-badge">👑 Higher</span>' : ''}</strong>
          </div>
          <div class="dev-stat-row">
            <span>Total Stars</span>
            <strong>${formatNumber(stats1.totalStars)} ${stats1.totalStars > stats2.totalStars ? '<span class="winner-badge">👑 Higher</span>' : ''}</strong>
          </div>
          <div class="dev-stat-row">
            <span>Total Forks</span>
            <strong>${formatNumber(stats1.totalForks)} ${stats1.totalForks > stats2.totalForks ? '<span class="winner-badge">👑 Higher</span>' : ''}</strong>
          </div>
          <div class="dev-stat-row">
            <span>Followers</span>
            <strong>${formatNumber(dev1.followers)} ${dev1.followers > dev2.followers ? '<span class="winner-badge">👑 Higher</span>' : ''}</strong>
          </div>
          <div class="dev-stat-row">
            <span>Following</span>
            <strong>${formatNumber(dev1.following)}</strong>
          </div>
        </div>
      </div>
      
      <div class="developer-card card">
        <div class="dev-header">
          <img src="${dev2.avatar_url}" alt="${dev2.login}" class="dev-avatar">
          <div>
            <h3>${dev2.name || dev2.login}</h3>
            <a href="${dev2.html_url}" target="_blank">@${dev2.login}</a>
          </div>
        </div>
        <div class="dev-stats">
          <div class="dev-stat-row">
            <span>Repositories</span>
            <strong>${dev2.public_repos} ${dev2.public_repos > dev1.public_repos ? '<span class="winner-badge">👑 Higher</span>' : ''}</strong>
          </div>
          <div class="dev-stat-row">
            <span>Total Stars</span>
            <strong>${formatNumber(stats2.totalStars)} ${stats2.totalStars > stats1.totalStars ? '<span class="winner-badge">👑 Higher</span>' : ''}</strong>
          </div>
          <div class="dev-stat-row">
            <span>Total Forks</span>
            <strong>${formatNumber(stats2.totalForks)} ${stats2.totalForks > stats1.totalForks ? '<span class="winner-badge">👑 Higher</span>' : ''}</strong>
          </div>
          <div class="dev-stat-row">
            <span>Followers</span>
            <strong>${formatNumber(dev2.followers)} ${dev2.followers > dev1.followers ? '<span class="winner-badge">👑 Higher</span>' : ''}</strong>
          </div>
          <div class="dev-stat-row">
            <span>Following</span>
            <strong>${formatNumber(dev2.following)}</strong>
          </div>
        </div>
      </div>
    </div>
    
    <div class="comparison-chart-container">
      <h3 class="section-title">Metrics Comparison</h3>
      <div class="card chart-wrapper">
        <canvas id="comparison-chart"></canvas>
      </div>
    </div>
    
    <div class="comparison-grid">
      <div class="card" style="padding: var(--space-24);">
        <h3 class="section-title">Top Languages - ${dev1.login}</h3>
        <div>${getTopLanguages(repos1).map(lang => `<div class="language-badge" style="margin: 4px;">${lang}</div>`).join('')}</div>
      </div>
      <div class="card" style="padding: var(--space-24);">
        <h3 class="section-title">Top Languages - ${dev2.login}</h3>
        <div>${getTopLanguages(repos2).map(lang => `<div class="language-badge" style="margin: 4px;">${lang}</div>`).join('')}</div>
      </div>
    </div>
  `;
  
  comparisonResults.innerHTML = html;
  
  // Create comparison chart
  const ctx = document.getElementById('comparison-chart');
  if (comparisonChart) comparisonChart.destroy();
  
  comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Repositories', 'Stars', 'Forks', 'Followers'],
      datasets: [
        {
          label: dev1.login,
          data: [dev1.public_repos, stats1.totalStars, stats1.totalForks, dev1.followers],
          backgroundColor: '#1FB8CD'
        },
        {
          label: dev2.login,
          data: [dev2.public_repos, stats2.totalStars, stats2.totalForks, dev2.followers],
          backgroundColor: '#FFC185'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim()
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim()
          },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()
          }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-text-secondary').trim()
          },
          grid: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()
          }
        }
      }
    }
  });
}

function calculateStats(repos) {
  return {
    totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
    totalSize: repos.reduce((sum, repo) => sum + repo.size, 0)
  };
}

function getTopLanguages(repos) {
  const langCounts = {};
  repos.forEach(repo => {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
  });
  return Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang);
}

// TOOL 3: Team Metrics
async function handleTeamAnalysis() {
  const input = teamInput.value.trim();
  if (!input) {
    alert('Please enter team member usernames');
    return;
  }
  
  const usernames = input.split(/[,\n]/).map(u => u.trim()).filter(u => u);
  
  if (usernames.length === 0) {
    alert('Please enter valid usernames');
    return;
  }
  
  teamResults.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Analyzing team...</p></div>';
  teamResults.classList.remove('hidden');
  
  try {
    const teamData = await Promise.all(
      usernames.map(async username => {
        const [userData, reposData] = await Promise.all([
          fetchUserData(username),
          fetchUserRepositories(username)
        ]);
        return { user: userData, repos: reposData };
      })
    );
    
    displayTeamMetrics(teamData);
  } catch (error) {
    teamResults.innerHTML = `<div class="error-message"><div class="error-content"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>${error.message}</span></div></div>`;
  }
}

function displayTeamMetrics(teamData) {
  const totalRepos = teamData.reduce((sum, member) => sum + member.user.public_repos, 0);
  const totalStars = teamData.reduce((sum, member) => 
    sum + calculateStats(member.repos).totalStars, 0);
  const totalForks = teamData.reduce((sum, member) => 
    sum + calculateStats(member.repos).totalForks, 0);
  const avgStars = Math.round(totalStars / teamData.length);
  
  // Get all languages
  const allLanguages = {};
  teamData.forEach(member => {
    member.repos.forEach(repo => {
      if (repo.language) {
        allLanguages[repo.language] = (allLanguages[repo.language] || 0) + 1;
      }
    });
  });
  
  const topLanguages = Object.entries(allLanguages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Sort team members by stars
  const sortedMembers = [...teamData].sort((a, b) => 
    calculateStats(b.repos).totalStars - calculateStats(a.repos).totalStars
  );
  
  const html = `
    <h2 class="section-title">Team Analysis</h2>
    
    <div class="team-overview">
      <div class="stat-card card">
        <div class="stat-icon" style="background: var(--color-bg-1);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Team Members</p>
          <p class="stat-value">${teamData.length}</p>
        </div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background: var(--color-bg-2);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Repositories</p>
          <p class="stat-value">${formatNumber(totalRepos)}</p>
        </div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background: var(--color-bg-3);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Stars</p>
          <p class="stat-value">${formatNumber(totalStars)}</p>
        </div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon" style="background: var(--color-bg-4);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Avg Stars per Member</p>
          <p class="stat-value">${formatNumber(avgStars)}</p>
        </div>
      </div>
    </div>
    
    <h3 class="section-title">Team Technologies</h3>
    <div class="card" style="padding: var(--space-24); margin-bottom: var(--space-32);">
      <div style="display: flex; gap: var(--space-8); flex-wrap: wrap;">
        ${topLanguages.map(([lang, count]) => `
          <div class="language-badge" style="background: ${getLanguageColor(lang)}; color: white;">
            ${lang} (${count})
          </div>
        `).join('')}
      </div>
    </div>
    
    <h3 class="section-title">Team Leaderboard</h3>
    <div class="card" style="padding: 0; overflow-x: auto; margin-bottom: var(--space-32);">
      <table class="team-members-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Member</th>
            <th>Repositories</th>
            <th>Total Stars</th>
            <th>Total Forks</th>
            <th>Followers</th>
          </tr>
        </thead>
        <tbody>
          ${sortedMembers.map((member, index) => {
            const stats = calculateStats(member.repos);
            return `
              <tr>
                <td><strong>${index + 1}</strong></td>
                <td>
                  <div class="member-info">
                    <img src="${member.user.avatar_url}" alt="${member.user.login}" class="member-avatar">
                    <div>
                      <div><strong>${member.user.name || member.user.login}</strong></div>
                      <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">@${member.user.login}</div>
                    </div>
                  </div>
                </td>
                <td>${formatNumber(member.user.public_repos)}</td>
                <td>${formatNumber(stats.totalStars)}</td>
                <td>${formatNumber(stats.totalForks)}</td>
                <td>${formatNumber(member.user.followers)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  teamResults.innerHTML = html;
}

// TOOL 4: Auto-Labeler (Copy Functions)
function copyCode(targetId) {
  const codeElement = document.getElementById(targetId);
  const text = codeElement.textContent;
  
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
  
  document.body.removeChild(textarea);
}

// TOOL 5: Release Notes Generator
async function handleReleaseGeneration() {
  const username = releaseUsernameInput.value.trim();
  const repo = releaseRepoInput.value.trim();
  const version = releaseVersionInput.value.trim() || 'v1.0.0';
  
  if (!username || !repo) {
    alert('Please enter both username and repository name');
    return;
  }
  
  releaseResults.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Generating release notes...</p></div>';
  releaseResults.classList.remove('hidden');
  
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${username}/${repo}/commits?per_page=50`);
    updateRateLimit(response);
    
    if (response.status === 404) {
      throw new Error('Repository not found');
    }
    if (!response.ok) {
      throw new Error('Failed to fetch commits');
    }
    
    const commits = await response.json();
    displayReleaseNotes(username, repo, version, commits);
  } catch (error) {
    releaseResults.innerHTML = `<div class="error-message"><div class="error-content"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>${error.message}</span></div></div>`;
  }
}

function displayReleaseNotes(username, repo, version, commits) {
  const categorized = {
    features: [],
    bugfixes: [],
    improvements: [],
    documentation: [],
    other: []
  };
  
  commits.forEach(commit => {
    const msg = commit.commit.message.toLowerCase();
    if (msg.includes('feature') || msg.includes('add') || msg.includes('new')) {
      categorized.features.push(commit);
    } else if (msg.includes('fix') || msg.includes('bug') || msg.includes('resolve')) {
      categorized.bugfixes.push(commit);
    } else if (msg.includes('improve') || msg.includes('refactor') || msg.includes('optimize')) {
      categorized.improvements.push(commit);
    } else if (msg.includes('docs') || msg.includes('readme') || msg.includes('comment')) {
      categorized.documentation.push(commit);
    } else {
      categorized.other.push(commit);
    }
  });
  
  const contributors = new Set(commits.map(c => c.commit.author.name)).size;
  const releaseDate = new Date().toISOString().split('T')[0];
  
  const markdown = `# ${repo} ${version}\n\n**Release Date:** ${releaseDate}\n**Total Commits:** ${commits.length}\n**Contributors:** ${contributors}\n\n${categorized.features.length > 0 ? `## ✨ Features\n${categorized.features.map(c => `- ${c.commit.message.split('\n')[0]}`).join('\n')}\n\n` : ''}${categorized.bugfixes.length > 0 ? `## 🐛 Bug Fixes\n${categorized.bugfixes.map(c => `- ${c.commit.message.split('\n')[0]}`).join('\n')}\n\n` : ''}${categorized.improvements.length > 0 ? `## 🔧 Improvements\n${categorized.improvements.map(c => `- ${c.commit.message.split('\n')[0]}`).join('\n')}\n\n` : ''}${categorized.documentation.length > 0 ? `## 📝 Documentation\n${categorized.documentation.map(c => `- ${c.commit.message.split('\n')[0]}`).join('\n')}\n\n` : ''}`;
  
  const html = `
    <div class="release-notes-card card">
      <div class="release-header">
        <h2 class="release-title">${repo} ${version}</h2>
        <div class="release-meta">
          <span>📅 ${releaseDate}</span>
          <span>📝 ${commits.length} commits</span>
          <span>👥 ${contributors} contributors</span>
        </div>
      </div>
      
      ${categorized.features.length > 0 ? `
        <div class="release-section">
          <h3 class="release-section-title">✨ Features</h3>
          <ul class="commit-list">
            ${categorized.features.map(c => `<li class="commit-item">${c.commit.message.split('\n')[0]}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${categorized.bugfixes.length > 0 ? `
        <div class="release-section">
          <h3 class="release-section-title">🐛 Bug Fixes</h3>
          <ul class="commit-list">
            ${categorized.bugfixes.map(c => `<li class="commit-item">${c.commit.message.split('\n')[0]}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${categorized.improvements.length > 0 ? `
        <div class="release-section">
          <h3 class="release-section-title">🔧 Improvements</h3>
          <ul class="commit-list">
            ${categorized.improvements.map(c => `<li class="commit-item">${c.commit.message.split('\n')[0]}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${categorized.documentation.length > 0 ? `
        <div class="release-section">
          <h3 class="release-section-title">📝 Documentation</h3>
          <ul class="commit-list">
            ${categorized.documentation.map(c => `<li class="commit-item">${c.commit.message.split('\n')[0]}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${categorized.other.length > 0 ? `
        <div class="release-section">
          <h3 class="release-section-title">📦 Other Changes</h3>
          <ul class="commit-list">
            ${categorized.other.slice(0, 10).map(c => `<li class="commit-item">${c.commit.message.split('\n')[0]}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <div class="release-actions">
        <button class="btn btn--primary" onclick="copyReleaseNotes(\`${markdown.replace(/`/g, '\\`')}\`)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy Release Notes
        </button>
        <button class="btn btn--secondary" onclick="downloadReleaseNotes('${repo}', '${version}', \`${markdown.replace(/`/g, '\\`')}\`)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Markdown
        </button>
      </div>
    </div>
  `;
  
  releaseResults.innerHTML = html;
}

function copyReleaseNotes(markdown) {
  const textarea = document.createElement('textarea');
  textarea.value = markdown;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    alert('Release notes copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
  
  document.body.removeChild(textarea);
}

function downloadReleaseNotes(repo, version, markdown) {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${repo}-${version}-release-notes.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Utility function to format time ago
function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}

// Performance monitoring (optional)
function measurePerformance(label, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`⚡ ${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}