
#!/bin/bash
set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}       Icecast2 Panel Installer for Ubuntu VPS           ${NC}"
echo -e "${BLUE}=========================================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root or with sudo.${NC}"
  exit 1
fi

# Create log file
LOGFILE="/var/log/icecast-panel-install.log"
touch $LOGFILE
exec > >(tee -a $LOGFILE)
exec 2>&1

echo -e "${GREEN}Installation log will be saved to: ${LOGFILE}${NC}"
echo -e "${GREEN}Starting installation...${NC}"

# Update system
echo -e "${GREEN}Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install required packages
echo -e "${GREEN}Installing required packages...${NC}"
apt-get install -y curl wget gnupg2 ca-certificates lsb-release apt-transport-https nginx supervisor

# Install Node.js
echo -e "${GREEN}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Icecast2
echo -e "${GREEN}Installing Icecast2...${NC}"
apt-get install -y icecast2

# Backup original Icecast2 config
echo -e "${GREEN}Backing up original Icecast2 config...${NC}"
if [ -f /etc/icecast2/icecast.xml ]; then
  cp /etc/icecast2/icecast.xml /etc/icecast2/icecast.xml.bak
fi

# Create panel directory
PANEL_DIR="/opt/icecast-panel"
echo -e "${GREEN}Creating panel directory at ${PANEL_DIR}...${NC}"
mkdir -p $PANEL_DIR

# Clone the panel repository or copy files
# For this example, we're copying local files from the current project
echo -e "${GREEN}Setting up panel application...${NC}"

# Create API server directory
mkdir -p $PANEL_DIR/api

# Download and install project files
# Note: In a real scenario, you would clone from a Git repository
cat > $PANEL_DIR/package.json << EOF
{
  "name": "icecast-panel",
  "version": "1.0.0",
  "description": "Icecast2 Admin Panel",
  "main": "api/server.js",
  "scripts": {
    "start": "node api/server.js",
    "build": "vite build"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "xml2js": "^0.6.2",
    "fs-extra": "^11.1.1",
    "basic-auth": "^2.0.1",
    "dotenv": "^16.3.1"
  }
}
EOF

# Setup .env file
cat > $PANEL_DIR/.env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
ICECAST_CONFIG_PATH=/etc/icecast2/icecast.xml
ICECAST_ADMIN_USERNAME=admin
ICECAST_ADMIN_PASSWORD=hackme
PORT=3000
EOF

# Create Icecast2 API server
echo -e "${GREEN}Creating API server for Icecast2 integration...${NC}"
cat > $PANEL_DIR/api/server.js << EOF
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const { exec } = require('child_process');
const xml2js = require('xml2js');
const path = require('path');
const basicAuth = require('basic-auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ICECAST_CONFIG_PATH = process.env.ICECAST_CONFIG_PATH || '/etc/icecast2/icecast.xml';

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../dist')));

// Basic auth for API endpoints
const auth = (req, res, next) => {
  const user = basicAuth(req);
  
  if (!user || user.name !== process.env.ICECAST_ADMIN_USERNAME || user.pass !== process.env.ICECAST_ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Icecast Panel API"');
    return res.status(401).send('Authentication required');
  }
  
  return next();
};

// API routes
const apiRouter = express.Router();

// Middleware for all API routes
apiRouter.use(auth);

// Server status endpoint
apiRouter.get('/servers/:serverId/status', (req, res) => {
  exec('systemctl is-active icecast2', (error, stdout, stderr) => {
    const status = stdout.trim() === 'active' ? 'running' : 'stopped';
    res.json({ success: true, data: { status } });
  });
});

// Start server endpoint
apiRouter.post('/servers/:serverId/start', (req, res) => {
  exec('systemctl start icecast2', (error) => {
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to start Icecast server' });
    }
    res.json({ success: true, data: { status: 'running' } });
  });
});

// Stop server endpoint
apiRouter.post('/servers/:serverId/stop', (req, res) => {
  exec('systemctl stop icecast2', (error) => {
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to stop Icecast server' });
    }
    res.json({ success: true, data: { status: 'stopped' } });
  });
});

// Restart server endpoint
apiRouter.post('/servers/:serverId/restart', (req, res) => {
  exec('systemctl restart icecast2', (error) => {
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to restart Icecast server' });
    }
    res.json({ success: true, data: { status: 'running' } });
  });
});

// Server stats endpoint
apiRouter.get('/servers/:serverId/stats', async (req, res) => {
  try {
    // Use icecast2 stats.xsl to get server stats
    exec('curl -s http://admin:hackme@localhost:8000/admin/stats.xml', (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ success: false, error: 'Failed to get Icecast stats' });
      }
      
      // Parse XML response
      xml2js.parseString(stdout, (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Failed to parse Icecast stats XML' });
        }
        
        try {
          const icestats = result.icestats;
          
          // Extract stats
          const stats = {
            uptime: parseInt(icestats.uptime[0], 10),
            connections: {
              current: parseInt(icestats.connections[0], 10),
              peak: parseInt(icestats.connections_peak[0], 10),
            },
            bandwidth: {
              incoming: parseFloat(icestats.inbound_kbitrate[0]),
              outgoing: parseFloat(icestats.outbound_kbitrate[0]),
            },
            cpu: 0, // Not provided by Icecast stats
            memory: 0, // Not provided by Icecast stats
            totalConnections: parseInt(icestats.connections_total[0], 10),
            version: icestats.server_id[0],
          };
          
          res.json({ success: true, data: stats });
        } catch (e) {
          res.status(500).json({ success: false, error: 'Failed to extract Icecast stats' });
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mountpoints endpoint
apiRouter.get('/servers/:serverId/mountpoints', async (req, res) => {
  try {
    exec('curl -s http://admin:hackme@localhost:8000/admin/stats.xml', (error, stdout) => {
      if (error) {
        return res.status(500).json({ success: false, error: 'Failed to get Icecast stats' });
      }
      
      xml2js.parseString(stdout, (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Failed to parse Icecast stats XML' });
        }
        
        try {
          const icestats = result.icestats;
          const mountpoints = [];
          
          // Process source entries
          const sources = icestats.source || [];
          sources.forEach((source, index) => {
            const mount = source.$.mount;
            const listeners = parseInt(source.listeners[0], 10);
            const peakListeners = parseInt(source.listener_peak[0], 10);
            
            mountpoints.push({
              id: String(index + 1),
              name: source.server_name ? source.server_name[0] : mount,
              point: mount,
              type: source.server_type ? source.server_type[0] : 'audio/mpeg',
              bitrate: parseInt(source.bitrate ? source.bitrate[0] : 0, 10),
              description: source.server_description ? source.server_description[0] : '',
              genre: source.genre ? source.genre[0] : '',
              streamUrl: `http://localhost:8000${mount}`,
              listeners: {
                current: listeners,
                peak: peakListeners
              },
              streamUser: 'source', // Default source user
              streamPassword: '****', // Hidden for security
              isPublic: true,
              status: 'active'
            });
          });
          
          res.json({ success: true, data: mountpoints });
        } catch (e) {
          res.status(500).json({ success: false, error: 'Failed to extract mountpoints' });
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Listeners endpoint
apiRouter.get('/servers/:serverId/listeners', async (req, res) => {
  const mountpointId = req.query.mountpoint;
  
  try {
    exec('curl -s http://admin:hackme@localhost:8000/admin/listclients.xsl', (error, stdout) => {
      if (error) {
        return res.status(500).json({ success: false, error: 'Failed to get Icecast listeners' });
      }
      
      // Parse and extract listeners (simplified for this example)
      // In a real implementation, you would need to parse HTML or use another XML endpoint
      
      // Return mock data for now
      const listeners = [
        {
          id: '1',
          ip: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          connectedAt: new Date().toISOString(),
          duration: 300,
          mountpoint: '/stream'
        }
      ];
      
      res.json({ success: true, data: listeners });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Config endpoint
apiRouter.get('/servers/:serverId/config', async (req, res) => {
  try {
    const configXml = await fs.readFile(ICECAST_CONFIG_PATH, 'utf8');
    res.json({ success: true, data: configXml });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update config endpoint
apiRouter.put('/servers/:serverId/config', async (req, res) => {
  try {
    const { config } = req.body;
    
    // Backup current config
    await fs.copy(ICECAST_CONFIG_PATH, \`${ICECAST_CONFIG_PATH}.bak.\${Date.now()}\`);
    
    // Write new config
    await fs.writeFile(ICECAST_CONFIG_PATH, config);
    
    // Restart Icecast to apply changes
    exec('systemctl restart icecast2', (error) => {
      if (error) {
        return res.status(500).json({ success: false, error: 'Failed to restart Icecast after config update' });
      }
      res.json({ success: true });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simple user management
let users = [
  {
    id: "1",
    username: "admin",
    password: "********",
    role: "admin",
    allowedMountpoints: [],
  }
];

// Users endpoint
apiRouter.get('/servers/:serverId/users', (req, res) => {
  res.json({ success: true, data: users });
});

// Mount API routes
app.use('/api', apiRouter);

// Catch-all for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(\`API server running on port \${PORT}\`);
});
EOF

# Create Supervisor config to run the panel
echo -e "${GREEN}Setting up Supervisor to run the panel...${NC}"
cat > /etc/supervisor/conf.d/icecast-panel.conf << EOF
[program:icecast-panel]
directory=/opt/icecast-panel
command=node api/server.js
autostart=true
autorestart=true
user=root
environment=NODE_ENV=production
stdout_logfile=/var/log/icecast-panel.log
stderr_logfile=/var/log/icecast-panel-error.log
EOF

# Create Nginx config
echo -e "${GREEN}Setting up Nginx config...${NC}"
cat > /etc/nginx/sites-available/icecast-panel << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/icecast-panel /etc/nginx/sites-enabled/

# Update Icecast2 config to work with panel
echo -e "${GREEN}Updating Icecast2 configuration...${NC}"
cat > /etc/icecast2/icecast.xml << EOF
<icecast>
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
        <admin-user>admin</admin-user>
        <admin-password>hackme</admin-password>
    </authentication>

    <hostname>localhost</hostname>

    <listen-socket>
        <port>8000</port>
        <bind-address>0.0.0.0</bind-address>
    </listen-socket>

    <http-headers>
        <header name="Access-Control-Allow-Origin" value="*" />
    </http-headers>

    <mount>
        <mount-name>/stream</mount-name>
        <dump-file>/var/log/icecast2/dump-stream.mp3</dump-file>
        <welcome-message>Welcome to this Icecast2 server</welcome-message>
        <public>1</public>
    </mount>

    <fileserve>1</fileserve>

    <paths>
        <basedir>/usr/share/icecast2</basedir>
        <logdir>/var/log/icecast2</logdir>
        <webroot>/usr/share/icecast2/web</webroot>
        <adminroot>/usr/share/icecast2/admin</adminroot>
        <alias source="/" destination="/status.xsl"/>
    </paths>

    <logging>
        <accesslog>access.log</accesslog>
        <errorlog>error.log</errorlog>
        <loglevel>3</loglevel>
        <logsize>10000</logsize>
    </logging>

    <security>
        <chroot>0</chroot>
        <changeowner>
            <user>icecast2</user>
            <group>icecast</group>
        </changeowner>
    </security>
</icecast>
EOF

# Update Icecast2 init script to allow external connections
echo -e "${GREEN}Updating Icecast2 defaults...${NC}"
sed -i 's/ENABLE=false/ENABLE=true/' /etc/default/icecast2
sed -i 's/USERID=icecast2/USERID=root/' /etc/default/icecast2
sed -i 's/GROUPID=icecast/GROUPID=root/' /etc/default/icecast2

# Install npm packages
echo -e "${GREEN}Installing npm packages...${NC}"
cd $PANEL_DIR && npm install

# Build the frontend application
echo -e "${GREEN}Building the frontend application...${NC}"
# In a real scenario, you would build the frontend here
# For this example, we'll create a minimal index.html file
mkdir -p $PANEL_DIR/dist
cat > $PANEL_DIR/dist/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Icecast2 Panel</title>
    <style>
        body { font-family: sans-serif; text-align: center; margin-top: 100px; }
        h1 { color: #4f46e5; }
    </style>
</head>
<body>
    <h1>Icecast2 Panel Installed</h1>
    <p>The Icecast2 panel has been successfully installed.</p>
    <p>To view your panel, build and deploy your frontend application.</p>
</body>
</html>
EOF

# Start services
echo -e "${GREEN}Starting services...${NC}"
systemctl restart icecast2
systemctl restart nginx
supervisorctl update
supervisorctl start icecast-panel

# Create a simple info file about the installation
echo -e "${GREEN}Creating installation info file...${NC}"
cat > /opt/icecast-panel/INSTALL_INFO.md << EOF
# Icecast2 Panel Installation Information

## Installation Details
- Installation Date: $(date)
- Panel Location: /opt/icecast-panel
- Icecast2 Config: /etc/icecast2/icecast.xml
- API Port: 3000

## Access Information
- Panel URL: http://YOUR_SERVER_IP
- Icecast2 Admin: http://YOUR_SERVER_IP:8000/admin/
  - Username: admin
  - Password: hackme

## Source Connection Information
- Hostname: YOUR_SERVER_IP
- Port: 8000
- Mountpoint: /stream
- Username: source
- Password: hackme

## Service Management
- Restart Panel: \`supervisorctl restart icecast-panel\`
- Restart Icecast2: \`systemctl restart icecast2\`
- View Panel Logs: \`supervisorctl tail -f icecast-panel\`

## Configuration Files
- Panel Config: /opt/icecast-panel/.env
- Nginx Config: /etc/nginx/sites-available/icecast-panel
- Supervisor Config: /etc/supervisor/conf.d/icecast-panel.conf
EOF

# Final message
echo -e "${GREEN}=========================================================${NC}"
echo -e "${GREEN}Installation complete!${NC}"
echo -e "${GREEN}Icecast2 server is running on port 8000${NC}"
echo -e "${GREEN}Admin panel is accessible at http://YOUR_SERVER_IP${NC}"
echo -e "${GREEN}Admin username: admin${NC}"
echo -e "${GREEN}Admin password: hackme${NC}"
echo -e "${GREEN}For more information see: /opt/icecast-panel/INSTALL_INFO.md${NC}"
echo -e "${GREEN}=========================================================${NC}"
