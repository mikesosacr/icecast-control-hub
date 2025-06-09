
#!/bin/bash

# Icecast Control Hub - VPS Update Script
# This script updates the Icecast Control Hub installation on Ubuntu VPS

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
NGINX_CONFIG="/etc/nginx/sites-available/icecast-admin"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Icecast Control Hub - VPS Updater               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}Este script no debe ejecutarse como root.${NC}"
   echo -e "${YELLOW}Por favor, ejecuta el script con un usuario que tenga permisos sudo.${NC}"
   exit 1
fi

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if service is running
is_service_running() {
    systemctl is-active --quiet "$1" 2>/dev/null
}

# Backup current installation
backup_installation() {
    print_status "Creando respaldo de la instalación actual..."
    
    local backup_dir="/opt/backups/icecast-control-hub-$(date +%Y%m%d-%H%M%S)"
    sudo mkdir -p "$backup_dir"
    
    if [ -d "$INSTALL_DIR" ]; then
        sudo cp -r "$INSTALL_DIR" "$backup_dir/backend"
        print_status "Backend respaldado en $backup_dir/backend"
    fi
    
    if [ -d "$FRONTEND_DIR" ]; then
        sudo cp -r "$FRONTEND_DIR" "$backup_dir/frontend"
        print_status "Frontend respaldado en $backup_dir/frontend"
    fi
    
    echo "$backup_dir" > /tmp/icecast-backup-path
    print_status "Respaldo completado en: $backup_dir"
}

# Stop services
stop_services() {
    print_status "Deteniendo servicios..."
    
    if is_service_running "$SERVICE_NAME"; then
        sudo systemctl stop "$SERVICE_NAME"
        print_status "Servicio $SERVICE_NAME detenido"
    fi
    
    if is_service_running "nginx"; then
        sudo systemctl stop nginx
        print_status "Nginx detenido"
    fi
}

# Update backend
update_backend() {
    print_status "Actualizando backend..."
    
    # Remove old installation
    if [ -d "$INSTALL_DIR" ]; then
        sudo rm -rf "$INSTALL_DIR"
    fi
    
    # Clone latest version
    sudo git clone "$REPO_URL" "$INSTALL_DIR"
    sudo chown -R $USER:$USER "$INSTALL_DIR"
    
    cd "$INSTALL_DIR"
    
    # Install dependencies
    print_status "Instalando dependencias del backend..."
    npm install
    
    # Copy environment configuration if it exists
    if [ -f "/tmp/icecast-env-backup" ]; then
        cp "/tmp/icecast-env-backup" "$INSTALL_DIR/.env"
        print_status "Configuración de entorno restaurada"
    fi
    
    print_status "Backend actualizado exitosamente"
}

# Update frontend
update_frontend() {
    print_status "Actualizando frontend..."
    
    cd "$INSTALL_DIR"
    
    # Build frontend
    print_status "Compilando frontend..."
    npm run build
    
    # Remove old frontend
    if [ -d "$FRONTEND_DIR" ]; then
        sudo rm -rf "$FRONTEND_DIR"
    fi
    
    # Copy new frontend
    sudo mkdir -p "$FRONTEND_DIR"
    sudo cp -r dist/* "$FRONTEND_DIR/"
    sudo chown -R www-data:www-data "$FRONTEND_DIR"
    sudo chmod -R 755 "$FRONTEND_DIR"
    
    print_status "Frontend actualizado exitosamente"
}

# Update systemd service
update_service() {
    print_status "Actualizando servicio systemd..."
    
    # Create updated service file
    sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=Icecast Control Hub Backend
After=network.target

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
    print_status "Servicio systemd actualizado"
}

# Start services
start_services() {
    print_status "Iniciando servicios..."
    
    sudo systemctl start "$SERVICE_NAME"
    sudo systemctl enable "$SERVICE_NAME"
    
    if is_service_running "$SERVICE_NAME"; then
        print_status "Servicio $SERVICE_NAME iniciado exitosamente"
    else
        print_error "Fallo al iniciar el servicio $SERVICE_NAME"
        return 1
    fi
    
    sudo systemctl start nginx
    
    if is_service_running "nginx"; then
        print_status "Nginx iniciado exitosamente"
    else
        print_error "Fallo al iniciar Nginx"
        return 1
    fi
}

# Verify update
verify_update() {
    print_status "Verificando actualización..."
    
    # Check if services are running
    if is_service_running "$SERVICE_NAME" && is_service_running "nginx"; then
        print_status "✅ Todos los servicios están ejecutándose correctamente"
    else
        print_error "❌ Algunos servicios no están ejecutándose"
        return 1
    fi
    
    # Test backend API
    if curl -s http://localhost:3000/api/server-health > /dev/null; then
        print_status "✅ Backend API respondiendo correctamente"
    else
        print_warning "⚠️  Backend API no está respondiendo en el puerto 3000"
    fi
    
    # Test frontend
    if [ -f "$FRONTEND_DIR/index.html" ]; then
        print_status "✅ Frontend desplegado correctamente"
    else
        print_error "❌ Frontend no encontrado"
        return 1
    fi
}

# Rollback function
rollback() {
    print_error "Error durante la actualización. Iniciando rollback..."
    
    local backup_path
    if [ -f "/tmp/icecast-backup-path" ]; then
        backup_path=$(cat /tmp/icecast-backup-path)
        
        if [ -d "$backup_path" ]; then
            print_status "Restaurando desde respaldo: $backup_path"
            
            # Stop services
            sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true
            sudo systemctl stop nginx 2>/dev/null || true
            
            # Restore backend
            if [ -d "$backup_path/backend" ]; then
                sudo rm -rf "$INSTALL_DIR"
                sudo cp -r "$backup_path/backend" "$INSTALL_DIR"
                print_status "Backend restaurado"
            fi
            
            # Restore frontend
            if [ -d "$backup_path/frontend" ]; then
                sudo rm -rf "$FRONTEND_DIR"
                sudo cp -r "$backup_path/frontend" "$FRONTEND_DIR"
                print_status "Frontend restaurado"
            fi
            
            # Start services
            sudo systemctl start "$SERVICE_NAME"
            sudo systemctl start nginx
            
            print_status "Rollback completado"
        else
            print_error "Respaldo no encontrado en $backup_path"
        fi
    else
        print_error "Ruta de respaldo no encontrada"
    fi
}

# Main update process
main() {
    echo -e "${BLUE}Iniciando proceso de actualización...${NC}"
    echo ""
    
    # Check if installation exists
    if [ ! -d "$INSTALL_DIR" ]; then
        print_error "Instalación no encontrada en $INSTALL_DIR"
        echo -e "${YELLOW}Ejecuta el script de instalación primero.${NC}"
        exit 1
    fi
    
    # Backup environment
    if [ -f "$INSTALL_DIR/.env" ]; then
        cp "$INSTALL_DIR/.env" "/tmp/icecast-env-backup"
        print_status "Configuración de entorno respaldada"
    fi
    
    # Set trap for rollback on error
    trap rollback ERR
    
    backup_installation
    stop_services
    update_backend
    update_frontend
    update_service
    start_services
    verify_update
    
    # Remove trap
    trap - ERR
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                 ¡Actualización Completada!                  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✅ Icecast Control Hub ha sido actualizado exitosamente${NC}"
    echo ""
    echo -e "${BLUE}Información de servicios:${NC}"
    echo -e "  🔹 Backend: http://localhost:3000"
    echo -e "  🔹 Frontend: Disponible a través de Nginx"
    echo -e "  🔹 Logs del backend: sudo journalctl -u $SERVICE_NAME -f"
    echo -e "  🔹 Logs de Nginx: sudo tail -f /var/log/nginx/error.log"
    echo ""
    echo -e "${YELLOW}Nota: Si experimentas problemas, puedes hacer rollback usando:${NC}"
    echo -e "${YELLOW}  sudo systemctl stop $SERVICE_NAME nginx${NC}"
    echo -e "${YELLOW}  # Luego restaura manualmente desde el respaldo en $(cat /tmp/icecast-backup-path 2>/dev/null || echo '/opt/backups/')${NC}"
    echo ""
}

# Run main function
main "$@"
