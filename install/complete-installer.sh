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

# Función para detectar instalación existente de Icecast2
detect_icecast() {
    echo -e "${BLUE}🔍 Detectando instalación existente de Icecast2...${NC}"
    ICECAST_INSTALLED=false
    ICECAST_CONFIG_PATH=""
    if command -v icecast2 &> /dev/null; then
        ICECAST_INSTALLED=true
        echo -e "${GREEN}✓ Icecast2 encontrado en el sistema${NC}"
        for config_path in "/etc/icecast2/icecast.xml" "/etc/icecast/icecast.xml" "/usr/local/etc/icecast.xml"; do
            if [ -f "$config_path" ]; then
                ICECAST_CONFIG_PATH="$config_path"
                echo -e "${GREEN}✓ Configuración encontrada: ${config_path}${NC}"
                break
            fi
        done
        if [ -n "$ICECAST_CONFIG_PATH" ] && [ -f "$ICECAST_CONFIG_PATH" ]; then
            PORT_MATCH=$(grep -o '<port>[0-9]*</port>' "$ICECAST_CONFIG_PATH" | head -1 | grep -o '[0-9]*')
            if [ -n "$PORT_MATCH" ]; then
                ICECAST_PORT=$PORT_MATCH
            fi
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
        echo -e "${YELLOW}⚠️ Icecast2 no encontrado, se instalará automáticamente${NC}"
    fi
}

# Función para configurar credenciales
configure_credentials() {
    echo -e "${BLUE}🔐 Configurando credenciales de administración...${NC}"
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

# Función para nuevas credenciales
configure_new_credentials() {
    echo -e "${BLUE}🔑 Configurando nuevas credenciales...${NC}"
    echo -e "${YELLOW}Ingrese el usuario administrador (default: admin):${NC}"
    read -r new_admin_user
    ICECAST_ADMIN_USER=${new_admin_user:-"admin"}
    echo -e "${YELLOW}Ingrese la contraseña de administrador:${NC}"
    read -s new_admin_pass
    echo
    if [ -z "$new_admin_pass" ]; then
        echo -e "${YELLOW}Generando contraseña automática...${NC}"
        ICECAST_ADMIN_PASS=$(openssl rand -base64 12)
        echo -e "${GREEN}✅ Contraseña generada: ${ICECAST_ADMIN_PASS}${NC}"
    else
        ICECAST_ADMIN_PASS="$new_admin_pass"
    fi
    if [ -z "$ICECAST_SOURCE_PASS" ]; then
        echo -e "${YELLOW}Ingrese la contraseña de source (default: hackme):${NC}"
        read -s new_source_pass
        echo
        ICECAST_SOURCE_PASS=${new_source_pass:-"hackme"}
    fi
}

# Función para instalar dependencias
install_dependencies() {
    echo -e "${BLUE}📦 Instalando dependencias del sistema...${NC}"
    apt update -y
    apt install -y curl wget gnupg ca-certificates lsb-release nginx supervisor git
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

# Función para configurar aplicación
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
EOF

    # Crear package.json básico
    cat > "$APP_DIR/package.json" << EOF
{
  "name": "icecast-admin",
  "version": "1.0.0",
  "description": "Panel de administración para Icecast2",
  "main": "api/server.js",
  "scripts": {
    "start": "node api/server.js"
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

    # Crear servidor Express básico
    cat > "$APP_DIR/api/server.js" << 'EOF'
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

// Middleware de autenticación básica
const auth = (req, res, next) => {
  const user = basicAuth(req);
  if (!user || user.name !== process.env.ICECAST_ADMIN_USERNAME || user.pass !== process.env.ICECAST_ADMIN_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Icecast Panel API"');
    return res.status(401).send('Authentication required');
  }
  return next();
};

// Rutas públicas
app.get('/api/server-health', (req, res) => {
  exec('command -v icecast2', (error) => {
    if (error) {
      return res.status(404).json({ available: false, message: 'Icecast2 no está instalado' });
    }
    exec('systemctl is-active icecast2', (error, stdout) => {
      const status = stdout.trim() === 'active' ? 'running' : 'stopped';
      res.json({ available: true, status, configPath: ICECAST_CONFIG_PATH });
    });
  });
});

// Rutas protegidas
app.use(auth);

// Servir frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto \${PORT}`);
});
EOF

    # Clonar tu repo frontend
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

# Función para configurar servicios
setup_services() {
    echo -e "${BLUE}🔁 Configurando servicios...${NC}"

    # Supervisor
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

    supervisorctl reread
    supervisorctl update
    supervisorctl start icecast-admin

    # Nginx
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

    ln -sf /etc/nginx/sites-available/icecast-admin /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default || true
    systemctl restart nginx
    systemctl enable nginx
}

# Función para reiniciar servicios si fallan
repair_services() {
    echo -e "${BLUE}🔄 Reparando servicios críticos...${NC}"
    systemctl daemon-reexec || true

    # Reiniciar o reparar Supervisor
    if ! systemctl is-active supervisor &>/dev/null; then
        echo -e "${YELLOW}⚠️ Supervisor no activo. Reinstalando...${NC}"
        apt purge --auto-remove supervisor -y
        apt install -y supervisor
        systemctl enable supervisor
    fi
    systemctl start supervisor
    supervisorctl update

    # Reiniciar Nginx si hay problemas
    if ! systemctl is-active nginx &>/dev/null; then
        echo -e "${YELLOW}⚠️ Nginx no activo. Reiniciando...${NC}"
        systemctl start nginx
    fi
}

# Función para crear archivo de info final
create_info_file() {
    cat > "$APP_DIR/INFO.md" << EOF
# Información del Panel Icecast2

- **URL del Panel**: http://${SERVER_IP}
- **API**: http://${SERVER_IP}:3000/api
- **Admin Icecast**: http://${SERVER_IP}:${ICECAST_PORT}/admin/
- **Usuario Admin**: ${ICECAST_ADMIN_USER}
- **Contraseña Admin**: ${ICECAST_ADMIN_PASS}
- **Contraseña Source**: ${ICECAST_SOURCE_PASS}
- **Puerto Icecast**: ${ICECAST_PORT}
- **Mountpoint Ejemplo**: /stream
EOF
    echo -e "${GREEN}📄 Info guardada en: ${APP_DIR}/INFO.md${NC}"
}

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
}

main
