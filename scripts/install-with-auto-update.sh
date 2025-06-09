
#!/bin/bash

# Icecast Control Hub - Complete Installation and Auto-Update Setup
# This script installs Icecast Control Hub and sets up automatic updates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/mikesosacr/icecast-control-hub.git"
INSTALL_DIR="/opt/icecast-control-hub"
SERVICE_NAME="icecast-control-hub"
FRONTEND_DIR="/var/www/icecast-admin"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Icecast Control Hub - Complete Installer            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}Este script no debe ejecutarse como root.${NC}"
   echo -e "${YELLOW}Por favor, ejecuta el script con un usuario que tenga permisos sudo.${NC}"
   exit 1
fi

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Install system dependencies
install_dependencies() {
    print_status "Instalando dependencias del sistema..."
    
    sudo apt update
    sudo apt install -y curl wget git nginx nodejs npm icecast2
    
    # Install latest Node.js LTS
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt install -y nodejs
    
    print_status "Dependencias instaladas"
}

# Setup Icecast
setup_icecast() {
    print_status "Configurando Icecast2..."
    
    # Backup original config
    sudo cp /etc/icecast2/icecast.xml /etc/icecast2/icecast.xml.backup
    
    # Create basic configuration
    sudo tee /etc/icecast2/icecast.xml > /dev/null <<EOF
<icecast>
    <location>Earth</location>
    <admin>admin@localhost</admin>
    <limits>
        <clients>100</clients>
        <sources>2</sources>
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
    </listen-socket>
    <http-headers>
        <header name="Access-Control-Allow-Origin" value="*" />
    </http-headers>
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
</icecast>
EOF

    sudo systemctl enable icecast2
    sudo systemctl start icecast2
    
    print_status "Icecast2 configurado y ejecutándose"
}

# Install application
install_application() {
    print_status "Instalando Icecast Control Hub..."
    
    # Clone repository
    sudo rm -rf "$INSTALL_DIR"
    sudo git clone "$REPO_URL" "$INSTALL_DIR"
    sudo chown -R $USER:$USER "$INSTALL_DIR"
    
    cd "$INSTALL_DIR"
    
    # Install dependencies
    npm install
    
    # Create environment file
    cat > .env <<EOF
NODE_ENV=production
PORT=3000
ICECAST_HOST=localhost
ICECAST_PORT=8000
ICECAST_ADMIN_USER=admin
ICECAST_ADMIN_PASSWORD=hackme
EOF
    
    # Build frontend
    npm run build
    
    print_status "Aplicación instalada"
}

# Setup systemd service
setup_service() {
    print_status "Configurando servicio systemd..."
    
    sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=Icecast Control Hub Backend
After=network.target icecast2.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    sudo systemctl start "$SERVICE_NAME"
    
    print_status "Servicio systemd configurado"
}

# Setup Nginx
setup_nginx() {
    print_status "Configurando Nginx..."
    
    # Deploy frontend
    sudo mkdir -p "$FRONTEND_DIR"
    sudo cp -r "$INSTALL_DIR/dist/"* "$FRONTEND_DIR/"
    sudo chown -R www-data:www-data "$FRONTEND_DIR"
    sudo chmod -R 755 "$FRONTEND_DIR"
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/icecast-admin > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    root $FRONTEND_DIR;
    index index.html;
    
    # Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Icecast proxy
    location /icecast/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/icecast-admin /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart Nginx
    sudo nginx -t
    sudo systemctl restart nginx
    
    print_status "Nginx configurado"
}

# Setup auto-update
setup_auto_update() {
    print_status "Configurando actualización automática..."
    
    # Copy update script
    sudo mkdir -p /usr/local/bin
    sudo cp "$INSTALL_DIR/scripts/update-vps.sh" /usr/local/bin/update-icecast-hub
    sudo chmod +x /usr/local/bin/update-icecast-hub
    
    # Create systemd timer for auto-updates (optional)
    sudo tee /etc/systemd/system/icecast-hub-update.service > /dev/null <<EOF
[Unit]
Description=Icecast Control Hub Auto Update
After=network.target

[Service]
Type=oneshot
User=$USER
ExecStart=/usr/local/bin/update-icecast-hub
StandardOutput=journal
StandardError=journal
EOF

    sudo tee /etc/systemd/system/icecast-hub-update.timer > /dev/null <<EOF
[Unit]
Description=Run Icecast Control Hub Auto Update Daily
Requires=icecast-hub-update.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF

    sudo systemctl daemon-reload
    
    print_status "Actualización automática configurada"
    echo -e "${YELLOW}Para habilitar actualizaciones automáticas diarias, ejecuta:${NC}"
    echo -e "${YELLOW}sudo systemctl enable icecast-hub-update.timer${NC}"
    echo -e "${YELLOW}sudo systemctl start icecast-hub-update.timer${NC}"
}

# Verify installation
verify_installation() {
    print_status "Verificando instalación..."
    
    # Check services
    if systemctl is-active --quiet icecast2; then
        print_status "✅ Icecast2 ejecutándose"
    else
        print_error "❌ Icecast2 no está ejecutándose"
    fi
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_status "✅ Backend ejecutándose"
    else
        print_error "❌ Backend no está ejecutándose"
    fi
    
    if systemctl is-active --quiet nginx; then
        print_status "✅ Nginx ejecutándose"
    else
        print_error "❌ Nginx no está ejecutándose"
    fi
    
    # Test connections
    if curl -s http://localhost:8000 > /dev/null; then
        print_status "✅ Icecast2 respondiendo en puerto 8000"
    fi
    
    if curl -s http://localhost:3000/api/server-health > /dev/null; then
        print_status "✅ Backend API respondiendo en puerto 3000"
    fi
    
    if curl -s http://localhost > /dev/null; then
        print_status "✅ Frontend accesible a través de Nginx"
    fi
}

# Main installation process
main() {
    echo -e "${BLUE}Iniciando instalación completa...${NC}"
    echo ""
    
    install_dependencies
    setup_icecast
    install_application
    setup_service
    setup_nginx
    setup_auto_update
    verify_installation
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║               ¡Instalación Completada!                      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✅ Icecast Control Hub instalado exitosamente${NC}"
    echo ""
    echo -e "${BLUE}Accede a tu instalación:${NC}"
    echo -e "  🌐 Frontend: http://$(hostname -I | awk '{print $1}')"
    echo -e "  🔧 Icecast Admin: http://$(hostname -I | awk '{print $1}'):8000"
    echo -e "  🔹 Backend API: http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
    echo -e "${BLUE}Credenciales por defecto:${NC}"
    echo -e "  👤 Usuario: admin"
    echo -e "  🔑 Contraseña: hackme"
    echo ""
    echo -e "${BLUE}Comandos útiles:${NC}"
    echo -e "  📊 Estado de servicios: sudo systemctl status icecast2 $SERVICE_NAME nginx"
    echo -e "  📝 Logs del backend: sudo journalctl -u $SERVICE_NAME -f"
    echo -e "  🔄 Actualizar manualmente: sudo /usr/local/bin/update-icecast-hub"
    echo ""
}

# Run main function
main "$@"
