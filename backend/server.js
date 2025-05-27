const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

const WG_INTERFACE = 'wg0'; // Easily changeable interface name

// Helper to run shell commands
function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        return reject(error);
      }
      resolve(stdout);
    });
  });
}

// Simple IPv4 validation
function isValidIP(ip) {
  const ipRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return ipRegex.test(ip);
}

// Health check route
app.get('/api/health', (req, res) => {
  res.send('✅ Server is running');
});

// WireGuard status
app.get('/api/wg-status', async (req, res) => {
  try {
    const output = await runCommand(`sudo wg show ${WG_INTERFACE}`);
    res.json({ output });
  } catch (err) {
    if ((err.stderr || '').includes('cannot find device')) {
      res.json({ output: `Interface ${WG_INTERFACE} is not active` });
    } else {
      console.error(`[${new Date().toISOString()}] ❌ Error getting wg status:`, err.stderr || err.message);
      res.status(500).json({ error: err.stderr || err.message });
    }
  }
});

// Start/Stop/Restart VPN
app.post('/api/vpn/:action', async (req, res) => {
  const action = req.params.action;
  try {
    if (action === 'start') {
      try {
        await runCommand(`sudo wg-quick up ${WG_INTERFACE}`);
        res.json({ message: 'VPN started' });
      } catch (err) {
        if ((err.stderr || '').includes('already exists')) {
          await runCommand(`sudo wg-quick down ${WG_INTERFACE}`);
          await runCommand(`sudo wg-quick up ${WG_INTERFACE}`);
          res.json({ message: 'VPN restarted because interface already existed' });
        } else {
          throw err;
        }
      }
    } else if (action === 'stop') {
      await runCommand(`sudo wg-quick down ${WG_INTERFACE}`);
      res.json({ message: 'VPN stopped' });
    } else if (action === 'restart') {
      await runCommand(`sudo wg-quick down ${WG_INTERFACE}`);
      await runCommand(`sudo wg-quick up ${WG_INTERFACE}`);
      res.json({ message: 'VPN restarted' });
    } else {
      res.status(400).json({ error: 'Invalid action. Use start, stop, or restart.' });
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ VPN action failed:`, err.stderr || err.message);
    res.status(500).json({ error: err.stderr || err.message });
  }
});

// Ping endpoint
app.get('/api/ping/:ip', async (req, res) => {
  const ip = req.params.ip;
  console.log(`[${new Date().toISOString()}] 🔍 Incoming ping request for: ${ip}`);

  if (!isValidIP(ip)) {
    console.log('❌ Invalid IP:', ip);
    return res.status(400).json({ error: 'Invalid IP address' });
  }

  try {
    const output = await runCommand(`ping -c 4 ${ip}`);
    console.log('✅ Ping output:', output);
    res.json({ output });
  } catch (err) {
    console.error('🔥 Error running ping:', err.message);
    res.status(500).json({
      error: err.message,
      message: 'Ping failed',
      partialOutput: err.stdout || '',
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`);
});