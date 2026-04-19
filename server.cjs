/**
 * Icecast Control Hub - Backend Server v2.3
 * Fixes:
 *  - Bug 1: Log levels now parsed from actual log content (INFO/WARN/ERROR)
 *  - Bug 2: Log timestamps now parsed from each log line
 *  - Bug 3: Stats now include cpu, memory, uptime for Server Control screen
 *  - Bug 4: Mountpoints y Users ahora persisten en archivo JSON
 *  - Bug 5: Mountpoints ahora tienen credenciales independientes en icecast.xml
 */

const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/var/www/icecast-admin/uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  }
});
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

const ICECAST_HOST = process.env.ICECAST_HOST || 'localhost';
const ICECAST_PORT = parseInt(process.env.ICECAST_PORT || '8000');
const ICECAST_ADMIN_USER = process.env.ICECAST_ADMIN_USER || 'admin';
const ICECAST_ADMIN_PASSWORD = process.env.ICECAST_ADMIN_PASSWORD || 'hackme';
const ICECAST_CONFIG_PATH = process.env.ICECAST_CONFIG_PATH || '/etc/icecast2/icecast.xml';
const PUBLIC_HOST = process.env.PUBLIC_HOST || '129.146.17.95';

const DB_PATH = '/opt/icecast-control-hub/db.json';

app.use(cors());
app.use(express.json());

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch {}
  return { mountpoints: [], users: [] };
}

function saveDb(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error guardando db.json:', err.message);
  }
}

(function initDb() {
  const db = loadDb();
  if (db.users.length === 0) {
    db.users = [{ id: '1', username: ICECAST_ADMIN_USER, role: 'admin', active: true }];
    saveDb(db);
  }
})();

function generatePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < length; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

async function addMountToXml(mountPoint, password, mpData) {
  const xml = fs.readFileSync(ICECAST_CONFIG_PATH, 'utf8');
  const name = mpData.name || mountPoint;
  const description = mpData.description || '';
  const genre = mpData.genre || '';
  const bitrate = mpData.bitrate || 128;
  const contentType = mpData.type || mpData.contentType || 'audio/mpeg';
  const isPublic = mpData.isPublic ? 1 : 0;

  const mountBlock = `
    <mount type="normal">
        <mount-name>${mountPoint}</mount-name>
        <password>${password}</password>
        <max-listeners>100</max-listeners>
        <stream-name>${name}</stream-name>
        <stream-description>${description}</stream-description>
        <stream-genre>${genre}</stream-genre>
        <bitrate>${bitrate}</bitrate>
        <type>${contentType}</type>
        <public>${isPublic}</public>
    </mount>`;

  const updated = xml.replace('</icecast>', `${mountBlock}\n</icecast>`);
  fs.writeFileSync('/tmp/icecast_tmp.xml', updated, 'utf8');
  await execPromise(`sudo cp /tmp/icecast_tmp.xml ${ICECAST_CONFIG_PATH}`);
}

async function removeMountFromXml(mountPoint) {
  const xml = fs.readFileSync(ICECAST_CONFIG_PATH, 'utf8');
  const escaped = mountPoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\s*<mount[^>]*>[\\s\\S]*?<mount-name>${escaped}<\\/mount-name>[\\s\\S]*?<\\/mount>`, 'g');
  const updated = xml.replace(regex, '');
  fs.writeFileSync('/tmp/icecast_tmp.xml', updated, 'utf8');
  await execPromise(`sudo cp /tmp/icecast_tmp.xml ${ICECAST_CONFIG_PATH}`);
}

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

function parseIcecastStats(xml) {
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
      listeners: {
        current: parseInt(parseXmlValue(block, 'listeners') || '0'),
        peak: parseInt(parseXmlValue(block, 'listener_peak') || '0'),
      },
      isPublic: parseXmlValue(block, 'listenurl') !== null,
      streamStart: parseXmlValue(block, 'stream_start') || '',
      contentType: parseXmlValue(block, 'content-type') || 'audio/mpeg',
      currentSong: parseXmlValue(block, 'title') || '',
      artist: parseXmlValue(block, 'artist') || '',
      status: 'active',
    });
  }
  const cpuUsage = os.loadavg()[0] * 10;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const uptimeSeconds = Math.floor(os.uptime());
  // Disco
  let diskUsed = 0, diskTotal = 0;
  try {
    const { execSync } = require('child_process');
    const diskOut = execSync("df / --output=used,size --block-size=1 | tail -1").toString().trim().split(/\s+/);
    diskUsed = parseInt(diskOut[0]) || 0;
    diskTotal = parseInt(diskOut[1]) || 0;
  } catch(e) {}
  return {
    connections: { current: parseInt(parseXmlValue(xml, 'listeners') || '0'), peak: parseInt(parseXmlValue(xml, 'listener_peak') || '0') },
    listeners: { current: parseInt(parseXmlValue(xml, 'listeners') || '0'), peak: parseInt(parseXmlValue(xml, 'listener_peak') || '0') },
    version: parseXmlValue(xml, 'server_id') || 'Icecast2',
    totalConnections: parseInt(parseXmlValue(xml, 'listeners') || '0'),
    serverStart: parseXmlValue(xml, 'server_start') || '',
    serverVersion: parseXmlValue(xml, 'server_id') || 'Icecast2',
    bandwidth: { outgoing: parseInt(parseXmlValue(xml, 'outgoing_kbitrate') || '0'), incoming: parseInt(parseXmlValue(xml, 'incoming_kbitrate') || '0') },
    cpu: Math.min(Math.round(cpuUsage), 100),
    cpuCores: os.cpus().length,
    cpuModel: os.cpus()[0]?.model || 'N/A',
    loadAvg: os.loadavg(),
    memory: usedMem,
    memoryTotal: totalMem,
    memoryFree: freeMem,
    memoryPct: Math.round((usedMem / totalMem) * 100),
    disk: { used: diskUsed, total: diskTotal, pct: diskTotal > 0 ? Math.round((diskUsed / diskTotal) * 100) : 0 },
    uptime: uptimeSeconds,
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    osRelease: os.release(),
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

function parseLogLine(line, source) {
  const icecastMatch = line.match(/^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]\s+(INFO|WARN|ERROR|DEBUG)\s+(.+)$/);
  if (icecastMatch) {
    const levelMap = { INFO: 'info', WARN: 'warning', ERROR: 'error', DEBUG: 'info' };
    return { timestamp: new Date(icecastMatch[1]).toISOString(), level: levelMap[icecastMatch[2]] || 'info', source, message: icecastMatch[3].trim() };
  }
  const accessMatch = line.match(/^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([^"]+)"\s+(\d+)/);
  if (accessMatch) {
    const status = parseInt(accessMatch[4]);
    return { timestamp: new Date(accessMatch[2]).toISOString(), level: status >= 500 ? 'error' : status >= 400 ? 'warning' : 'info', source, message: `${accessMatch[1]} - ${accessMatch[3]} ${status}` };
  }
  return { timestamp: new Date().toISOString(), level: 'info', source, message: line };
}

app.post('/api/auth/login', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const encoded = authHeader.replace('Basic ', '');
  let username = '', password = '';
  try {
    [username, password] = Buffer.from(encoded, 'base64').toString().split(':');
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid credentials format' });
  }

  // Verificar si es el admin de Icecast
  if (username === ICECAST_ADMIN_USER && password === ICECAST_ADMIN_PASSWORD) {
    return res.json({ success: true, message: 'Login successful', user: { username, role: 'admin', allowedMountpoints: [] } });
  }

  // Verificar contra la DB de usuarios
  const db = loadDb();
  const user = (db.users || []).find(u => u.username === username && u.password === password && u.active);
  if (user) {
    if (user.role === 'admin') {
      return res.json({ success: true, message: 'Login successful', user: { id: user.id, username: user.username, role: 'admin', allowedMountpoints: [] } });
    }
    if (user.role === 'streamer') {
      // Obtener info de los mountpoints asignados
      const assignedMountpoints = (db.mountpoints || []).filter(mp => (user.allowedMountpoints || []).includes(mp.id));
      return res.json({ success: true, message: 'Login successful', user: { id: user.id, username: user.username, role: 'streamer', allowedMountpoints: user.allowedMountpoints || [], mountpoints: assignedMountpoints } });
    }
  }

  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/api/server-health', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    res.json({ status: result.status === 200 ? 'running' : 'error', available: result.status === 200, configPath: ICECAST_CONFIG_PATH, port: ICECAST_PORT });
  } catch {
    res.json({ status: 'offline', available: false, configPath: ICECAST_CONFIG_PATH, port: ICECAST_PORT });
  }
});

app.get('/api/server-status', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    const installed = fs.existsSync(ICECAST_CONFIG_PATH);
    res.json({ installed, status: result.status === 200 ? 'running' : 'stopped', configPath: ICECAST_CONFIG_PATH, port: ICECAST_PORT });
  } catch {
    res.json({ installed: fs.existsSync(ICECAST_CONFIG_PATH), status: 'stopped', port: ICECAST_PORT });
  }
});

app.get('/api/servers', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    const status = result.status === 200 ? 'online' : 'offline';
    res.json([{ id: 'local', name: 'Local Icecast Server', host: PUBLIC_HOST, port: ICECAST_PORT, adminUser: ICECAST_ADMIN_USER, status, isLocal: true }]);
  } catch {
    res.json([{ id: 'local', name: 'Local Icecast Server', host: PUBLIC_HOST, port: ICECAST_PORT, adminUser: ICECAST_ADMIN_USER, status: 'offline', isLocal: true }]);
  }
});

app.post('/api/servers', (req, res) => { res.status(201).json({ id: Date.now().toString(), ...req.body, status: 'unknown' }); });
app.put('/api/servers/:id', (req, res) => { res.json({ id: req.params.id, ...req.body }); });
app.delete('/api/servers/:id', (req, res) => { res.json({ success: true }); });

app.get('/api/servers/:serverId/stats', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    if (result.status !== 200) throw new Error('Icecast unreachable');
    res.json(parseIcecastStats(result.body));
  } catch (err) {
    res.status(503).json({ error: 'Could not reach Icecast', details: err.message });
  }
});

app.get('/api/servers/:serverId/mountpoints', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    let liveMountpoints = [];
    if (result.status === 200) liveMountpoints = parseIcecastStats(result.body).mountpoints;
    const db = loadDb();
    const merged = (db.mountpoints || []).map(mp => {
      const mountPath = mp.point || mp.mount;
      const live = liveMountpoints.find(l => l.mount === mountPath);
      if (live) return { ...mp, listeners: live.listeners, currentSong: live.currentSong, artist: live.artist, streamStart: live.streamStart, status: 'active' };
      return { ...mp, status: mp.status || 'configured' };
    });
    for (const live of liveMountpoints) {
      if (!merged.find(m => (m.point || m.mount) === live.mount)) merged.push(live);
    }
    res.json(merged);
  } catch (err) {
    const db = loadDb();
    res.json(db.mountpoints || []);
  }
});

app.get('/api/servers/:serverId/mountpoints/:mountpointId', async (req, res) => {
  try {
    const db = loadDb();
    const mp = (db.mountpoints || []).find(m => m.id === req.params.mountpointId);
    if (mp) return res.json(mp);
    const result = await icecastRequest('/admin/stats');
    if (result.status !== 200) throw new Error('Icecast unreachable');
    const liveMp = parseIcecastStats(result.body).mountpoints.find(m => m.id === req.params.mountpointId);
    if (!liveMp) return res.status(404).json({ error: 'Mountpoint not found' });
    res.json(liveMp);
  } catch (err) {
    res.status(503).json({ error: 'Could not reach Icecast', details: err.message });
  }
});

app.post('/api/servers/:serverId/mountpoints', async (req, res) => {
  const db = loadDb();
  const mountPoint = req.body.point || req.body.mount || '/stream';
  const streamPassword = generatePassword();
  const streamUser = 'source';
  const newMp = {
    id: Date.now().toString(),
    ...req.body,
    point: mountPoint,
    mount: mountPoint,
    streamUser,
    streamPassword,
    encoderInfo: {
      host: PUBLIC_HOST,
      port: ICECAST_PORT,
      mount: mountPoint,
      username: streamUser,
      password: streamPassword,
      protocol: 'Icecast2',
      streamUrl: `http://${PUBLIC_HOST}:${ICECAST_PORT}${mountPoint}`,
    },
    listeners: { current: 0, peak: 0 },
    status: 'configured',
    createdAt: new Date().toISOString(),
  };
  db.mountpoints = db.mountpoints || [];
  db.mountpoints.push(newMp);
  saveDb(db);
  try {
    await addMountToXml(mountPoint, streamPassword, newMp);
    await execPromise('sudo systemctl reload icecast2 || sudo systemctl restart icecast2');
    console.log(`✅ Mount ${mountPoint} agregado al XML`);
  } catch (err) {
    console.error('Error updating icecast.xml:', err.message);
  }
  res.status(201).json(newMp);
});

app.put('/api/servers/:serverId/mountpoints/:mountpointId', async (req, res) => {
  const db = loadDb();
  db.mountpoints = db.mountpoints || [];
  const idx = db.mountpoints.findIndex(m => m.id === req.params.mountpointId);
  if (idx === -1) {
    const updated = { id: req.params.mountpointId, ...req.body };
    db.mountpoints.push(updated);
    saveDb(db);
    return res.json(updated);
  }
  const oldMp = db.mountpoints[idx];
  const mountPoint = req.body.point || oldMp.point || oldMp.mount;
  const streamPassword = req.body.streamPassword || oldMp.streamPassword || generatePassword();
  const updatedMp = {
    ...oldMp, ...req.body,
    id: req.params.mountpointId,
    point: mountPoint, mount: mountPoint,
    streamUser: 'source', streamPassword,
    encoderInfo: { host: PUBLIC_HOST, port: ICECAST_PORT, mount: mountPoint, username: 'source', password: streamPassword, protocol: 'Icecast2', streamUrl: `http://${PUBLIC_HOST}:${ICECAST_PORT}${mountPoint}` },
  };
  db.mountpoints[idx] = updatedMp;
  saveDb(db);
  try {
    await removeMountFromXml(mountPoint);
    await addMountToXml(mountPoint, streamPassword, updatedMp);
    await execPromise('sudo systemctl reload icecast2 || sudo systemctl restart icecast2');
    console.log(`✅ Mount ${mountPoint} actualizado en XML`);
  } catch (err) {
    console.error('Error updating icecast.xml:', err.message);
  }
  res.json(updatedMp);
});

app.delete('/api/servers/:serverId/mountpoints/:mountpointId', async (req, res) => {
  const db = loadDb();
  const mp = (db.mountpoints || []).find(m => m.id === req.params.mountpointId);
  db.mountpoints = (db.mountpoints || []).filter(m => m.id !== req.params.mountpointId);
  saveDb(db);
  if (mp) {
    const mountPoint = mp.point || mp.mount;
    try {
      await removeMountFromXml(mountPoint);
      await execPromise('sudo systemctl reload icecast2 || sudo systemctl restart icecast2');
      console.log(`✅ Mount ${mountPoint} eliminado del XML`);
    } catch (err) { console.error('Error removing mount from xml:', err.message); }
    try { await icecastRequest(`/admin/killsource?mount=${encodeURIComponent(mountPoint)}`); } catch {}
  }
  res.json({ success: true });
});

app.get('/api/servers/:serverId/listeners', async (req, res) => {
  try {
    const result = await icecastRequest('/admin/stats');
    if (result.status !== 200) throw new Error('Icecast unreachable');
    const stats = parseIcecastStats(result.body);
    res.json({ current: stats.listeners.current, peak: stats.listeners.peak });
  } catch (err) { res.status(503).json({ error: err.message }); }
});

app.get('/api/servers/:serverId/mountpoints/:mountpointId/listeners', async (req, res) => {
  try {
    const mount = '/' + req.params.mountpointId.replace(/_/g, '/');
    const result = await icecastRequest(`/admin/listclients?mount=${encodeURIComponent(mount)}`);
    if (result.status !== 200) throw new Error('Icecast unreachable');
    const count = (result.body.match(/<ID>/g) || []).length;
    res.json({ current: count, peak: count });
  } catch (err) { res.status(503).json({ error: err.message }); }
});

app.delete('/api/servers/:serverId/mountpoints/:mountpointId/listeners/:listenerId', async (req, res) => {
  try {
    const mount = '/' + req.params.mountpointId.replace(/_/g, '/');
    await icecastRequest(`/admin/kickclient?mount=${encodeURIComponent(mount)}&id=${req.params.listenerId}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/servers/:serverId/start', async (req, res) => {
  try { await execPromise('sudo systemctl start icecast2'); res.json({ success: true, message: 'Icecast started' }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/servers/:serverId/stop', async (req, res) => {
  try { await execPromise('sudo systemctl stop icecast2'); res.json({ success: true, message: 'Icecast stopped' }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/servers/:serverId/restart', async (req, res) => {
  try { await execPromise('sudo systemctl restart icecast2'); res.json({ success: true, message: 'Icecast restarted' }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/install-server', async (req, res) => {
  try {
    if (fs.existsSync(ICECAST_CONFIG_PATH)) {
      await execPromise('sudo systemctl start icecast2');
      return res.json({ success: true, message: 'Icecast already installed, started service', installed: true });
    }
    await execPromise('sudo apt-get install -y icecast2');
    await execPromise('sudo systemctl enable icecast2');
    await execPromise('sudo systemctl start icecast2');
    res.json({ success: true, message: 'Icecast installed and started', installed: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message, installed: false }); }
});

app.post('/api/update-installation', async (req, res) => {
  try {
    await execPromise('sudo apt-get update && sudo apt-get install -y --only-upgrade icecast2');
    await execPromise('sudo systemctl restart icecast2');
    res.json({ success: true, message: 'Icecast updated successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/servers/:serverId/logs', async (req, res) => {
  const { level, query } = req.query;
  const logFiles = [
    { path: '/var/log/icecast2/access.log', source: 'access.log' },
    { path: '/var/log/icecast2/error.log', source: 'error.log' },
  ];
  const logs = [];
  for (const { path: logFile, source } of logFiles) {
    try {
      if (!fs.existsSync(logFile)) continue;
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.split('\n').filter(Boolean).slice(-200);
      for (const line of lines) {
        const entry = { id: `${source}-${logs.length}`, ...parseLogLine(line, source) };
        if (level && entry.level !== level) continue;
        if (query && !line.toLowerCase().includes(query.toLowerCase())) continue;
        logs.push(entry);
      }
    } catch {}
  }
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(logs.slice(0, 100));
});

app.get('/api/servers/:serverId/config', (req, res) => {
  try {
    if (!fs.existsSync(ICECAST_CONFIG_PATH)) return res.status(404).json({ error: 'Config file not found' });
    res.json(fs.readFileSync(ICECAST_CONFIG_PATH, 'utf8'));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/servers/:serverId/config', async (req, res) => {
  try {
    const { config } = req.body;
    if (!config) return res.status(400).json({ error: 'No config provided' });
    const tmpFile = '/tmp/icecast_config_tmp.xml';
    fs.writeFileSync(tmpFile, config, 'utf8');
    await execPromise(`sudo cp ${tmpFile} ${ICECAST_CONFIG_PATH}`);
    await execPromise('sudo systemctl reload icecast2 || sudo systemctl restart icecast2');
    res.json({ success: true, message: 'Config updated and Icecast reloaded' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users', (req, res) => {
  const db = loadDb();
  res.json(db.users || []);
});

app.post('/api/users', (req, res) => {
  const db = loadDb();
  const newUser = { id: Date.now().toString(), ...req.body, active: req.body.active !== undefined ? req.body.active : true, createdAt: new Date().toISOString() };
  db.users = db.users || [];
  db.users.push(newUser);
  saveDb(db);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const db = loadDb();
  db.users = db.users || [];
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) {
    const updated = { id: req.params.id, ...req.body };
    db.users.push(updated);
    saveDb(db);
    return res.json(updated);
  }
  db.users[idx] = { ...db.users[idx], ...req.body, id: req.params.id };
  saveDb(db);
  res.json(db.users[idx]);
});

app.delete('/api/users/:id', (req, res) => {
  const db = loadDb();
  db.users = (db.users || []).filter(u => u.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});


// ─── Upload API ──────────────────────────────────────────────────────────────
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

// ─── Service Requests API ────────────────────────────────────────────────────
app.post('/api/service-requests', (req, res) => {
  const { name, username, password, radioName, plan, codec, paymentMethod, paymentRef, paymentHolder, receiptUrl, status, submittedAt, phoneCountry, phone, email } = req.body;
  if (!name || !username || !password || !radioName || !plan) {
    return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
  }
  const db = loadDb();
  if (!db.serviceRequests) db.serviceRequests = [];
  const request = {
    id: Date.now().toString(),
    name, username, password, radioName, plan,
    codec: codec || 'AAC',
    paymentMethod: paymentMethod || '',
    paymentRef: paymentRef || '',
    paymentHolder: paymentHolder || '',
    receiptUrl: receiptUrl || '',
    phoneCountry: phoneCountry || '',
    phone: phone || '',
    email: email || '',
    status: status || 'pending_payment',
    createdAt: submittedAt || new Date().toISOString()
  };
  db.serviceRequests.push(request);
  saveDb(db);
  res.json({ success: true, message: 'Solicitud recibida correctamente' });
});

app.get('/api/service-requests', (req, res) => {
  const db = loadDb();
  res.json({ success: true, data: db.serviceRequests || [] });
});

app.patch('/api/service-requests/:id', (req, res) => {
  const db = loadDb();
  if (!db.serviceRequests) return res.status(404).json({ success: false, error: 'No encontrado' });
  const idx = db.serviceRequests.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
  db.serviceRequests[idx] = { ...db.serviceRequests[idx], ...req.body };
  saveDb(db);
  res.json({ success: true, data: db.serviceRequests[idx] });
});

app.delete('/api/service-requests/:id', (req, res) => {
  const db = loadDb();
  if (!db.serviceRequests) return res.status(404).json({ success: false, error: 'No encontrado' });
  const idx = db.serviceRequests.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
  db.serviceRequests.splice(idx, 1);
  saveDb(db);
  res.json({ success: true });
});


// ─── APROBAR SOLICITUD → crear cuenta + mountpoint + email ───────────────────
app.post('/api/service-requests/:id/approve', async (req, res) => {
  const db = loadDb();
  if (!db.serviceRequests) return res.status(404).json({ success: false, error: 'No encontrado' });
  const idx = db.serviceRequests.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
  const sr = db.serviceRequests[idx];
  const { note, notifyEmail } = req.body;

  // 1. Crear usuario en db.json
  if (!db.users) db.users = [];
  const existingUser = db.users.find(u => u.username === sr.username);
  // Calcular fecha de vencimiento según plan
  const planPeriod = (db.siteConfig && db.siteConfig.plans || []).find(p => p.name === sr.plan);
  const periodDays = planPeriod && planPeriod.period === 'año' ? 365 : 30;
  const expiresAt = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();
  if (!existingUser) {
    db.users.push({
      id: Date.now().toString(),
      username: sr.username,
      password: sr.password,
      role: 'streamer',
      radioName: sr.radioName,
      plan: sr.plan,
      planPrice: planPeriod ? planPeriod.price : '0',
      planPeriod: planPeriod ? planPeriod.period : 'mes',
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt,
      serviceRequestId: sr.id,
      email: sr.email || '',
      phone: (sr.phoneCountry || '') + (sr.phone || ''),
      allowedMountpoints: ['/' + sr.username]
    });
  }

  // 2. Crear mountpoint en db.json
  if (!db.mountpoints) db.mountpoints = [];
  const existingMount = db.mountpoints.find(m => m.mount === `/${sr.username}`);
  if (!existingMount) {
    db.mountpoints.push({
      id: Date.now().toString() + '1',
      mount: `/${sr.username}`,
      username: sr.username,
      password: sr.password,
      bitrate: '128',
      codec: sr.codec || 'AAC',
      description: sr.radioName,
      genre: 'Various',
      active: true
    });
  }

  // 3. Actualizar icecast.xml
  try {
    const fs = require('fs');
    let xml = fs.readFileSync(ICECAST_CONFIG_PATH, 'utf8');
    const mountBlock = '\n    <mount>\n      <mount-name>/' + sr.username + '</mount-name>\n      <username>' + sr.username + '</username>\n      <password>' + sr.password + '</password>\n      <max-listeners>100</max-listeners>\n      <stream-name>' + sr.radioName + '</stream-name>\n    </mount>';
    if (!xml.includes('<mount-name>/' + sr.username + '</mount-name>')) {
      xml = xml.replace('</icecast>', mountBlock + '\n</icecast>');
      fs.writeFileSync(ICECAST_CONFIG_PATH, xml);
    }
  } catch(e) { console.error('Error actualizando icecast.xml:', e.message); }

  // 4. Actualizar estado
  db.serviceRequests[idx] = { ...sr, status: 'approved', approvedAt: new Date().toISOString(), note: note || '' };
  saveDb(db);

  // 5. Enviar email si se proporcionó
  let emailSent = false;
  if (notifyEmail) {
    emailSent = await sendApprovalEmail(notifyEmail, sr.name, sr.username, sr.password, sr.radioName, sr.phone || '');
  }

  res.json({ success: true, message: 'Cuenta creada y aprobada', emailSent });
});

// ─── RECHAZAR SOLICITUD ───────────────────────────────────────────────────────
app.post('/api/service-requests/:id/reject', (req, res) => {
  const db = loadDb();
  if (!db.serviceRequests) return res.status(404).json({ success: false, error: 'No encontrado' });
  const idx = db.serviceRequests.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
  const { note } = req.body;
  db.serviceRequests[idx] = { ...db.serviceRequests[idx], status: 'rejected', rejectedAt: new Date().toISOString(), note: note || '' };
  saveDb(db);
  res.json({ success: true });
});



// ─── MY ACCOUNT (streamer) ───────────────────────────────────────────────────
app.get('/api/my-account', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const encoded = authHeader.replace('Basic ', '');
  let username = '';
  try { [username] = Buffer.from(encoded, 'base64').toString().split(':'); } catch { return res.status(401).json({ success: false }); }
  const db = loadDb();
  const user = (db.users || []).find(u => u.username === username);
  if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  const sr = (db.serviceRequests || []).find(r => r.username === username && r.status === 'approved');
  const now = new Date();
  const expires = user.expiresAt ? new Date(user.expiresAt) : null;
  const daysLeft = expires ? Math.ceil((expires - now) / (1000 * 60 * 60 * 24)) : null;
  res.json({ success: true, data: {
    username: user.username,
    plan: user.plan || '—',
    planPrice: user.planPrice || '0',
    planPeriod: user.planPeriod || 'mes',
    createdAt: user.createdAt,
    expiresAt: user.expiresAt || null,
    daysLeft,
    status: !expires ? 'no_expiry' : daysLeft < 0 ? 'expired' : daysLeft <= 7 ? 'expiring_soon' : 'active',
    email: user.email || (sr ? sr.email : ''),
    phone: user.phone || '',
    paymentMethod: sr ? sr.paymentMethod : '',
  }});
});

app.post('/api/my-account/change-password', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const encoded = authHeader.replace('Basic ', '');
  let username = '', currentPass = '';
  try { [username, currentPass] = Buffer.from(encoded, 'base64').toString().split(':'); } catch { return res.status(401).json({ success: false }); }
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' });
  const db = loadDb();
  const idx = (db.users || []).findIndex(u => u.username === username && u.password === currentPass);
  if (idx === -1) return res.status(401).json({ success: false, error: 'Contraseña actual incorrecta' });
  db.users[idx].password = newPassword;
  // Actualizar también en mountpoints
  (db.mountpoints || []).forEach((m, i) => { if (m.username === username) db.mountpoints[i].password = newPassword; });
  saveDb(db);
  res.json({ success: true, message: 'Contraseña actualizada correctamente' });
});

app.post('/api/my-account/renewal-request', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const encoded = authHeader.replace('Basic ', '');
  let username = '';
  try { [username] = Buffer.from(encoded, 'base64').toString().split(':'); } catch { return res.status(401).json({ success: false }); }
  const db = loadDb();
  const user = (db.users || []).find(u => u.username === username);
  if (!user) return res.status(404).json({ success: false });
  const { paymentMethod, paymentRef, paymentHolder, receiptUrl } = req.body;
  if (!db.renewalRequests) db.renewalRequests = [];
  db.renewalRequests.push({
    id: Date.now().toString(),
    username,
    name: user.username,
    plan: user.plan,
    planPrice: user.planPrice,
    paymentMethod, paymentRef, paymentHolder, receiptUrl,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  saveDb(db);
  res.json({ success: true, message: 'Solicitud de renovación enviada' });
});

// ─── BILLING ─────────────────────────────────────────────────────────────────
app.get('/api/billing', (req, res) => {
  const db = loadDb();
  const users = (db.users || []).filter(u => u.role === 'streamer');
  const requests = (db.serviceRequests || []).filter(r => r.status === 'approved');
  
  // Construir registros de billing
  const records = users.map(u => {
    const req = requests.find(r => r.username === u.username);
    const now = new Date();
    const expires = u.expiresAt ? new Date(u.expiresAt) : null;
    const daysLeft = expires ? Math.ceil((expires - now) / (1000 * 60 * 60 * 24)) : null;
    return {
      id: u.id,
      username: u.username,
      name: req ? req.name : u.username,
      email: u.email || (req ? req.email : ''),
      phone: u.phone || '',
      plan: u.plan || '—',
      planPrice: u.planPrice || '0',
      planPeriod: u.planPeriod || 'mes',
      active: u.active !== false,
      createdAt: u.createdAt,
      expiresAt: u.expiresAt || null,
      daysLeft: daysLeft,
      status: !expires ? 'no_expiry' : daysLeft < 0 ? 'expired' : daysLeft <= 7 ? 'expiring_soon' : 'active',
      paymentMethod: req ? req.paymentMethod : '',
      paymentRef: req ? req.paymentRef : '',
      approvedAt: req ? req.approvedAt : u.createdAt,
    };
  });

  // Stats
  const totalMRR = records.reduce((s, r) => s + (r.active ? parseFloat(r.planPrice || 0) : 0), 0);
  const expiringSoon = records.filter(r => r.status === 'expiring_soon').length;
  const expired = records.filter(r => r.status === 'expired').length;

  res.json({ success: true, data: { records, stats: { totalMRR, expiringSoon, expired, totalClients: records.length } } });
});

app.patch('/api/billing/:userId/expires', (req, res) => {
  const db = loadDb();
  const idx = (db.users || []).findIndex(u => u.id === req.params.userId);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  const { expiresAt } = req.body;
  db.users[idx].expiresAt = expiresAt;
  saveDb(db);
  res.json({ success: true });
});

app.patch('/api/billing/:userId/renew', (req, res) => {
  const db = loadDb();
  const idx = (db.users || []).findIndex(u => u.id === req.params.userId);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  const user = db.users[idx];
  const periodDays = user.planPeriod === 'año' ? 365 : 30;
  const base = user.expiresAt && new Date(user.expiresAt) > new Date() ? new Date(user.expiresAt) : new Date();
  db.users[idx].expiresAt = new Date(base.getTime() + periodDays * 24 * 60 * 60 * 1000).toISOString();
  db.users[idx].active = true;
  saveDb(db);
  res.json({ success: true, expiresAt: db.users[idx].expiresAt });
});

// ─── Site Config API ──────────────────────────────────────────────────────────
app.get('/api/site-config', (req, res) => {
  const db = loadDb();
  const defaultConfig = {
    siteName: "StreamPro",
    tagline: "Tu plataforma de radio online",
    description: "La solución más completa para gestionar y transmitir audio en vivo. Profesional, rápido y confiable.",
    primaryColor: "#2563eb",
    accentColor: "#7c3aed",
    logoUrl: "",
    heroImage: "",
    ctaText: "Comenzar ahora",
    ctaSubtext: "Configura tu radio en minutos",
    features: [
      { icon: "radio", title: "Streaming en Vivo", description: "Transmite audio de alta calidad a tus oyentes en cualquier parte del mundo." },
      { icon: "users", title: "Gestión de Oyentes", description: "Monitorea y analiza tu audiencia en tiempo real con estadísticas detalladas." },
      { icon: "shield", title: "Seguridad Total", description: "Control de acceso por roles, autenticación segura y protección de tus streams." },
      { icon: "zap", title: "Alta Performance", description: "Infraestructura optimizada para transmisiones continuas sin interrupciones." },
      { icon: "music", title: "Multi-formato", description: "Soporte para MP3, AAC, OGG y más formatos de audio profesionales." },
      { icon: "settings", title: "Panel Completo", description: "Administra todo desde un solo lugar: streams, usuarios, estadísticas y más." }
    ],
    plans: [
      { name: "Básico", price: "9.99", period: "mes", color: "#2563eb", features: ["1 Stream", "128 kbps", "100 oyentes", "Soporte básico"], highlighted: false },
      { name: "Pro", price: "24.99", period: "mes", color: "#7c3aed", features: ["5 Streams", "320 kbps", "500 oyentes", "Soporte prioritario", "Estadísticas avanzadas"], highlighted: true },
      { name: "Business", price: "59.99", period: "mes", color: "#059669", features: ["Streams ilimitados", "Sin límite de bitrate", "Oyentes ilimitados", "Soporte 24/7", "SLA garantizado", "IP dedicada"], highlighted: false }
    ],
    socialLinks: { facebook: "", twitter: "", instagram: "", youtube: "" },
    contactEmail: "",
    footerText: "© 2025 StreamPro. Todos los derechos reservados."
  };
  res.json({ success: true, data: { ...defaultConfig, ...(db.siteConfig || {}) } });
});

app.put('/api/site-config', (req, res) => {
  const db = loadDb();
  db.siteConfig = { ...(db.siteConfig || {}), ...req.body };
  saveDb(db);
  res.json({ success: true, data: db.siteConfig });
});


// ─── SMTP CONFIG ────────────────────────────────────────────────────────────
app.get('/api/smtp-config', (req, res) => {
  const db = loadDb();
  const cfg = db.smtpConfig || {};
  // No devolver password en claro
  res.json({ success: true, data: { ...cfg, pass: cfg.pass ? '••••••••' : '' } });
});

app.put('/api/smtp-config', (req, res) => {
  const { host, port, secure, user, pass, fromName, fromEmail } = req.body;
  const db = loadDb();
  const prev = db.smtpConfig || {};
  db.smtpConfig = {
    host: host || 'smtp.gmail.com',
    port: parseInt(port) || 587,
    secure: secure === true || secure === 'true',
    user: user || '',
    pass: pass && pass !== '••••••••' ? pass : (prev.pass || ''),
    fromName: fromName || '',
    fromEmail: fromEmail || user || ''
  };
  saveDb(db);
  res.json({ success: true, message: 'Configuración SMTP guardada' });
});

app.post('/api/smtp-test', async (req, res) => {
  const db = loadDb();
  const cfg = db.smtpConfig;
  if (!cfg || !cfg.user || !cfg.pass) return res.status(400).json({ success: false, error: 'SMTP no configurado' });
  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass }
    });
    await transporter.sendMail({
      from: `"${cfg.fromName}" <${cfg.fromEmail || cfg.user}>`,
      to: cfg.user,
      subject: '✅ Test SMTP - Icecast Control Hub',
      html: '<h2>¡Funciona!</h2><p>Tu configuración SMTP está correcta.</p>'
    });
    res.json({ success: true, message: 'Email de prueba enviado a ' + cfg.user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper para enviar credenciales al aprobar
async function sendApprovalEmail(toEmail, toName, username, password, radioName, phone) {
  const db = loadDb();
  const cfg = db.smtpConfig;
  if (!cfg || !cfg.user || !cfg.pass) return false;
  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass }
    });
    await transporter.sendMail({
      from: `"${cfg.fromName || 'Icecast Control Hub'}" <${cfg.fromEmail || cfg.user}>`,
      to: toEmail || cfg.user,
      subject: '🎙️ ¡Tu cuenta de radio ha sido activada!',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:28px 32px">
            <h1 style="color:white;margin:0;font-size:22px">🎙️ ¡Bienvenido a bordo!</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0">Tu cuenta de radio ha sido activada</p>
          </div>
          <div style="padding:28px 32px">
            <p style="color:#374151">Hola <strong>${toName}</strong>,</p>
            <p style="color:#374151">Tu solicitud para <strong>${radioName}</strong> ha sido aprobada. Aquí están tus credenciales:</p>
            <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
              <p style="margin:4px 0;color:#374151"><strong>Usuario:</strong> ${username}</p>
              <p style="margin:4px 0;color:#374151"><strong>Contraseña:</strong> ${password}</p>
            </div>
            <p style="color:#6b7280;font-size:13px">Si tienes preguntas, responde a este correo.</p>
          </div>
        </div>
      `
    });
    return true;
  } catch (err) {
    console.error('Error enviando email:', err.message);
    return false;
  }
}

app.listen(PORT, () => {
  console.log(`✅ Icecast Control Hub backend v2.3 corriendo en puerto ${PORT}`);
  console.log(`   Icecast: ${ICECAST_HOST}:${ICECAST_PORT}`);
  console.log(`   Admin user: ${ICECAST_ADMIN_USER}`);
  console.log(`   DB: ${DB_PATH}`);
  console.log(`   Public host: ${PUBLIC_HOST}`);
});
