#!/usr/bin/env node

/**
 * Google OAuth Configuration Validator
 * Validates that all required environment variables are set correctly
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.cyan}   Google OAuth Configuration Validator${colors.reset}`);
console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Load environment variables
require('dotenv').config();

const validations = [];

// Check backend configuration
console.log(`${colors.blue}📋 Checking Backend Configuration...${colors.reset}\n`);

const backendClientId = process.env.GOOGLE_CLIENT_ID;

if (!backendClientId || backendClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com') {
  validations.push({
    status: 'error',
    component: 'Backend',
    message: 'GOOGLE_CLIENT_ID not configured in backend/.env',
    action: 'Set a valid Google OAuth Client ID'
  });
} else if (!backendClientId.endsWith('.apps.googleusercontent.com')) {
  validations.push({
    status: 'error',
    component: 'Backend',
    message: 'GOOGLE_CLIENT_ID format is invalid',
    action: 'Must end with .apps.googleusercontent.com'
  });
} else {
  validations.push({
    status: 'success',
    component: 'Backend',
    message: 'GOOGLE_CLIENT_ID is configured',
    value: backendClientId.substring(0, 30) + '...'
  });
}

// Check frontend configuration
console.log(`${colors.blue}📋 Checking Frontend Configuration...${colors.reset}\n`);

const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
let frontendClientId = null;

if (fs.existsSync(frontendEnvPath)) {
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  const match = frontendEnv.match(/VITE_GOOGLE_CLIENT_ID=(.+)/);
  frontendClientId = match ? match[1].trim() : null;

  if (!frontendClientId || frontendClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com') {
    validations.push({
      status: 'error',
      component: 'Frontend',
      message: 'VITE_GOOGLE_CLIENT_ID not configured in frontend/.env',
      action: 'Set a valid Google OAuth Client ID'
    });
  } else if (!frontendClientId.endsWith('.apps.googleusercontent.com')) {
    validations.push({
      status: 'error',
      component: 'Frontend',
      message: 'VITE_GOOGLE_CLIENT_ID format is invalid',
      action: 'Must end with .apps.googleusercontent.com'
    });
  } else {
    validations.push({
      status: 'success',
      component: 'Frontend',
      message: 'VITE_GOOGLE_CLIENT_ID is configured',
      value: frontendClientId.substring(0, 30) + '...'
    });
  }
} else {
  validations.push({
    status: 'error',
    component: 'Frontend',
    message: 'frontend/.env file not found',
    action: 'Create frontend/.env file'
  });
}

// Check if backend and frontend Client IDs match
if (backendClientId && frontendClientId && 
    backendClientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com' &&
    frontendClientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com') {
  if (backendClientId === frontendClientId) {
    validations.push({
      status: 'success',
      component: 'Sync Check',
      message: 'Backend and Frontend Client IDs match',
      value: '✓ Synchronized'
    });
  } else {
    validations.push({
      status: 'error',
      component: 'Sync Check',
      message: 'Backend and Frontend Client IDs do NOT match',
      action: 'Both must use the SAME Client ID'
    });
  }
}

// Display results
console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
console.log(`${colors.blue}📊 Validation Results:${colors.reset}\n`);

let hasErrors = false;

validations.forEach(validation => {
  if (validation.status === 'success') {
    console.log(`${colors.green}✓${colors.reset} [${validation.component}] ${validation.message}`);
    if (validation.value) {
      console.log(`  ${colors.cyan}→${colors.reset} ${validation.value}`);
    }
  } else {
    hasErrors = true;
    console.log(`${colors.red}✗${colors.reset} [${validation.component}] ${validation.message}`);
    console.log(`  ${colors.yellow}→${colors.reset} ${validation.action}`);
  }
  console.log('');
});

console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

if (hasErrors) {
  console.log(`${colors.yellow}⚠️  Configuration Issues Detected${colors.reset}\n`);
  console.log(`${colors.blue}📖 Setup Instructions:${colors.reset}

1. Visit Google Cloud Console:
   ${colors.cyan}https://console.cloud.google.com/apis/credentials${colors.reset}

2. Create OAuth 2.0 Client ID (Web application)

3. Configure Authorized JavaScript Origins:
   - http://localhost:5173
   - http://localhost:3000

4. Copy the Client ID and update:
   - ${colors.cyan}backend/.env${colors.reset} → GOOGLE_CLIENT_ID
   - ${colors.cyan}frontend/.env${colors.reset} → VITE_GOOGLE_CLIENT_ID

5. Restart both servers after updating
\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}✓ All configurations are valid!${colors.reset}\n`);
  console.log(`${colors.blue}🚀 You can now use Google Sign-In${colors.reset}\n`);
  process.exit(0);
}
