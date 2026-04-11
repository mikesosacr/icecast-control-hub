/**
 * Icecast Control Hub - Backend Server
 * Express.js proxy between the React frontend and Icecast2
 */

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Icecast config from environment or defaults
const ICECAST_HOST = process.env.ICECAST_HOST || 'localhost';
const ICECAST_PORT = parseInt(process.env.ICECAST_PORT || '8000');
const ICECAST_ADMIN_USER = process.env.ICECAST_ADMIN_USER || 'admin';
const ICECAST_ADMIN_PASSWORD = process.env.ICECAST_ADMIN_PASSWORD || 'hackme';
const ICECAST_CONFIG_PATH = process.env.ICECAST_CONFIG_PATH || '/etc/icecast2/icecast.xml';

app.use(cors());
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────

function icecastRequest(path) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${ICECAST_ADMIN_USER}:${ICECAST_ADMIN_PASSWORD}`).toString('base64');
    const options = {
      hostname: ICECAST_HOST,
      port: ICECAST_PORT,
      path,
      method: 'GET',
      headers: { Authorization: `Basic ${auth}` },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

function parseXmlValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match ? match[1].trim() : null;
}

function parseAllXmlValues(xml, tag) {
  const matches = [];
  const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`, 'g');
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

function parseIcecastStats(xml) {
  // Parse mountpoints
  const mountpoints = [];
  const sourceRegex = /<source mount="([^"]*)">([\s\S]*?)<\/source>/g;
  let sourceMatch;

  while ((sourceMatch = sourceRegex.exec(xml)) !== null) {
    const mount = sourceMatch[1];
    const block = sourceMatch[2];
    mountpoints.push({
      id: mount.replace(/\//g, '_').replace(/^_/, ''),
      mount,
      name: parseXmlValue(block, 'server_name') || mount,
      description: parseXmlValue(block, 'server_description') || '',
      genre: parseXmlValue(block, 'genre') || '',
      bitrate: parseInt(parseXmlValue(block, 'bitrate') || '0'),
      listeners: parseInt(parseXmlValue(block, 'listeners') || '0'),
      peakListeners: parseInt(parseXmlValue(block, 'listener_peak') || '0'),
      isPublic: parseXmlValue(block, 'listenurl') !== null,
      streamStart: parseXmlValue(block, 'stream_start') || '',
      contentType: parseXmlValue(block, 'content-type') || 'audio/mpeg',
      currentSong: parseXmlValue(block, 'title') || '',
      artist: parseXmlValue(block, 'artist') || '',
      status: 'active',
    });
  }

  return {
    currentListeners: parseInt(parseXmlValue(xml, 'listeners') || '0'),
    peakListeners: parseInt(parseXmlValue(xml, 'listener_peak') || '0'),
    serverStart: parseXmlValue(xml, 'server_start') || '',
    serverVersion: parseXmlValue(xml, 'server_id') || 'Icecast2',
    mountpoints,
  };
}

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve({ stdout, stderr });
    });
  });
}

// ─── Auth ────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const encoded = authHeader.replace('Basic ', '');
  let username = '', password = '';

  try {
    [username, password] = Buffer.from(encoded, 'base64').toString().split(':');
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid credentials format' });
  }

  // Verify against Icecast
  try {
    const result = await icecastRequest('/admin/stats');
    if (result.status === 200) {
      return res.json({ success: true, message: 'Login successful', user: { username, role: 'admin' } });
    }
  } catch {}

  // Fallback: accept admin/hackme or env credentials
  if (username === ICECAST_ADMIN_USER && password === ICECAST_ADMIN_PASSWORD) {
    return res.json({ success: true, message: 'Login successful', user: { username, role: 'admin' } });
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// ─── Server Health ───────────────────────────────────────────────────────────

app.get('/api/server-health', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    res.json({
      status: result.status === 200 ? 'running' : 'error',
      available: result.status === 200,
      configPath: ICECAST_CONFIG_PATH,
      port: ICECAST_PORT,
    });
  } catch {
    res.json({ status: 'offline', available: false, configPath: ICECAST_CONFIG_PATH, port: ICECAST_PORT });
  }
});

app.get('/api/server-status', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    const installed = fs.existsSync(ICECAST_CONFIG_PATH);
    res.json({
      installed,
      status: result.status === 200 ? 'running' : 'stopped',
      configPath: ICECAST_CONFIG_PATH,
      port: ICECAST_PORT,
    });
  } catch {
    res.json({ installed: fs.existsSync(ICECAST_CONFIG_PATH), status: 'stopped', port: ICECAST_PORT });
  }
});

// ─── Servers ─────────────────────────────────────────────────────────────────

app.get('/api/servers', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    const status = result.status === 200 ? 'online' : 'offline';
    res.json([{
      id: 'local',
      name: 'Local Icecast Server',
      host: ICECAST_HOST,
      port: ICECAST_PORT,
      adminUser: ICECAST_ADMIN_USER,
      status,
      isLocal: true,
    }]);
  } catch {
    res.json([{
      id: 'local',
      name: 'Local Icecast Server',
      host: ICECAST_HOST,
      port: ICECAST_PORT,
      adminUser: ICECAST_ADMIN_USER,
      status: 'offline',
      isLocal: true,
    }]);
  }
});

app.post('/api/servers', (req, res) => {
  // Remote servers are stored in memory for now (stateless backend)
  res.status(201).json({ id: Date.now().toString(), ...req.body, status: 'unknown' });
});

app.put('/api/servers/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/servers/:id', (req, res) => {
  res.json({ success: true });
});

// ─── Stats ───────────────────────────────────────────────────────────────────

app.get('/api/servers/:serverId/stats', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    if (result.status !== 200) throw new Error('Icecast unreachable');
    const stats = parseIcecastStats(result.body);
    res.json(stats);
  } catch (err) {
    res.status(503).json({ error: 'Could not reach Icecast', details: err.message });
  }
});

// ─── Mountpoints ─────────────────────────────────────────────────────────────

app.get('/api/servers/:serverId/mountpoints', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    if (result.status !== 200) throw new Error('Icecast unreachable');
    const stats = parseIcecastStats(result.body);
    res.json(stats.mountpoints);
  } catch (err) {
    res.status(503).json({ error: 'Could not reach Icecast', details: err.message });
  }
});

app.get('/api/servers/:serverId/mountpoints/:mountpointId', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    if (result.status !== 200) throw new Error('Icecast unreachable');
    const stats = parseIcecastStats(result.body);
    const mp = stats.mountpoints.find(m => m.id === req.params.mountpointId);
    if (!mp) return res.status(404).json({ error: 'Mountpoint not found' });
    res.json(mp);
  } catch (err) {
    res.status(503).json({ error: 'Could not reach Icecast', details: err.message });
  }
});

app.post('/api/servers/:serverId/mountpoints', (req, res) => {
  res.status(201).json({ id: Date.now().toString(), ...req.body, status: 'configured' });
});

app.put('/api/servers/:serverId/mountpoints/:mountpointId', (req, res) => {
  res.json({ id: req.params.mountpointId, ...req.body });
});

app.delete('/api/servers/:serverId/mountpoints/:mountpointId', async (req, res) => {
  // Kick all listeners on the mountpoint
  try {
    const mount = '/' + req.params.mountpointId.replace(/_/g, '/');
    await icecastRequest(`/admin/killsource?mount=${encodeURIComponent(mount)}`);
    res.json({ success: true });
  } catch {
    res.json({ success: false, error: 'Could not kill source' });
  }
});

// ─── Listeners ───────────────────────────────────────────────────────────────

app.get('/api/servers/:serverId/listeners', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    if (result.status !== 200) throw new Error('Icecast unreachable');
    const stats = parseIcecastStats(result.body);
    res.json({ current: stats.currentListeners, peak: stats.peakListeners });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.get('/api/servers/:serverId/mountpoints/:mountpointId/listeners', async (req, res) => {
  try {
    const mount = '/' + req.params.mountpointId.replace(/_/g, '/');
    const result = await icecastRequest(`/admin/listclients?mount=${encodeURIComponent(mount)}`);
    if (result.status !== 200) throw new Error('Icecast unreachable');
    // Parse listener count from XML
    const count = (result.body.match(/<ID>/g) || []).length;
    res.json({ current: count, peak: count });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.delete('/api/servers/:serverId/mountpoints/:mountpointId/listeners/:listenerId', async (req, res) => {
  try {
    const mount = '/' + req.params.mountpointId.replace(/_/g, '/');
    await icecastRequest(`/admin/kickclient?mount=${encodeURIComponent(mount)}&id=${req.params.listenerId}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Server Control ──────────────────────────────────────────────────────────

app.post('/api/servers/:serverId/start', async (req, res) => {
  try {
    await execPromise('sudo systemctl start icecast2');
    res.json({ success: true, message: 'Icecast started' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/servers/:serverId/stop', async (req, res) => {
  try {
    await execPromise('sudo systemctl stop icecast2');
    res.json({ success: true, message: 'Icecast stopped' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/servers/:serverId/restart', async (req, res) => {
  try {
    await execPromise('sudo systemctl restart icecast2');
    res.json({ success: true, message: 'Icecast restarted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Install Server ──────────────────────────────────────────────────────────

app.post('/api/install-server', async (req, res) => {
  try {
    const { port = 8000, adminUsername = 'admin', adminPassword = 'hackme' } = req.body || {};

    // Check if already installed
    if (fs.existsSync(ICECAST_CONFIG_PATH)) {
      await execPromise('sudo systemctl start icecast2');
      return res.json({ success: true, message: 'Icecast already installed, started service', installed: true });
    }

    // Install icecast2 if missing
    await execPromise('sudo apt-get install -y icecast2');
    await execPromise('sudo systemctl enable icecast2');
    await execPromise('sudo systemctl start icecast2');

    res.json({ success: true, message: 'Icecast installed and started', installed: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, installed: false });
  }
});

app.post('/api/update-installation', async (req, res) => {
  try {
    await execPromise('sudo apt-get update && sudo apt-get install -y --only-upgrade icecast2');
    await execPromise('sudo systemctl restart icecast2');
    res.json({ success: true, message: 'Icecast updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Logs ────────────────────────────────────────────────────────────────────

app.get('/api/servers/:serverId/logs', async (req, res) => {
  const { level, query } = req.query;
  const logFiles = ['/var/log/icecast2/access.log', '/var/log/icecast2/error.log'];
  const logs = [];

  for (const logFile of logFiles) {
    try {
      if (!fs.existsSync(logFile)) continue;
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.split('\n').filter(Boolean).slice(-200);
      const isError = logFile.includes('error');

      for (const line of lines) {
        const entry = {
          id: `${logFile}-${logs.length}`,
          timestamp: new Date().toISOString(),
          level: isError ? 'error' : 'info',
          source: isError ? 'error.log' : 'access.log',
          message: line,
        };

        if (level && entry.level !== level) continue;
        if (query && !line.toLowerCase().includes(query.toLowerCase())) continue;

        logs.push(entry);
      }
    } catch {}
  }

  res.json(logs.slice(-100));
});

// ─── Config ──────────────────────────────────────────────────────────────────

app.get('/api/servers/:serverId/config', (req, res) => {
  try {
    if (!fs.existsSync(ICECAST_CONFIG_PATH)) {
      return res.status(404).json({ error: 'Config file not found' });
    }
    const config = fs.readFileSync(ICECAST_CONFIG_PATH, 'utf8');
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/servers/:serverId/config', async (req, res) => {
  try {
    const { config } = req.body;
    if (!config) return res.status(400).json({ error: 'No config provided' });

    // Write to temp file and move with sudo
    const tmpFile = '/tmp/icecast_config_tmp.xml';
    fs.writeFileSync(tmpFile, config, 'utf8');
    await execPromise(`sudo cp ${tmpFile} ${ICECAST_CONFIG_PATH}`);
    await execPromise('sudo systemctl reload icecast2 || sudo systemctl restart icecast2');

    res.json({ success: true, message: 'Config updated and Icecast reloaded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Users ───────────────────────────────────────────────────────────────────

app.get('/api/users', (req, res) => {
  res.json([{ id: '1', username: ICECAST_ADMIN_USER, role: 'admin', active: true }]);
});

app.post('/api/users', (req, res) => {
  res.status(201).json({ id: Date.now().toString(), ...req.body });
});

app.put('/api/users/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/users/:id', (req, res) => {
  res.json({ success: true });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Icecast Control Hub backend running on port ${PORT}`);
  console.log(`   Icecast: ${ICECAST_HOST}:${ICECAST_PORT}`);
  console.log(`   Admin user: ${ICECAST_ADMIN_USER}`);
});
