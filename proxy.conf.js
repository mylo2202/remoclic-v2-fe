const fs = require('fs');
const path = require('path');

let backendUrl = 'http://127.0.0.1:8000'; // Fallback default

try {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    const match = envFile.match(/^BACKEND_URL=["']?([^"'\r\n]+)["']?/m);
    if (match && match[1]) {
      backendUrl = match[1].trim();
    }
  }
} catch (e) {
  console.error('Error reading .env file for proxy configuration:', e);
}

console.log(`[Proxy] Routing /api to: ${backendUrl}`);

const PROXY_CONFIG = {
  "/api": {
    "target": backendUrl,
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    },
    "changeOrigin": true,
    "logLevel": "debug"
  }
};

module.exports = PROXY_CONFIG;
