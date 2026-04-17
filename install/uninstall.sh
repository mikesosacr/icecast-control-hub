#!/bin/bash

# Icecast Control Hub - Uninstaller
# Removes the Icecast Control Hub installation from Ubuntu VPS

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

INSTALL_DIR="/opt/icecast-control-hub"
SERVICE_NAME="icecast-control-hub"
FRONTEND_DIR="/var/www/icecast-admin"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Icecast Control Hub - Uninstaller                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Este script debe ejecutarse como root (sudo).${NC}"
   exit 1
fi

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Stop and disable services
print_status "Deteniendo servicios..."
systemctl stop "$SERVICE_NAME" 2>/dev/null || true
systemctl disable "$SERVICE_NAME" 2>/dev/null || true
rm -f "/etc/systemd/system/$SERVICE_NAME.service"
rm -f "/etc/systemd/system/icecast-hub-update.service"
rm -f "/etc/systemd/system/icecast-hub-update.timer"
systemctl daemon-reload

# Remove Nginx config
if [ -f /etc/nginx/sites-enabled/icecast-admin ]; then
    rm -f /etc/nginx/sites-enabled/icecast-admin
    rm -f /etc/nginx/sites-available/icecast-admin
    systemctl restart nginx 2>/dev/null || true
    print_status "Configuración de Nginx eliminada"
fi

# Remove application files
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    print_status "Directorio de aplicación eliminado"
fi

if [ -d "$FRONTEND_DIR" ]; then
    rm -rf "$FRONTEND_DIR"
    print_status "Frontend eliminado"
fi

# Remove update script
rm -f /usr/local/bin/update-icecast-hub

# Optionally remove Icecast2
read -p "¿Deseas también desinstalar Icecast2? [s/N] " choice
case "$choice" in
  s|S)
    systemctl stop icecast2 2>/dev/null || true
    systemctl disable icecast2 2>/dev/null || true
    apt-get remove -y icecast2
    apt-get autoremove -y
    print_status "Icecast2 desinstalado"
    ;;
  *)
    print_warning "Icecast2 se mantendrá instalado"
    ;;
esac

echo ""
echo -e "${GREEN}✅ Desinstalación completada.${NC}"
