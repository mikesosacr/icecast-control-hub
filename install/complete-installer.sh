#!/bin/bash
set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}     Panel Admin Icecast2 - Instalador Completo Ubuntu          ${NC}"
echo -e "${BLUE}================================================================${NC}"

# Verificar ejecución como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Por favor ejecutar como root o con sudo.${NC}"
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
SERVER_IP=$(curl -s https://api.ipify.org) 

# Fallback si curl falla o devuelve IP privada
if [ -z "$SERVER_IP" ] || [[ "$SERVER_IP" =~ ^(10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.|192\.168\.|127\.) ]]; then
    echo -e "${YELLOW}No se pudo obtener la IP pública, intentando con hostname...${NC}"
    SERVER_IP=$(hostname -I | tr ' ' '\n' | grep -vE '^(10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.|192\.168\.|127\.)' | head -n1)
fi

if [ -z "$SERVER_IP" ]; then
    SERVER_IP="localhost"
fi

echo -e "${GREEN}IP del servidor detectada: ${SERVER_IP}${NC}"

# Directorio base
APP_DIR="/opt/icecast-admin"

# Credenciales predeterminadas
ICECAST_PORT=8000
ICECAST_ADMIN_USER="admin"
ICECAST_ADMIN_PASS=""
ICECAST_SOURCE_PASS=""

# Ruta del repo frontend
FRONTEND_REPO="https://github.com/mikesosacr/icecast-control-hub.git" 
FRONTEND_BRANCH="main"
FRONTEND_DIR="$APP_DIR/frontend"

# Función para detectar Icecast2
detect_icecast() {
    echo -e "${BLUE}Detectando instalación existente de Icecast2...${NC}"
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
        # Extraer configuración existente
        if [ -n "$ICECAST_CONFIG_PATH" ]; then
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
        echo -e "${YELLOW}Icecast2 no encontrado, se instalará automáticamente${NC}"
    fi
}

# Función para configurar credenciales
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

# Función para nuevas credenciales
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
    if [ -z "$ICECAST_SOURCE_PASS" ]; then
        echo -e "${YELLOW}Ingrese la contraseña de source (default: hackme):${NC}"
        read -s new_source_pass
        echo
        ICECAST_SOURCE_PASS=${new_source_pass:-"hackme"}
    fi
}

# Función para instalar dependencias
install_dependencies() {
    echo -e "${BLUE}Instalando dependencias del sistema...${NC}"
    apt-get update
    apt-get install -y curl wget gnupg2 ca-certificates lsb-release apt-transport-https nginx supervisor git
    echo -e "${GREEN}Instalando Node.js...${NC}"
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x  | bash -
        apt-get install -y nodejs
    else
        echo -e "${GREEN}✓ Node.js ya está instalado${NC}"
    fi
    if [ "$ICECAST_INSTALLED" = false ]; then
        echo -e "${GREEN}Instalando Icecast2...${NC}"
        apt-get install -y icecast2
        ICECAST_CONFIG_PATH="/etc/icecast2/icecast.xml"
    fi
}

# Función para configurar app
setup_application() {
    echo -e "${BLUE}Configurando aplicación del panel...${NC}"
    mkdir -p $APP_DIR
    cat > $APP_DIR/.env << EOF
# API Configuration
VITE_API_BASE_URL=http://${SERVER_IP}:3000/api
ICECAST_CONFIG_PATH=${ICECAST_CONFIG_PATH}
ICECAST_ADMIN_USERNAME=${ICECAST_ADMIN_USER}
ICECAST_ADMIN_PASSWORD=${ICECAST_ADMIN_PASS}
ICECAST_PORT=${ICECAST_PORT}
PORT=3000
EOF
    # Clonar frontend
    echo -e "${BLUE}Clonando frontend desde GitHub...${NC}"
    rm -rf $FRONTEND_DIR
    git clone -b $FRONTEND_BRANCH $FRONTEND_REPO $FRONTEND_DIR
    cd $FRONTEND_DIR
    echo -e "${BLUE}Instalando dependencias del frontend...${NC}"
    npm install
    echo -e "${BLUE}Construyendo el frontend...${NC}"
    npm run build
    cp -r dist/* $APP_DIR/dist/
}

# Función para configurar Icecast
configure_icecast() {
    echo -e "${BLUE}Configurando Icecast2...${NC}"
    if [ -f "$ICECAST_CONFIG_PATH" ]; then
        cp "$ICECAST_CONFIG_PATH" "${ICECAST_CONFIG_PATH}.bak.$(date +%Y%m%d%H%M%S)"
    fi
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
    if [ -f /etc/default/icecast2 ]; then
        sed -i 's/ENABLE=false/ENABLE=true/' /etc/default/icecast2
    fi
}

# Función para servicios
setup_services() {
    echo -e "${BLUE}Configurando servicios...${NC}"
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

# Función para firewall
configure_firewall() {
    echo -e "${BLUE}Configurando firewall...${NC}"
    if iptables -L | grep -q "Chain INPUT.*DROP"; then
        echo -e "${YELLOW}Detectadas reglas de iptables, configurando puertos...${NC}"
        iptables -I INPUT -p tcp --dport 80 -j ACCEPT
        iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
        iptables -I INPUT -p tcp --dport ${ICECAST_PORT} -j ACCEPT
        iptables -I INPUT -p tcp --dport 22 -j ACCEPT
        if command -v iptables-save &> /dev/null; then
            iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
        fi
    else
        echo -e "${GREEN}✓ Firewall no restrictivo detectado${NC}"
    fi
}

# Función para iniciar servicios
start_services() {
    echo -e "${BLUE}Iniciando servicios...${NC}"
    systemctl restart icecast2
    systemctl enable icecast2
    systemctl restart nginx
    systemctl enable nginx
    supervisorctl update
    supervisorctl start icecast-admin
}

# Información final
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
- **Mountpoint**: /stream
EOF
}

# Flujo principal
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
    echo -e "${GREEN}Panel accesible en: http://${SERVER_IP}${NC}"
    echo -e "${GREEN}Icecast Admin: http://${SERVER_IP}:${ICECAST_PORT}/admin/${NC}"
    echo -e "${GREEN}Usuario: ${ICECAST_ADMIN_USER}${NC}"
    echo -e "${GREEN}Contraseña: ${ICECAST_ADMIN_PASS}${NC}"
}

main
