
#!/bin/bash
set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}    Icecast2 Admin Panel - Instalador para Ubuntu VPS    ${NC}"
echo -e "${BLUE}=========================================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Por favor ejecutar como root o con sudo.${NC}"
  exit 1
fi

# Create log file
LOGFILE="/var/log/icecast-admin-install.log"
touch $LOGFILE
echo "Instalación iniciada: $(date)" > $LOGFILE
exec > >(tee -a $LOGFILE)
exec 2>&1

echo -e "${GREEN}Log de instalación guardado en: ${LOGFILE}${NC}"
echo -e "${GREEN}Iniciando instalación...${NC}"

# Get server IP address
SERVER_IP=$(hostname -I | awk '{print $1}')

# Update system
echo -e "${GREEN}Actualizando paquetes del sistema...${NC}"
apt-get update
apt-get upgrade -y

# Install required packages
echo -e "${GREEN}Instalando paquetes requeridos...${NC}"
apt-get install -y curl wget gnupg2 ca-certificates lsb-release apt-transport-https nginx supervisor git

# Install Node.js
echo -e "${GREEN}Instalando Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Icecast2
echo -e "${GREEN}Instalando Icecast2...${NC}"
apt-get install -y icecast2

# Backup original Icecast2 config
echo -e "${GREEN}Haciendo backup de la configuración original de Icecast2...${NC}"
if [ -f /etc/icecast2/icecast.xml ]; then
  cp /etc/icecast2/icecast.xml /etc/icecast2/icecast.xml.bak.$(date +%Y%m%d%H%M%S)
fi

# Create application directory
APP_DIR="/opt/icecast-admin"
echo -e "${GREEN}Creando directorio de la aplicación en ${APP_DIR}...${NC}"
mkdir -p $APP_DIR

# Clone the repository
echo -e "${GREEN}¿Desea clonar desde un repositorio Git? (s/n)${NC}"
read -r clone_repo

if [[ $clone_repo =~ ^[Ss]$ ]]; then
  echo -e "${GREEN}Ingrese la URL del repositorio Git:${NC}"
  read -r repo_url
  
  if [ -z "$repo_url" ]; then
    echo -e "${RED}URL del repositorio no proporcionada. Continuando sin clonar...${NC}"
  else
    echo -e "${GREEN}Clonando repositorio ${repo_url}...${NC}"
    git clone "$repo_url" $APP_DIR
    cd $APP_DIR
  fi
else
  echo -e "${YELLOW}Continuando sin clonar un repositorio...${NC}"
  # En este caso, se asume que se copiará manualmente el código en el directorio
fi

# Configure environment
echo -e "${GREEN}Configurando variables de entorno...${NC}"
cat > $APP_DIR/.env << EOF
# API Configuration
VITE_API_BASE_URL=http://${SERVER_IP}:3000/api
ICECAST_CONFIG_PATH=/etc/icecast2/icecast.xml
ICECAST_ADMIN_USERNAME=admin
ICECAST_ADMIN_PASSWORD=hackme
PORT=3000
EOF

# Setup API Server
echo -e "${GREEN}Configurando API server...${NC}"
mkdir -p $APP_DIR/api

# Create API server script if not exists
if [ ! -f $APP_DIR/api/server.js ]; then
  echo -e "${GREEN}Creando script de servidor API...${NC}"
  cat > $APP_DIR/api/server.js << EOF
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

// Server health check endpoint
apiRouter.get('/server-health', (req, res) => {
  exec('command -v icecast2', (error, stdout, stderr) => {
    if (error) {
      return res.status(404).json({
        available: false,
        message: 'Icecast2 no está instalado en este sistema'
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

// Server status endpoint
apiRouter.get('/server-status', (req, res) => {
  exec('command -v icecast2', (error, stdout, stderr) => {
    if (error) {
      return res.status(200).json({
        installed: false
      });
    }
    
    // Get version
    exec('icecast2 -v 2>&1', (error, stdout, stderr) => {
      let version = 'unknown';
      const combinedOutput = stdout + stderr;
      
      const match = combinedOutput.match(/Icecast (\d+\.\d+\.\d+)/i);
      if (match) {
        version = match[1];
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

// Install Icecast server
apiRouter.post('/install-server', async (req, res) => {
  const { serverPort = 8000, adminUser = 'admin', adminPassword } = req.body;
  
  if (!adminPassword) {
    return res.status(400).json({
      success: false,
      message: 'El password de administrador es requerido'
    });
  }
  
  // Update icecast.xml with new configuration
  const configTemplate = \`<icecast>
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
        <admin-user>\${adminUser}</admin-user>
        <admin-password>\${adminPassword}</admin-password>
    </authentication>

    <hostname>localhost</hostname>

    <listen-socket>
        <port>\${serverPort}</port>
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
</icecast>\`;

  try {
    // Backup current config if it exists
    if (fs.existsSync(ICECAST_CONFIG_PATH)) {
      await fs.copy(ICECAST_CONFIG_PATH, \`\${ICECAST_CONFIG_PATH}.bak.\${Date.now()}\`);
    }
    
    // Write new config
    await fs.writeFile(ICECAST_CONFIG_PATH, configTemplate);
    
    // Update default settings
    await fs.writeFile('/etc/default/icecast2', 'ENABLE=true\n', 'utf8');
    
    // Restart service
    exec('systemctl restart icecast2', (error) => {
      if (error) {
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to restart Icecast after config update' 
        });
      }
      
      res.json({
        success: true,
        message: 'Icecast server installed successfully',
        port: serverPort
      });
    });
  } catch (error) {
    console.error('Installation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error during installation'
    });
  }
});

// Server stats endpoint
apiRouter.get('/servers/:serverId/stats', async (req, res) => {
  try {
    // Use icecast2 stats.xsl to get server stats
    const adminUser = process.env.ICECAST_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ICECAST_ADMIN_PASSWORD || 'hackme';
    
    exec(\`curl -s http://\${adminUser}:\${adminPassword}@localhost:8000/admin/stats.xml\`, (error, stdout, stderr) => {
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
            uptime: parseInt(icestats.uptime ? icestats.uptime[0] : 0, 10),
            connections: {
              current: parseInt(icestats.connections ? icestats.connections[0] : 0, 10),
              peak: parseInt(icestats.connections_peak ? icestats.connections_peak[0] : 0, 10),
            },
            bandwidth: {
              incoming: parseFloat(icestats.inbound_kbitrate ? icestats.inbound_kbitrate[0] : 0),
              outgoing: parseFloat(icestats.outbound_kbitrate ? icestats.outbound_kbitrate[0] : 0),
            },
            cpu: 0, // Not provided by Icecast stats
            memory: 0, // Not provided by Icecast stats
            totalConnections: parseInt(icestats.connections_total ? icestats.connections_total[0] : 0, 10),
            version: icestats.server_id ? icestats.server_id[0] : 'Unknown',
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
    await fs.copy(ICECAST_CONFIG_PATH, \`\${ICECAST_CONFIG_PATH}.bak.\${Date.now()}\`);
    
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

// Mountpoints endpoint
apiRouter.get('/servers/:serverId/mountpoints', async (req, res) => {
  try {
    const adminUser = process.env.ICECAST_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ICECAST_ADMIN_PASSWORD || 'hackme';
    
    exec(\`curl -s http://\${adminUser}:\${adminPassword}@localhost:8000/admin/stats.xml\`, (error, stdout) => {
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
            const listeners = parseInt(source.listeners ? source.listeners[0] : 0, 10);
            const peakListeners = parseInt(source.listener_peak ? source.listener_peak[0] : 0, 10);
            
            mountpoints.push({
              id: String(index + 1),
              name: source.server_name ? source.server_name[0] : mount,
              point: mount,
              type: source.server_type ? source.server_type[0] : 'audio/mpeg',
              bitrate: parseInt(source.bitrate ? source.bitrate[0] : 0, 10),
              description: source.server_description ? source.server_description[0] : '',
              genre: source.genre ? source.genre[0] : '',
              streamUrl: \`http://localhost:8000\${mount}\`,
              listeners: {
                current: listeners,
                peak: peakListeners
              },
              streamUser: 'source',
              streamPassword: '****',
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
fi

# Create package.json if not exists
if [ ! -f $APP_DIR/package.json ]; then
  echo -e "${GREEN}Creando package.json...${NC}"
  cat > $APP_DIR/package.json << EOF
{
  "name": "icecast-admin",
  "version": "1.0.0",
  "description": "Panel de administración para Icecast2",
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
fi

# Update Icecast2 config to work with panel
echo -e "${GREEN}Actualizando configuración de Icecast2...${NC}"
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
        <welcome-message>Bienvenido a este servidor Icecast2</welcome-message>
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
echo -e "${GREEN}Actualizando configuración por defecto de Icecast2...${NC}"
sed -i 's/ENABLE=false/ENABLE=true/' /etc/default/icecast2
sed -i 's/USERID=icecast2/USERID=root/' /etc/default/icecast2
sed -i 's/GROUPID=icecast/GROUPID=root/' /etc/default/icecast2

# Create Supervisor config to run the panel
echo -e "${GREEN}Configurando Supervisor para el panel...${NC}"
cat > /etc/supervisor/conf.d/icecast-admin.conf << EOF
[program:icecast-admin]
directory=/opt/icecast-admin
command=node api/server.js
autostart=true
autorestart=true
user=root
environment=NODE_ENV=production
stdout_logfile=/var/log/icecast-admin.log
stderr_logfile=/var/log/icecast-admin-error.log
EOF

# Create Nginx config
echo -e "${GREEN}Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/icecast-admin << EOF
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
ln -sf /etc/nginx/sites-available/icecast-admin /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Install npm packages
echo -e "${GREEN}Instalando paquetes npm...${NC}"
cd $APP_DIR && npm install

# Build the frontend if dist directory exists but is empty
if [ -d "$APP_DIR/src" ]; then
  echo -e "${GREEN}¿Desea construir la aplicación frontend? (s/n)${NC}"
  read -r build_frontend
  
  if [[ $build_frontend =~ ^[Ss]$ ]]; then
    echo -e "${GREEN}Instalando paquetes de desarrollo...${NC}"
    cd $APP_DIR && npm install -D vite react react-dom typescript @types/node @types/react @types/react-dom
    
    echo -e "${GREEN}Construyendo la aplicación frontend...${NC}"
    cd $APP_DIR && npm run build
  fi
else
  # Create a simple index.html if no source directory exists
  echo -e "${GREEN}Creando página de inicio temporal...${NC}"
  mkdir -p $APP_DIR/dist
  cat > $APP_DIR/dist/index.html << EOF
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Icecast Admin Panel</title>
    <style>
        body { font-family: sans-serif; text-align: center; margin-top: 100px; }
        h1 { color: #4f46e5; }
    </style>
</head>
<body>
    <h1>Icecast Admin Panel Instalado</h1>
    <p>El panel de administración Icecast2 ha sido instalado correctamente.</p>
    <p>Para ver tu panel, construye y despliega tu aplicación frontend.</p>
</body>
</html>
EOF
fi

# Start services
echo -e "${GREEN}Iniciando servicios...${NC}"
systemctl restart icecast2
systemctl restart nginx
supervisorctl update
supervisorctl start icecast-admin

# Create a simple info file about the installation
echo -e "${GREEN}Creando archivo de información de la instalación...${NC}"
cat > $APP_DIR/INSTALL_INFO.md << EOF
# Información de Instalación de Icecast Admin Panel

## Detalles de Instalación
- Fecha de instalación: $(date)
- Ubicación del panel: $APP_DIR
- Configuración de Icecast2: /etc/icecast2/icecast.xml
- Puerto de API: 3000

## Información de Acceso
- URL del Panel: http://${SERVER_IP}
- Admin de Icecast2: http://${SERVER_IP}:8000/admin/
  - Usuario: admin
  - Contraseña: hackme

## Información de Conexión para Transmisión
- Servidor: ${SERVER_IP}
- Puerto: 8000
- Punto de montaje: /stream
- Usuario: source
- Contraseña: hackme

## Gestión de Servicios
- Reiniciar Panel: \`supervisorctl restart icecast-admin\`
- Reiniciar Icecast2: \`systemctl restart icecast2\`
- Ver logs del Panel: \`supervisorctl tail -f icecast-admin\`

## Archivos de Configuración
- Configuración del Panel: $APP_DIR/.env
- Configuración de Nginx: /etc/nginx/sites-available/icecast-admin
- Configuración de Supervisor: /etc/supervisor/conf.d/icecast-admin.conf
EOF

# Create GitHub sync instructions
echo -e "${GREEN}Creando instrucciones para sincronización con GitHub...${NC}"
cat > $APP_DIR/GITHUB_SYNC.md << EOF
# Instrucciones para Sincronizar con GitHub

## Configuración Inicial del Repositorio (Si aún no está conectado)

1. Primero, asegúrate de tener Git instalado:
   \`\`\`
   sudo apt install git
   \`\`\`

2. Configura tu identidad de Git:
   \`\`\`
   git config --global user.name "Tu Nombre"
   git config --global user.email "tu@email.com"
   \`\`\`

3. Navega al directorio del proyecto:
   \`\`\`
   cd $APP_DIR
   \`\`\`

4. Inicializa Git si el directorio no es un repositorio:
   \`\`\`
   git init
   \`\`\`

5. Agrega tu repositorio remoto:
   \`\`\`
   git remote add origin https://github.com/tu-usuario/tu-repositorio.git
   \`\`\`

## Sincronización con GitHub

1. Agrega todos los cambios:
   \`\`\`
   git add .
   \`\`\`

2. Haz un commit con los cambios:
   \`\`\`
   git commit -m "Mensaje descriptivo del commit"
   \`\`\`

3. Sube los cambios a GitHub:
   \`\`\`
   git push -u origin master  # o 'main' según la rama por defecto
   \`\`\`

## Autenticación

Si es la primera vez que te conectas a GitHub desde el servidor, puedes utilizar:

1. Autenticación por token personal (recomendado):
   - Genera un token personal en GitHub (Settings > Developer settings > Personal access tokens)
   - Usa ese token como contraseña cuando Git lo solicite

2. Configurar SSH (para acceso sin contraseña):
   \`\`\`
   ssh-keygen -t ed25519 -C "tu@email.com"
   cat ~/.ssh/id_ed25519.pub
   \`\`\`
   - Copia la clave SSH generada
   - Agrégala a tu cuenta de GitHub (Settings > SSH and GPG keys)

## Automatizar la Sincronización

Para automatizar la sincronización, puedes crear un script y programarlo con cron:

1. Crea un script de sincronización:
   \`\`\`
   cat > $APP_DIR/sync-github.sh << EOL
#!/bin/bash
cd $APP_DIR
git add .
git commit -m "Actualización automática \$(date)"
git push origin master
EOL
   chmod +x $APP_DIR/sync-github.sh
   \`\`\`

2. Programa con cron para sincronización diaria:
   \`\`\`
   crontab -e
   \`\`\`
   
   Agrega esta línea:
   \`\`\`
   0 2 * * * $APP_DIR/sync-github.sh > /var/log/github-sync.log 2>&1
   \`\`\`
EOF

# Final message
echo -e "${GREEN}=========================================================${NC}"
echo -e "${GREEN}¡Instalación completada!${NC}"
echo -e "${GREEN}El servidor Icecast2 está ejecutándose en el puerto 8000${NC}"
echo -e "${GREEN}El panel de administración está accesible en http://${SERVER_IP}${NC}"
echo -e "${GREEN}Usuario admin: admin${NC}"
echo -e "${GREEN}Contraseña admin: hackme${NC}"
echo -e "${GREEN}Para más información consulta: ${APP_DIR}/INSTALL_INFO.md${NC}"
echo -e "${GREEN}Para instrucciones de sincronización con GitHub consulta: ${APP_DIR}/GITHUB_SYNC.md${NC}"
echo -e "${GREEN}=========================================================${NC}"

# Remind to change default passwords
echo -e "${YELLOW}¡IMPORTANTE! Recuerda cambiar las contraseñas por defecto:${NC}"
echo -e "${YELLOW}1. Edita /etc/icecast2/icecast.xml para cambiar la contraseña de Icecast2${NC}"
echo -e "${YELLOW}2. Edita $APP_DIR/.env para actualizar las credenciales del panel${NC}"
echo -e "${YELLOW}3. Ejecuta 'systemctl restart icecast2' y 'supervisorctl restart icecast-admin' después${NC}"
