#!/bin/bash
set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}       Desinstalador del Panel Admin Icecast2                   ${NC}"
echo -e "${BLUE}================================================================${NC}"

# Verificar que se ejecute como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Por favor ejecutar como root o con sudo.${NC}"
  exit 1
fi

APP_DIR="/opt/icecast-admin"
ICECAST_CONFIG_PATH="/etc/icecast2/icecast.xml"

echo -e "${YELLOW}Iniciando proceso de desinstalación...${NC}"

# 1. Detener servicios
echo -e "${BLUE}Deteniendo servicios...${NC}"
systemctl stop icecast2 nginx supervisor &> /dev/null || true
systemctl disable icecast2 nginx supervisor &> /dev/null || true

# 2. Eliminar procesos de Supervisor
if [ -f /etc/supervisor/conf.d/icecast-admin.conf ]; then
    rm -f /etc/supervisor/conf.d/icecast-admin.conf
    supervisorctl update &> /dev/null || true
fi

# 3. Eliminar configuración de Nginx
if [ -L /etc/nginx/sites-enabled/icecast-admin ]; then
    rm -f /etc/nginx/sites-enabled/icecast-admin
fi
if [ -f /etc/nginx/sites-available/icecast-admin ]; then
    rm -f /etc/nginx/sites-available/icecast-admin
fi

# 4. Reiniciar Nginx
systemctl restart nginx &> /dev/null || true

# 5. Eliminar directorio de aplicación
if [ -d "$APP_DIR" ]; then
    echo -e "${BLUE}Eliminando directorio de aplicación...${NC}"
    rm -rf "$APP_DIR"
fi

# 6. Eliminar log de instalación
if [ -f "/var/log/icecast-admin-install.log" ]; then
    rm -f "/var/log/icecast-admin-install.log"
fi

# 7. Eliminar logs de la app
if [ -f "/var/log/icecast-admin.log" ]; then
    rm -f "/var/log/icecast-admin.log"
fi
if [ -f "/var/log/icecast-admin-error.log" ]; then
    rm -f "/var/log/icecast-admin-error.log"
fi

# 8. Restablecer configuración de Icecast2 (opcional)
if [ -f "$ICECAST_CONFIG_PATH" ]; then
    echo -e "${BLUE}Restaurando configuración original de Icecast2...${NC}"
    # Si hay backup, restaurarlo
    BACKUP=$(ls -t "$ICECAST_CONFIG_PATH".bak.* 2>/dev/null | head -n1)
    if [ -f "$BACKUP" ]; then
        cp "$BACKUP" "$ICECAST_CONFIG_PATH"
    else
        echo -e "${YELLOW}No se encontró backup de icecast.xml. Se dejará el archivo actual.${NC}"
    fi
fi

# 9. (Opcional) Desinstalar paquetes adicionales
read -p $'\033[33m¿Deseas desinstalar los paquetes instalados (nginx, nodejs, icecast2, supervisor)? [s/N] \033[0m' choice
case "$choice" in
  s|S )
    echo -e "${BLUE}Desinstalando paquetes adicionales...${NC}"
    apt-get remove -y nginx nodejs icecast2 supervisor
    apt-get autoremove -y
    ;;
  * )
    echo -e "${YELLOW}Se mantendrán los paquetes instalados.${NC}"
    ;;
esac

# 10. Limpiar firewall (restablecer reglas)
read -p $'\033[33m¿Limpiar reglas personalizadas del firewall? [s/N] \033[0m' choice
case "$choice" in
  s|S )
    echo -e "${BLUE}Limpiando reglas de firewall...${NC}"
    iptables -F
    iptables -X
    iptables -P INPUT ACCEPT
    iptables -P FORWARD ACCEPT
    iptables -P OUTPUT ACCEPT
    echo -e "${GREEN}✓ Firewall reiniciado (todas las conexiones permitidas).${NC}"
    ;;
  * )
    echo -e "${YELLOW}Reglas de firewall no modificadas.${NC}"
    ;;
esac

echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}✅ Desinstalación completada.${NC}"
echo -e "${GREEN}Ahora puedes volver a instalar usando el nuevo script corregido.${NC}"
echo -e "${GREEN}================================================================${NC}"