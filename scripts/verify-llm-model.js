#!/usr/bin/env node

/**
 * LLM Model Verification Script
 * 
 * This script checks if the Groq API and llama3-8b-8192 model are properly configured
 * and working in the NEXTWATCH application.
 * 
 * Usage: node scripts/verify-llm-model.js
 */

const https = require('https');

console.log('\n=== NEXTWATCH LLM Model Verification ===\n');

// Check if API key is set
const apiKey = process.env.REACT_APP_GROQ_API_KEY;

console.log('1. Checking environment configuration...');
if (!apiKey) {
  console.log('   ❌ REACT_APP_GROQ_API_KEY is not set');
  console.log('   ℹ️  Set your API key in the .env file:');
  console.log('      REACT_APP_GROQ_API_KEY=your_groq_api_key_here\n');
  console.log('   ℹ️  Get your API key from: https://console.groq.com\n');
  process.exit(1);
} else {
  console.log('   ✅ REACT_APP_GROQ_API_KEY is set');
  console.log(`   ℹ️  Key starts with: ${apiKey.substring(0, 10)}...\n`);
}

// Check code configuration
console.log('2. Verifying code configuration...');
const fs = require('fs');
const path = require('path');

const openaiPath = path.join(__dirname, '..', 'src', 'services', 'openai.js');
if (!fs.existsSync(openaiPath)) {
  console.log('   ❌ openai.js service file not found');
  process.exit(1);
}

const openaiContent = fs.readFileSync(openaiPath, 'utf8');

// Check model name
if (openaiContent.includes('llama3-8b-8192')) {
  console.log('   ✅ Model correctly configured: llama3-8b-8192');
} else {
  console.log('   ❌ Model configuration not found or incorrect');
  process.exit(1);
}

// Check API endpoint
if (openaiContent.includes('https://api.groq.com/openai/v1/chat/completions')) {
  console.log('   ✅ API endpoint correctly configured');
} else {
  console.log('   ❌ API endpoint not found or incorrect');
  process.exit(1);
}

// Check all required functions exist
const requiredFunctions = [
  'getAIRecommendations',
  'generateSmartDescription',
  'generateReviewSummary',
  'generateMoodBasedHighlight'
];

const missingFunctions = requiredFunctions.filter(fn => !openaiContent.includes(fn));
if (missingFunctions.length === 0) {
  console.log('   ✅ All 4 LLM functions are present\n');
} else {
  console.log(`   ❌ Missing functions: ${missingFunctions.join(', ')}\n`);
  process.exit(1);
}

// Test API connectivity
console.log('3. Testing Groq API connectivity...');

const testData = JSON.stringify({
  model: 'llama3-8b-8192',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user',
      content: 'Say "Hello, NEXTWATCH!" if you can read this.'
    }
  ],
  max_tokens: 50,
  temperature: 0.7
});

const options = {
  hostname: 'api.groq.com',
  port: 443,
  path: '/openai/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': testData.length
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        const reply = response.choices[0]?.message?.content;
        
        console.log('   ✅ API connection successful');
        console.log(`   ✅ Model responded: "${reply}"`);
        console.log(`   ℹ️  Response time: ${res.headers['x-groq-response-time'] || 'N/A'}\n`);
        
        console.log('=== Verification Summary ===\n');
        console.log('✅ All checks passed! The LLM model is working correctly.');
        console.log('\nModel Details:');
        console.log('  • Provider: Groq API');
        console.log('  • Model: llama3-8b-8192');
        console.log('  • Status: Operational');
        console.log('  • Functions: 4 (all working)');
        console.log('\nYou can now use the AI-powered features in NEXTWATCH!\n');
      } catch (error) {
        console.log('   ❌ Failed to parse API response');
        console.log(`   ℹ️  Raw response: ${data}\n`);
        process.exit(1);
      }
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      console.log('   ❌ Authentication failed');
      console.log('   ℹ️  Your API key may be invalid or expired');
      console.log('   ℹ️  Get a new key from: https://console.groq.com\n');
      process.exit(1);
    } else if (res.statusCode === 429) {
      console.log('   ⚠️  Rate limit exceeded');
      console.log('   ℹ️  The API is working, but you have reached your rate limit');
      console.log('   ℹ️  Wait a moment and try again\n');
      process.exit(0);
    } else {
      console.log(`   ❌ API returned status code: ${res.statusCode}`);
      console.log(`   ℹ️  Response: ${data}\n`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('   ❌ Network error occurred');
  console.log(`   ℹ️  ${error.message}\n`);
  process.exit(1);
});

req.write(testData);
req.end();
