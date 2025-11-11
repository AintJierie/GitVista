// GitHub OAuth Backend Server
// This server handles the OAuth token exchange securely
// Run with: node oauth-server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true
}));
app.use(express.json());

// Environment variables
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const PORT = process.env.PORT || 3000;

// Validate environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Missing required environment variables!');
  console.error('Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env file');
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'GitHub OAuth server is running',
    timestamp: new Date().toISOString()
  });
});

// OAuth token exchange endpoint
app.post('/api/github/oauth/token', async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ 
      error: 'Missing authorization code' 
    });
  }
  
  try {
    console.log('🔄 Exchanging authorization code for access token...');
    
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
    
    const data = response.data;
    
    // Check for errors
    if (data.error) {
      console.error('❌ GitHub OAuth error:', data.error_description);
      return res.status(400).json({ 
        error: data.error,
        error_description: data.error_description 
      });
    }
    
    if (!data.access_token) {
      console.error('❌ No access token in response');
      return res.status(500).json({ 
        error: 'No access token received from GitHub' 
      });
    }
    
    console.log('✅ Successfully obtained access token');
    
    // Return the access token
    res.json({
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope
    });
    
  } catch (error) {
    console.error('❌ OAuth token exchange error:', error.message);
    
    if (error.response) {
      console.error('GitHub API response:', error.response.data);
      res.status(error.response.status).json({ 
        error: 'GitHub API error',
        details: error.response.data 
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
});

// Verify token endpoint (optional - for checking if token is still valid)
app.get('/api/github/oauth/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Missing or invalid authorization header' 
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Verify token by fetching user data
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    
    res.json({ 
      valid: true,
      user: response.data
    });
    
  } catch (error) {
    if (error.response && error.response.status === 401) {
      res.status(401).json({ 
        valid: false,
        error: 'Invalid or expired token' 
      });
    } else {
      res.status(500).json({ 
        error: 'Verification failed',
        message: error.message 
      });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 GitHub OAuth Server Started');
  console.log('================================');
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔑 Client ID: ${CLIENT_ID.substring(0, 8)}...`);
  console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Token Exchange: http://localhost:${PORT}/api/github/oauth/token`);
  console.log('');
  console.log('💡 Make sure your frontend is configured to use this server URL');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
