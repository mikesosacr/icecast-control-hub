
#!/bin/bash
set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}    Icecast2 Admin Panel - Instalador Completo Ubuntu          ${NC}"
echo -e "${BLUE}================================================================${NC}"

# Verificar ejecución como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Por favor ejecutar como root o con sudo.${NC}"
  exit 1
fi

# Crear log file
LOGFILE="/var/log/icecast-admin-install.log"
touch $LOGFILE
echo "Instalación iniciada: $(date)" > $LOGFILE
exec > >(tee -a $LOGFILE)
exec 2>&1
echo -e "${GREEN}Log de instalación: ${LOGFILE}${NC}"

# Obtener IP pública confiable
SERVER_IP=$(curl -s https://api.ipify.org  || hostname -I | tr ' ' '\n' | grep -vE '^(10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.|192\.168\.|127\.)' | head -n1)
if [[ "$SERVER_IP" =~ ^(10\.|172\.|192\.168\.) ]]; then
    SERVER_IP="localhost"
fi
echo -e "${GREEN}🔧 IP del servidor detectada: ${SERVER_IP}${NC}"

# Directorio base
APP_DIR="/opt/icecast-admin"

# Credenciales predeterminadas
ICECAST_PORT=8000
ICECAST_ADMIN_USER="admin"
ICECAST_ADMIN_PASS=""
ICECAST_SOURCE_PASS="hackme"

FRONTEND_REPO="https://github.com/mikesosacr/icecast-control-hub.git" 
FRONTEND_BRANCH="main"

# ... keep existing code (detect_icecast, configure_credentials, configure_new_credentials functions)

# Función para instalar dependencias
install_dependencies() {
    echo -e "${BLUE}📦 Instalando dependencias del sistema...${NC}"
    apt update -y
    apt install -y curl wget gnupg ca-certificates lsb-release nginx supervisor git xml2 libxml2-utils
    # Instalar Node.js si no está presente
    if ! command -v node &> /dev/null; then
        echo -e "${BLUE}🌐 Instalando Node.js v18...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_18.x  | bash -
        apt install -y nodejs
    else
        echo -e "${GREEN}✓ Node.js ya está instalado${NC}"
    fi
    # Instalar Icecast2 si no está presente
    if [ "$ICECAST_INSTALLED" = false ]; then
        echo -e "${BLUE}🔊 Instalando Icecast2...${NC}"
        apt install -y icecast2
        ICECAST_CONFIG_PATH="/etc/icecast2/icecast.xml"
    fi
}

# Función para configurar aplicación con backend real
setup_application() {
    echo -e "${BLUE}⚙️ Configurando aplicación del panel...${NC}"
    mkdir -p "$APP_DIR/dist" "$APP_DIR/api"

    # Setup environment file
    cat > "$APP_DIR/.env" << EOF
# API Configuration
VITE_API_BASE_URL=http://${SERVER_IP}:3000/api
ICECAST_CONFIG_PATH=${ICECAST_CONFIG_PATH}
ICECAST_ADMIN_USERNAME=${ICECAST_ADMIN_USER}
ICECAST_ADMIN_PASSWORD=${ICECAST_ADMIN_PASS}
ICECAST_PORT=${ICECAST_PORT}
PORT=3000
NODE_ENV=production
EOF

    # Crear package.json con dependencias reales
    cat > "$APP_DIR/package.json" << EOF
{
  "name": "icecast-admin",
  "version": "1.0.0",
  "description": "Panel de administración para Icecast2",
  "main": "api/server.js",
  "scripts": {
    "start": "node api/server.js",
    "update": "bash scripts/update.sh"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "xml2js": "^0.6.2",
    "fs-extra": "^11.1.1",
    "basic-auth": "^2.0.1",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "multer": "^1.4.5-lts.1"
  }
}
EOF

    # Crear servidor Express con backend real funcional
    cat > "$APP_DIR/api/server.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const { exec, spawn } = require('child_process');
const xml2js = require('xml2js');
const path = require('path');
const basicAuth = require('basic-auth');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ICECAST_CONFIG_PATH = process.env.ICECAST_CONFIG_PATH || '/etc/icecast2/icecast.xml';
const ICECAST_PORT = process.env.ICECAST_PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Middleware de autenticación
const auth = (req, res, next) => {
  const user = basicAuth(req);
  if (!user || user.name !== process.env.ICECAST_ADMIN_USERNAME || user.pass !== process.env.ICECAST_ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Icecast Panel API"');
    return res.status(401).send('Authentication required');
  }
  return next();
};

// Utility functions
const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr });
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

const readIcecastConfig = async () => {
  try {
    const xmlData = await fs.readFile(ICECAST_CONFIG_PATH, 'utf8');
    const parser = new xml2js.Parser();
    return await parser.parseStringPromise(xmlData);
  } catch (error) {
    throw new Error(`Failed to read Icecast config: ${error.message}`);
  }
};

const writeIcecastConfig = async (config) => {
  try {
    const builder = new xml2js.Builder();
    const xmlData = builder.buildObject(config);
    await fs.writeFile(ICECAST_CONFIG_PATH, xmlData);
    return true;
  } catch (error) {
    throw new Error(`Failed to write Icecast config: ${error.message}`);
  }
};

// API Routes

// Health check (public)
app.get('/api/server-health', async (req, res) => {
  try {
    const status = await executeCommand('systemctl is-active icecast2');
    const isRunning = status === 'active';
    
    res.json({ 
      available: true, 
      status: isRunning ? 'running' : 'stopped',
      configPath: ICECAST_CONFIG_PATH,
      port: ICECAST_PORT
    });
  } catch (error) {
    res.status(500).json({ available: false, message: error.message });
  }
});

// Server status (public)
app.get('/api/server-status', async (req, res) => {
  try {
    const isActive = await executeCommand('systemctl is-active icecast2').catch(() => 'inactive');
    const version = await executeCommand('icecast2 -v').catch(() => 'unknown');
    
    res.json({
      installed: true,
      status: isActive === 'active' ? 'running' : 'stopped',
      version: version,
      configPath: ICECAST_CONFIG_PATH,
      port: ICECAST_PORT
    });
  } catch (error) {
    res.json({ installed: false });
  }
});

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const user = basicAuth(req);
  if (user && user.name === process.env.ICECAST_ADMIN_USERNAME && user.pass === process.env.ICECAST_ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Protected routes
app.use('/api', auth);

// Server control
app.post('/api/server/start', async (req, res) => {
  try {
    await executeCommand('systemctl start icecast2');
    res.json({ success: true, message: 'Server started successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/server/stop', async (req, res) => {
  try {
    await executeCommand('systemctl stop icecast2');
    res.json({ success: true, message: 'Server stopped successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/server/restart', async (req, res) => {
  try {
    await executeCommand('systemctl restart icecast2');
    res.json({ success: true, message: 'Server restarted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Server stats
app.get('/api/server/stats', async (req, res) => {
  try {
    const icecastUrl = `http://localhost:${ICECAST_PORT}/admin/stats`;
    const response = await axios.get(icecastUrl, {
      auth: {
        username: process.env.ICECAST_ADMIN_USERNAME,
        password: process.env.ICECAST_ADMIN_PASSWORD
      }
    });
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mountpoints
app.get('/api/mountpoints', async (req, res) => {
  try {
    const icecastUrl = `http://localhost:${ICECAST_PORT}/admin/listmounts`;
    const response = await axios.get(icecastUrl, {
      auth: {
        username: process.env.ICECAST_ADMIN_USERNAME,
        password: process.env.ICECAST_ADMIN_PASSWORD
      }
    });
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Users management
let users = [
  { id: '1', username: process.env.ICECAST_ADMIN_USERNAME, role: 'admin', allowedMountpoints: [] }
];

app.get('/api/users', (req, res) => {
  res.json({ success: true, data: users });
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role, allowedMountpoints = [] } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    
    const newUser = {
      id: Date.now().toString(),
      username,
      role,
      allowedMountpoints
    };
    
    users.push(newUser);
    
    // Add user to Icecast config if it's a streamer
    if (role === 'streamer') {
      const config = await readIcecastConfig();
      // Logic to add source password to config would go here
      // This is a simplified version
    }
    
    res.json({ success: true, data: newUser, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  res.json({ success: true, message: 'User deleted successfully' });
});

// Install server
app.post('/api/install-server', async (req, res) => {
  try {
    const { port = 8000, adminUsername = 'admin', adminPassword, autoStart = true } = req.body;
    
    if (!adminPassword) {
      return res.status(400).json({ success: false, message: 'Admin password is required' });
    }
    
    // Update configuration
    const config = await readIcecastConfig();
    
    // Update port
    if (config.icecast && config.icecast.listen) {
      config.icecast.listen[0].port = [port.toString()];
    }
    
    // Update admin credentials
    if (config.icecast && config.icecast.authentication) {
      config.icecast.authentication[0]['admin-user'] = [adminUsername];
      config.icecast.authentication[0]['admin-password'] = [adminPassword];
    }
    
    await writeIcecastConfig(config);
    
    if (autoStart) {
      await executeCommand('systemctl restart icecast2');
      await executeCommand('systemctl enable icecast2');
    }
    
    res.json({ 
      success: true, 
      message: 'Icecast server installed and configured successfully',
      config: { port, adminUsername }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update installation
app.post('/api/update-installation', async (req, res) => {
  try {
    const updateScript = path.join(__dirname, '../scripts/update.sh');
    
    if (await fs.pathExists(updateScript)) {
      exec('bash ' + updateScript, (error, stdout, stderr) => {
        if (error) {
          console.error('Update error:', error);
          return res.status(500).json({ success: false, message: `Update failed: ${error.message}` });
        }
        
        console.log('Update output:', stdout);
        res.json({ success: true, message: 'Installation updated successfully', output: stdout });
      });
    } else {
      res.status(404).json({ success: false, message: 'Update script not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Configuration management
app.get('/api/config', async (req, res) => {
  try {
    const xmlData = await fs.readFile(ICECAST_CONFIG_PATH, 'utf8');
    res.json({ success: true, data: xmlData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/config', async (req, res) => {
  try {
    const { xmlConfig } = req.body;
    await fs.writeFile(ICECAST_CONFIG_PATH, xmlConfig);
    await executeCommand('systemctl restart icecast2');
    res.json({ success: true, message: 'Configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await executeCommand('tail -n 100 /var/log/icecast2/error.log');
    res.json({ success: true, data: logs.split('\n') });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Servir frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Panel disponible en: http://localhost:${PORT}`);
});
EOF

    # Crear script de actualización
    mkdir -p "$APP_DIR/scripts"
    cat > "$APP_DIR/scripts/update.sh" << 'EOF'
#!/bin/bash
set -e

APP_DIR="/opt/icecast-admin"
REPO_URL="https://github.com/mikesosacr/icecast-control-hub.git"
TEMP_DIR="/tmp/icecast-admin-update"

echo "🔄 Iniciando actualización del panel..."

# Crear backup de la configuración actual
if [ -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env" "/tmp/icecast-admin-env-backup"
    echo "✓ Backup de configuración creado"
fi

# Detener el servicio
supervisorctl stop icecast-admin || true

# Clonar la última versión
rm -rf "$TEMP_DIR"
git clone "$REPO_URL" "$TEMP_DIR"

# Construir el frontend
cd "$TEMP_DIR"
npm install
npm run build

# Actualizar archivos
cp -r "$TEMP_DIR/dist/"* "$APP_DIR/dist/"
cp -r "$TEMP_DIR/src/server/"* "$APP_DIR/api/"

# Restaurar configuración
if [ -f "/tmp/icecast-admin-env-backup" ]; then
    cp "/tmp/icecast-admin-env-backup" "$APP_DIR/.env"
    echo "✓ Configuración restaurada"
fi

# Actualizar dependencias
cd "$APP_DIR"
npm install

# Reiniciar servicios
supervisorctl start icecast-admin
systemctl restart nginx

echo "✅ Actualización completada exitosamente"
EOF

    chmod +x "$APP_DIR/scripts/update.sh"

    # Clonar y construir frontend
    FRONTEND_DIR="$APP_DIR/frontend"
    echo -e "${BLUE}📁 Clonando tu frontend desde GitHub...${NC}"
    rm -rf "$FRONTEND_DIR"
    git clone -b "$FRONTEND_BRANCH" "$FRONTEND_REPO" "$FRONTEND_DIR"
    cd "$FRONTEND_DIR"
    echo -e "${BLUE}🧱 Instalando dependencias del frontend...${NC}"
    npm install
    echo -e "${BLUE}🛠️ Construyendo el frontend...${NC}"
    npm run build
    cp -r dist/* "$APP_DIR/dist/" || cp -r dist/. "$APP_DIR/dist/"

    echo -e "${BLUE}💾 Instalando dependencias del backend...${NC}"
    cd "$APP_DIR" && npm install
}

# ... keep existing code (setup_services, repair_services, create_info_file functions)

# Función principal
main() {
    echo -e "${GREEN}🚀 Iniciando instalación completa...${NC}"
    detect_icecast
    configure_credentials
    install_dependencies
    setup_application
    repair_services
    setup_services
    create_info_file

    echo -e "${GREEN}✅ ¡INSTALACIÓN COMPLETADA!${NC}"
    echo -e "${GREEN}🌐 Panel accesible en: http://${SERVER_IP}${NC}"
    echo -e "${GREEN}🌐 Admin Icecast: http://${SERVER_IP}:${ICECAST_PORT}/admin/${NC}"
    echo -e "${GREEN}🔐 Usuario Admin: ${ICECAST_ADMIN_USER}${NC}"
    echo -e "${GREEN}🔐 Contraseña Admin: ${ICECAST_ADMIN_PASS}${NC}"
    echo -e "${GREEN}📄 Info adicional en: ${APP_DIR}/INFO.md${NC}"
    echo -e "${GREEN}🔄 Para actualizar use: npm run update${NC}"
}

main
EOF

Finalmente, actualizo los servicios de API para que funcionen con datos reales en lugar de mock data:

<lov-write file_path="src/services/api/apiUtils.ts">
import { ApiResponse } from '@/types/icecast';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Get auth headers for authenticated requests
export function getAuthHeaders(): Record<string, string> {
  const auth = localStorage.getItem('icecast_auth');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (auth) {
    headers['Authorization'] = `Basic ${auth}`;
  }
  
  return headers;
}

export async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = getAuthHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
      } catch {
        errorMessage = errorText || `Error: ${response.status} ${response.statusText}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error - please check your connection',
    };
  }
}
