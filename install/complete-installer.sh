#!/bin/bash
set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}    Icecast2 Admin Panel - Instalador Completo Ubuntu          ${NC}"
echo -e "${BLUE}================================================================${NC}"

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
echo -e "${GREEN}Log de instalación: ${LOGFILE}${NC}"

# Get public server IP address (reliable method)
SERVER_IP=$(curl -s https://api.ipify.org) 

# Fallback in case curl fails or returns empty/private IP
if [ -z "$SERVER_IP" ] || [[ "$SERVER_IP" =~ ^(10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.|192\.168\.|127\.) ]]; then
    echo -e "${YELLOW}No se pudo obtener la IP pública, intentando con hostname...${NC}"
    SERVER_IP=$(hostname -I | tr ' ' '\n' | grep -vE '^(10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.|192\.168\.|127\.)' | head -n1)
fi

# Final fallback
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="localhost"
fi

echo -e "${GREEN}IP del servidor detectada: ${SERVER_IP}${NC}"

# Application directory
APP_DIR="/opt/icecast-admin"

# Default credentials
ICECAST_PORT=8000
ICECAST_ADMIN_USER="admin"
ICECAST_ADMIN_PASS=""
ICECAST_SOURCE_PASS=""

# Function to detect existing Icecast installation
detect_icecast() {
    echo -e "${BLUE}Detectando instalación existente de Icecast2...${NC}"
    ICECAST_INSTALLED=false
    ICECAST_CONFIG_PATH=""
    # Check if icecast2 command exists
    if command -v icecast2 &> /dev/null; then
        ICECAST_INSTALLED=true
        echo -e "${GREEN}✓ Icecast2 encontrado en el sistema${NC}"
        # Look for config file in common locations
        for config_path in "/etc/icecast2/icecast.xml" "/etc/icecast/icecast.xml" "/usr/local/etc/icecast.xml"; do
            if [ -f "$config_path" ]; then
                ICECAST_CONFIG_PATH="$config_path"
                echo -e "${GREEN}✓ Configuración encontrada: ${config_path}${NC}"
                break
            fi
        done
        # Extract existing configuration if found
        if [ -n "$ICECAST_CONFIG_PATH" ] && [ -f "$ICECAST_CONFIG_PATH" ]; then
            # Extract port
            PORT_MATCH=$(grep -o '<port>[0-9]*</port>' "$ICECAST_CONFIG_PATH" | head -1 | grep -o '[0-9]*')
            if [ -n "$PORT_MATCH" ]; then
                ICECAST_PORT=$PORT_MATCH
            fi
            # Extract admin credentials
            ADMIN_USER_MATCH=$(grep -o '<admin-user>[^<]*</admin-user>' "$ICECAST_CONFIG_PATH" | head -1 | sed 's/<[^>]*>//g')
            if [ -n "$ADMIN_USER_MATCH" ]; then
                ICECAST_ADMIN_USER="$ADMIN_USER_MATCH"
            fi
            ADMIN_PASS_MATCH=$(grep -o '<admin-password>[^<]*</admin-password>' "$ICECAST_CONFIG_PATH" | head -1 | sed 's/<[^>]*>//g')
            if [ -n "$ADMIN_PASS_MATCH" ]; then
                ICECAST_ADMIN_PASS="$ADMIN_PASS_MATCH"
            fi
            SOURCE_PASS_MATCH=$(grep -o '<source-password>[^<]*</source-password>' "$ICECAST_CONFIG_PATH" | head -1 | sed 's/<[^>]*>//g')
            if [ -n "$SOURCE_PASS_MATCH" ]; then
                ICECAST_SOURCE_PASS="$SOURCE_PASS_MATCH"
            fi
            echo -e "${GREEN}✓ Puerto detectado: ${ICECAST_PORT}${NC}"
            echo -e "${GREEN}✓ Usuario admin detectado: ${ICECAST_ADMIN_USER:-"(no configurado)"}${NC}"
        fi
    else
        echo -e "${YELLOW}Icecast2 no encontrado, se instalará automáticamente${NC}"
    fi
}

# Function to configure credentials
configure_credentials() {
    echo -e "${BLUE}Configurando credenciales de administración...${NC}"
    if [ -n "$ICECAST_ADMIN_USER" ] && [ -n "$ICECAST_ADMIN_PASS" ]; then
        echo -e "${GREEN}Usando credenciales existentes:${NC}"
        echo -e "Usuario: ${ICECAST_ADMIN_USER}"
        echo -e "Contraseña: ${ICECAST_ADMIN_PASS}"
        echo -e "${YELLOW}¿Desea mantener estas credenciales? (s/n)${NC}"
        read -r keep_creds
        if [[ ! $keep_creds =~ ^[Ss]$ ]]; then
            configure_new_credentials
        fi
    else
        echo -e "${YELLOW}No se encontraron credenciales existentes${NC}"
        configure_new_credentials
    fi
}

# Function to configure new credentials
configure_new_credentials() {
    echo -e "${BLUE}Configurando nuevas credenciales...${NC}"
    echo -e "${YELLOW}Ingrese el usuario administrador (default: admin):${NC}"
    read -r new_admin_user
    ICECAST_ADMIN_USER=${new_admin_user:-"admin"}
    echo -e "${YELLOW}Ingrese la contraseña de administrador:${NC}"
    read -s new_admin_pass
    echo
    if [ -z "$new_admin_pass" ]; then
        echo -e "${YELLOW}Generando contraseña automática...${NC}"
        ICECAST_ADMIN_PASS=$(openssl rand -base64 12)
        echo -e "${GREEN}Contraseña generada: ${ICECAST_ADMIN_PASS}${NC}"
    else
        ICECAST_ADMIN_PASS="$new_admin_pass"
    fi
    # Source password
    if [ -z "$ICECAST_SOURCE_PASS" ]; then
        echo -e "${YELLOW}Ingrese la contraseña de source (default: hackme):${NC}"
        read -s new_source_pass
        echo
        ICECAST_SOURCE_PASS=${new_source_pass:-"hackme"}
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}Instalando dependencias del sistema...${NC}"
    apt-get update
    apt-get install -y curl wget gnupg2 ca-certificates lsb-release apt-transport-https nginx supervisor git
    # Install Node.js
    echo -e "${GREEN}Instalando Node.js...${NC}"
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x  | bash -
        apt-get install -y nodejs
    else
        echo -e "${GREEN}✓ Node.js ya está instalado${NC}"
    fi
    # Install Icecast2 if not present
    if [ "$ICECAST_INSTALLED" = false ]; then
        echo -e "${GREEN}Instalando Icecast2...${NC}"
        apt-get install -y icecast2
        ICECAST_CONFIG_PATH="/etc/icecast2/icecast.xml"
    fi
}

# Function to setup application
setup_application() {
    echo -e "${BLUE}Configurando aplicación del panel...${NC}"
    # Create application directory
    mkdir -p $APP_DIR
    # Setup environment file
    cat > $APP_DIR/.env << EOF
# API Configuration
VITE_API_BASE_URL=http://${SERVER_IP}:3000/api
ICECAST_CONFIG_PATH=${ICECAST_CONFIG_PATH}
ICECAST_ADMIN_USERNAME=${ICECAST_ADMIN_USER}
ICECAST_ADMIN_PASSWORD=${ICECAST_ADMIN_PASS}
ICECAST_PORT=${ICECAST_PORT}
PORT=3000
EOF
    # Create package.json
    cat > $APP_DIR/package.json << EOF
{
  "name": "icecast-admin",
  "version": "1.0.0",
  "description": "Panel de administración para Icecast2",
  "main": "api/server.js",
  "scripts": {
    "start": "node api/server.js",
    "build": "echo 'Build completed'"
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
    # Create API directory and server
    mkdir -p $APP_DIR/api
    cat > $APP_DIR/api/server.js << 'EOF'
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
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));
// Auth middleware
const auth = (req, res, next) => {
  const user = basicAuth(req);
  if (!user || user.name !== process.env.ICECAST_ADMIN_USERNAME || user.pass !== process.env.ICECAST_ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Icecast Panel API"');
    return res.status(401).send('Authentication required');
  }
  return next();
};
const apiRouter = express.Router();
// Public endpoints
apiRouter.get('/server-health', (req, res) => {
  exec('command -v icecast2', (error) => {
    if (error) {
      return res.status(404).json({
        available: false,
        message: 'Icecast2 no está instalado'
      });
    }
    exec('systemctl is-active icecast2', (error, stdout) => {
      const status = stdout.trim() === 'active' ? 'running' : 'stopped';
      res.json({
        available: true,
        status,
        configPath: ICECAST_CONFIG_PATH
      });
    });
  });
});
apiRouter.get('/server-status', (req, res) => {
  exec('command -v icecast2', (error) => {
    if (error) {
      return res.json({ installed: false });
    }
    exec('icecast2 -v 2>&1', (error, stdout, stderr) => {
      let version = 'unknown';
      const output = stdout + stderr;
      const match = output.match(/Icecast (\d+\.\d+\.\d+)/i);
      if (match) version = match[1];
      let port = 8000;
      if (fs.existsSync(ICECAST_CONFIG_PATH)) {
        try {
          const config = fs.readFileSync(ICECAST_CONFIG_PATH, 'utf8');
          const portMatch = config.match(/<port>(\d+)<\/port>/i);
          if (portMatch) port = parseInt(portMatch[1], 10);
        } catch (err) {
          console.error("Error leyendo config:", err);
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
// Protected endpoints
apiRouter.use(auth);
// Server control endpoints
apiRouter.get('/servers/:serverId/status', (req, res) => {
  exec('systemctl is-active icecast2', (error, stdout) => {
    const status = stdout.trim() === 'active' ? 'running' : 'stopped';
    res.json({ success: true, data: { status } });
  });
});
apiRouter.post('/servers/:serverId/start', (req, res) => {
  exec('systemctl start icecast2', (error) => {
    if (error) {
      return res.status(500).json({ success: false, error: 'Error al iniciar Icecast' });
    }
    res.json({ success: true, data: { status: 'running' } });
  });
});
apiRouter.post('/servers/:serverId/stop', (req, res) => {
  exec('systemctl stop icecast2', (error) => {
    if (error) {
      return res.status(500).json({ success: false, error: 'Error al detener Icecast' });
    }
    res.json({ success: true, data: { status: 'stopped' } });
  });
});
apiRouter.post('/servers/:serverId/restart', (req, res) => {
  exec('systemctl restart icecast2', (error) => {
    if (error) {
      return res.status(500).json({ success: false, error: 'Error al reiniciar Icecast' });
    }
    res.json({ success: true, data: { status: 'running' } });
  });
});
// Stats endpoint
apiRouter.get('/servers/:serverId/stats', (req, res) => {
  const adminUser = process.env.ICECAST_ADMIN_USERNAME;
  const adminPass = process.env.ICECAST_ADMIN_PASSWORD;
  const port = process.env.ICECAST_PORT || 8000;
  exec(`curl -s http://${adminUser}:${adminPass}@localhost:${port}/admin/stats.xml`, (error, stdout) => {
    if (error) {
      return res.status(500).json({ success: false, error: 'Error obteniendo estadísticas' });
    }
    xml2js.parseString(stdout, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Error procesando XML' });
      }
      try {
        const icestats = result.icestats || {};
        const stats = {
          uptime: parseInt(icestats.uptime?.[0] || 0, 10),
          connections: {
            current: parseInt(icestats.connections?.[0] || 0, 10),
            peak: parseInt(icestats.connections_peak?.[0] || 0, 10),
          },
          bandwidth: {
            incoming: parseFloat(icestats.inbound_kbitrate?.[0] || 0),
            outgoing: parseFloat(icestats.outbound_kbitrate?.[0] || 0),
          },
          cpu: 0,
          memory: 0,
          totalConnections: parseInt(icestats.connections_total?.[0] || 0, 10),
          version: icestats.server_id?.[0] || 'Unknown',
        };
        res.json({ success: true, data: stats });
      } catch (e) {
        res.status(500).json({ success: false, error: 'Error extrayendo estadísticas' });
      }
    });
  });
});
// Mountpoints endpoint
apiRouter.get('/servers/:serverId/mountpoints', (req, res) => {
  const adminUser = process.env.ICECAST_ADMIN_USERNAME;
  const adminPass = process.env.ICECAST_ADMIN_PASSWORD;
  const port = process.env.ICECAST_PORT || 8000;
  exec(`curl -s http://${adminUser}:${adminPass}@localhost:${port}/admin/stats.xml`, (error, stdout) => {
    if (error) {
      return res.status(500).json({ success: false, error: 'Error obteniendo mountpoints' });
    }
    xml2js.parseString(stdout, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Error procesando XML' });
      }
      try {
        const icestats = result.icestats || {};
        const mountpoints = [];
        const sources = icestats.source || [];
        sources.forEach((source, index) => {
          const mount = source.$.mount;
          const listeners = parseInt(source.listeners?.[0] || 0, 10);
          const peakListeners = parseInt(source.listener_peak?.[0] || 0, 10);
          mountpoints.push({
            id: String(index + 1),
            name: source.server_name?.[0] || mount,
            point: mount,
            type: source.server_type?.[0] || 'audio/mpeg',
            bitrate: parseInt(source.bitrate?.[0] || 0, 10),
            description: source.server_description?.[0] || '',
            genre: source.genre?.[0] || '',
            streamUrl: `http://${req.get('host').split(':')[0]}:${port}${mount}`,
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
        res.status(500).json({ success: false, error: 'Error extrayendo mountpoints' });
      }
    });
  });
});
// Listeners endpoint
apiRouter.get('/servers/:serverId/listeners', (req, res) => {
  // Simplified listeners response
  const listeners = [];
  res.json({ success: true, data: listeners });
});
// Config endpoints
apiRouter.get('/servers/:serverId/config', async (req, res) => {
  try {
    const configXml = await fs.readFile(ICECAST_CONFIG_PATH, 'utf8');
    res.json({ success: true, data: configXml });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
apiRouter.put('/servers/:serverId/config', async (req, res) => {
  try {
    const { config } = req.body;
    await fs.copy(ICECAST_CONFIG_PATH, `${ICECAST_CONFIG_PATH}.bak.${Date.now()}`);
    await fs.writeFile(ICECAST_CONFIG_PATH, config);
    exec('systemctl restart icecast2', (error) => {
      if (error) {
        return res.status(500).json({ success: false, error: 'Error reiniciando tras actualizar config' });
      }
      res.json({ success: true });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// Users endpoint (mock)
apiRouter.get('/servers/:serverId/users', (req, res) => {
  const users = [{
    id: "1",
    username: process.env.ICECAST_ADMIN_USERNAME,
    password: "********",
    role: "admin",
    allowedMountpoints: [],
  }];
  res.json({ success: true, data: users });
});
app.use('/api', apiRouter);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
app.listen(PORT, () => {
  console.log(`API server corriendo en puerto ${PORT}`);
});
EOF
    # Create simple frontend
    mkdir -p $APP_DIR/dist
    cat > $APP_DIR/dist/index.html << EOF
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Icecast Admin Panel</title>
    <style>
        body { font-family: sans-serif; text-align: center; margin-top: 100px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #4f46e5; margin-bottom: 20px; }
        .info { background: #e0f2fe; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .credentials { background: #f3e5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .btn { background: #4f46e5; color: white; padding: 10px 20px; border: none; border-radius: 5px; text-decoration: none; display: inline-block; margin: 5px; }
        .btn:hover { background: #3730a3; }
        .success { color: #059669; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 Icecast Admin Panel</h1>
        <p class="success">✅ Panel instalado correctamente</p>
        <div class="info">
            <h3>🔗 Enlaces de Acceso</h3>
            <p><a href="http://${SERVER_IP}:${ICECAST_PORT}/admin/" class="btn" target="_blank">Admin Icecast2</a></p>
            <p><a href="http://${SERVER_IP}:${ICECAST_PORT}/" class="btn" target="_blank">Estado del Servidor</a></p>
        </div>
        <div class="credentials">
            <h3>🔐 Credenciales</h3>
            <p><strong>Usuario:</strong> ${ICECAST_ADMIN_USER}</p>
            <p><strong>Contraseña:</strong> ${ICECAST_ADMIN_PASS}</p>
            <p><strong>Puerto Icecast:</strong> ${ICECAST_PORT}</p>
        </div>
        <div class="info">
            <h3>📡 Configuración de Transmisión</h3>
            <p><strong>Servidor:</strong> ${SERVER_IP}</p>
            <p><strong>Puerto:</strong> ${ICECAST_PORT}</p>
            <p><strong>Usuario Source:</strong> source</p>
            <p><strong>Contraseña Source:</strong> ${ICECAST_SOURCE_PASS}</p>
            <p><strong>Mountpoint:</strong> /stream</p>
        </div>
        <p><small>Para conectar tu aplicación frontend, usa la API en http://${SERVER_IP}:3000/api</small></p>
    </div>
</body>
</html>
EOF
    # Install npm packages
    cd $APP_DIR && npm install
}

# Function to configure Icecast
configure_icecast() {
    echo -e "${BLUE}Configurando Icecast2...${NC}"
    # Backup existing config
    if [ -f "$ICECAST_CONFIG_PATH" ]; then
        cp "$ICECAST_CONFIG_PATH" "${ICECAST_CONFIG_PATH}.bak.$(date +%Y%m%d%H%M%S)"
    fi
    # Use the template configuration
    cat > "$ICECAST_CONFIG_PATH" << EOF
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
        <source-password>${ICECAST_SOURCE_PASS}</source-password>
        <relay-password>${ICECAST_SOURCE_PASS}</relay-password>
        <admin-user>${ICECAST_ADMIN_USER}</admin-user>
        <admin-password>${ICECAST_ADMIN_PASS}</admin-password>
    </authentication>
    <hostname>${SERVER_IP}</hostname>
    <listen-socket>
        <port>${ICECAST_PORT}</port>
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
    # Enable Icecast2
    if [ -f /etc/default/icecast2 ]; then
        sed -i 's/ENABLE=false/ENABLE=true/' /etc/default/icecast2
    fi
}

# Function to setup services
setup_services() {
    echo -e "${BLUE}Configurando servicios...${NC}"
    # Supervisor config
    cat > /etc/supervisor/conf.d/icecast-admin.conf << EOF
[program:icecast-admin]
directory=${APP_DIR}
command=node api/server.js
autostart=true
autorestart=true
user=root
environment=NODE_ENV=production
stdout_logfile=/var/log/icecast-admin.log
stderr_logfile=/var/log/icecast-admin-error.log
EOF
    # Nginx config
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
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    ln -sf /etc/nginx/sites-available/icecast-admin /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
}

# Function to configure firewall
configure_firewall() {
    echo -e "${BLUE}Configurando firewall...${NC}"
    # Check if iptables has rules
    if iptables -L | grep -q "Chain INPUT.*DROP"; then
        echo -e "${YELLOW}Detectadas reglas de iptables, configurando puertos...${NC}"
        # Allow necessary ports
        iptables -I INPUT -p tcp --dport 80 -j ACCEPT
        iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
        iptables -I INPUT -p tcp --dport ${ICECAST_PORT} -j ACCEPT
        iptables -I INPUT -p tcp --dport 22 -j ACCEPT
        # Save rules if iptables-persistent is available
        if command -v iptables-save &> /dev/null; then
            iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
        fi
    else
        echo -e "${GREEN}✓ Firewall no restrictivo detectado${NC}"
    fi
}

# Function to start services
start_services() {
    echo -e "${BLUE}Iniciando servicios...${NC}"
    systemctl restart icecast2
    systemctl enable icecast2
    systemctl restart nginx
    systemctl enable nginx
    supervisorctl update
    supervisorctl start icecast-admin
}

# Function to create info file
create_info_file() {
    cat > $APP_DIR/INSTALL_INFO.md << EOF
# Información de Instalación - Icecast Admin Panel
## Instalación completada: $(date)
### Acceso al Panel
- **URL Principal**: http://${SERVER_IP}
- **API**: http://${SERVER_IP}:3000/api
### Icecast2 Server
- **Admin Panel**: http://${SERVER_IP}:${ICECAST_PORT}/admin/
- **Status**: http://${SERVER_IP}:${ICECAST_PORT}/
- **Puerto**: ${ICECAST_PORT}
### Credenciales
- **Usuario Admin**: ${ICECAST_ADMIN_USER}
- **Contraseña Admin**: ${ICECAST_ADMIN_PASS}
- **Contraseña Source**: ${ICECAST_SOURCE_PASS}
### Configuración de Transmisión
- **Servidor**: ${SERVER_IP}
- **Puerto**: ${ICECAST_PORT}
- **Usuario**: source
- **Contraseña**: ${ICECAST_SOURCE_PASS}
- **Mountpoint**: /stream
### Gestión de Servicios
\`\`\`bash
# Panel Admin
supervisorctl restart icecast-admin
supervisorctl status icecast-admin
tail -f /var/log/icecast-admin.log
# Icecast2
systemctl restart icecast2
systemctl status icecast2
# Nginx
systemctl restart nginx
\`\`\`
### Archivos de Configuración
- Panel: ${APP_DIR}/.env
- Icecast: ${ICECAST_CONFIG_PATH}
- Nginx: /etc/nginx/sites-available/icecast-admin
- Supervisor: /etc/supervisor/conf.d/icecast-admin.conf
### Para conectar tu aplicación frontend
1. Copia los archivos del proyecto a ${APP_DIR}
2. Ejecuta \`npm install\` y \`npm run build\`
3. Los archivos se servirán automáticamente
### Backup de Configuración
Antes de cualquier cambio importante:
\`\`\`bash
cp ${ICECAST_CONFIG_PATH} ${ICECAST_CONFIG_PATH}.bak.\$(date +%Y%m%d)
cp ${APP_DIR}/.env ${APP_DIR}/.env.bak.\$(date +%Y%m%d)
\`\`\`
EOF
}

# Main installation flow
main() {
    echo -e "${GREEN}Iniciando instalación completa...${NC}"
    detect_icecast
    configure_credentials
    install_dependencies
    setup_application
    configure_icecast
    setup_services
    configure_firewall
    start_services
    create_info_file
    echo -e "${GREEN}================================================================${NC}"
    echo -e "${GREEN}🎉 ¡INSTALACIÓN COMPLETADA! 🎉${NC}"
    echo -e "${GREEN}================================================================${NC}"
    echo -e "${GREEN}Panel accesible en: http://${SERVER_IP}${NC}"
    echo -e "${GREEN}Icecast Admin: http://${SERVER_IP}:${ICECAST_PORT}/admin/${NC}"
    echo -e "${GREEN}Usuario: ${ICECAST_ADMIN_USER}${NC}"
    echo -e "${GREEN}Contraseña: ${ICECAST_ADMIN_PASS}${NC}"
    echo -e "${GREEN}================================================================${NC}"
    echo -e "${YELLOW}📋 Info completa guardada en: ${APP_DIR}/INSTALL_INFO.md${NC}"
    echo -e "${YELLOW}📋 Logs en: ${LOGFILE}${NC}"
    echo -e "${GREEN}================================================================${NC}"
}

# Run main function
main
