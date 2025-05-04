
/**
 * API endpoints for the built-in Icecast server
 * This file would be used on the server-side to implement API endpoints
 * 
 * Note: This is a placeholder file to demonstrate the API structure.
 * In a production environment, these routes would be implemented on the server.
 */

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const router = express.Router();

// Configuration
const ICECAST_CONFIG_DIR = process.env.ICECAST_CONFIG_DIR || '/etc/icecast2';
const ICECAST_CONFIG_PATH = process.env.ICECAST_CONFIG_PATH || path.join(ICECAST_CONFIG_DIR, 'icecast.xml');

// Check server health
router.get('/server-health', (req, res) => {
  exec('command -v icecast2', (error, stdout, stderr) => {
    if (error) {
      return res.status(404).json({
        available: false,
        message: 'Icecast2 is not installed on this system'
      });
    }
    
    // Check if service is running
    exec('systemctl is-active icecast2', (error, stdout, stderr) => {
      const status = stdout.trim() === 'active' ? 'running' : 'stopped';
      res.json({
        available: true,
        status,
        configPath: ICECAST_CONFIG_PATH
      });
    });
  });
});

// Get server status
router.get('/server-status', (req, res) => {
  exec('command -v icecast2', (error, stdout, stderr) => {
    if (error) {
      return res.status(200).json({
        installed: false
      });
    }
    
    // Get version
    exec('icecast2 -v', (error, stdout, stderr) => {
      let version = 'unknown';
      if (!error && stderr) {
        // Usually version is in stderr for command line tools
        const match = stderr.match(/Icecast (\d+\.\d+\.\d+)/i);
        if (match) {
          version = match[1];
        }
      }
      
      // Check config file
      const configExists = fs.existsSync(ICECAST_CONFIG_PATH);
      let port = 8000;
      
      if (configExists) {
        try {
          const config = fs.readFileSync(ICECAST_CONFIG_PATH, 'utf8');
          const portMatch = config.match(/<port>(\d+)<\/port>/i);
          if (portMatch) {
            port = parseInt(portMatch[1], 10);
          }
        } catch (err) {
          console.error("Failed to read config:", err);
        }
      }
      
      res.json({
        installed: true,
        version,
        configPath: ICECAST_CONFIG_PATH,
        port
      });
    });
  });
});

// Install Icecast server
router.post('/install-server', async (req, res) => {
  const { serverPort = 8000, adminUser = 'admin', adminPassword } = req.body;
  
  if (!adminPassword) {
    return res.status(400).json({
      success: false,
      message: 'Admin password is required'
    });
  }
  
  // In a real implementation, this would run the installation process
  // For demonstration purposes, we return a success response
  
  // This simulates creating a config file
  const configTemplate = `<icecast>
    <location>Earth</location>
    <admin>admin@example.com</admin>
    
    <limits>
        <clients>100</clients>
        <sources>10</sources>
        <queue-size>524288</queue-size>
        <client-timeout>30</client-timeout>
        <header-timeout>15</header-timeout>
        <source-timeout>10</source-timeout>
        <burst-on-connect>1</burst-on-connect>
        <burst-size>65535</burst-size>
    </limits>

    <authentication>
        <source-password>hackme</source-password>
        <relay-password>hackme</relay-password>
        <admin-user>${adminUser}</admin-user>
        <admin-password>${adminPassword}</admin-password>
    </authentication>

    <hostname>localhost</hostname>

    <listen-socket>
        <port>${serverPort}</port>
        <bind-address>0.0.0.0</bind-address>
    </listen-socket>

    <fileserve>1</fileserve>

    <paths>
        <basedir>/usr/share/icecast2</basedir>
        <logdir>/var/log/icecast2</logdir>
        <webroot>/usr/share/icecast2/web</webroot>
        <adminroot>/usr/share/icecast2/admin</adminroot>
        <alias source="/" destination="/status.xsl"/>
    </paths>
</icecast>`;

  // In a real implementation, we would write this to disk and start the service
  setTimeout(() => {
    // Simulate a delayed installation process (this would be a real installation in production)
    res.json({
      success: true,
      message: 'Icecast server installed successfully',
      port: serverPort,
      configPath: ICECAST_CONFIG_PATH
    });
  }, 2000);
});

module.exports = router;
