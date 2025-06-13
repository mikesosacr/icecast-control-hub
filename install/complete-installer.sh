#!/bin/bash
# install.sh - Instalador y gestor para icecast-control-hub en VPS Ubuntu
# Requiere: sudo

set -e

REPO_URL="https://github.com/mikesosacr/icecast-control-hub.git"
APP_DIR="/opt/icecast-control-hub"
ENV_FILE="$APP_DIR/.env"
ICECAST_CONFIG="/etc/icecast.xml"
ICECAST_SERVICE="icecast-kh"
SYSTEMD_SERVICE="/etc/systemd/system/icecast-control-hub.service"

function check_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Este script requiere permisos de sudo. Ejecuta: sudo ./install.sh"
    exit 1
  fi
}

function install_dependencies() {
  echo "Actualizando repositorios e instalando dependencias..."
  apt update
  apt install -y icecast-kh nodejs npm sqlite3 git
  NODE_VER=$(node -v)
  echo "Node.js instalado: $NODE_VER"
}

function clone_or_update_repo() {
  if [ -d "$APP_DIR" ]; then
    echo "Actualizando repo existente..."
    cd "$APP_DIR"
    git pull
  else
    echo "Clonando repo en $APP_DIR..."
    git clone "$REPO_URL" "$APP_DIR"
  fi
}

function create_env() {
  echo "Configurando archivo .env..."
  read -p "Usuario admin para Icecast y Dashboard: " ADMIN_USER
  read -sp "Contraseña para admin: " ADMIN_PASS
  echo
  read -p "Puerto para Icecast (default 8000): " ICECAST_PORT
  ICECAST_PORT=${ICECAST_PORT:-8000}

  cat > "$ENV_FILE" << EOF
ADMIN_USER=$ADMIN_USER
ADMIN_PASS=$ADMIN_PASS
ICECAST_PORT=$ICECAST_PORT
EOF
  echo ".env creado."
}

function configure_icecast() {
  echo "Configurando Icecast-KH..."
  # Backup config
  cp "$ICECAST_CONFIG" "$ICECAST_CONFIG.bak.$(date +%F-%T)"

  # Editar puerto y credenciales básicas en icecast.xml
  sed -i "s/<port>.*<\/port>/<port>$ICECAST_PORT<\/port>/" "$ICECAST_CONFIG"
  sed -i "s|<username>.*</username>|<username>$ADMIN_USER</username>|" "$ICECAST_CONFIG"
  sed -i "s|<password>.*</password>|<password>$ADMIN_PASS</password>|" "$ICECAST_CONFIG"

  systemctl restart "$ICECAST_SERVICE"
  echo "Icecast-KH configurado y reiniciado."
}

function setup_database() {
  echo "Configurando base de datos SQLite..."
  cd "$APP_DIR"
  if [ ! -f database.sqlite ]; then
    sqlite3 database.sqlite <<EOF
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mountpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

INSERT OR IGNORE INTO users (username, password, role) VALUES ('$ADMIN_USER', '$ADMIN_PASS', 'admin');
EOF
    echo "Base de datos creada con usuario admin."
  else
    echo "Base de datos ya existe, saltando creación."
  fi
}

function install_backend_frontend() {
  echo "Instalando backend y frontend..."
  cd "$APP_DIR"
  npm install

  if [ -f package.json ] && grep -q "\"build\"" package.json; then
    echo "Compilando frontend..."
    npm run build || echo "No se pudo construir frontend, verifica scripts."
  fi
}

function create_systemd_service() {
  echo "Creando servicio systemd para backend..."

  cat > "$SYSTEMD_SERVICE" << EOF
[Unit]
Description=Icecast Control Hub Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node $APP_DIR/server.js
Restart=on-failure
User=root
EnvironmentFile=$ENV_FILE

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable icecast-control-hub.service
  systemctl restart icecast-control-hub.service
  echo "Servicio systemd creado, habilitado y en ejecución."
}

function update_admin_credentials() {
  echo "Cambiar usuario/contraseña admin..."
  read -p "Nuevo usuario admin: " NEW_USER
  read -sp "Nueva contraseña: " NEW_PASS
  echo
  # Actualizar env
  sed -i "s/^ADMIN_USER=.*/ADMIN_USER=$NEW_USER/" "$ENV_FILE"
  sed -i "s/^ADMIN_PASS=.*/ADMIN_PASS=$NEW_PASS/" "$ENV_FILE"
  # Actualizar icecast config
  sed -i "s|<username>.*</username>|<username>$NEW_USER</username>|" "$ICECAST_CONFIG"
  sed -i "s|<password>.*</password>|<password>$NEW_PASS</password>|" "$ICECAST_CONFIG"
  # Actualizar DB
  cd "$APP_DIR"
  sqlite3 database.sqlite "UPDATE users SET username='$NEW_USER', password='$NEW_PASS' WHERE role='admin';"
  systemctl restart "$ICECAST_SERVICE"
  systemctl restart icecast-control-hub.service
  echo "Usuario y contraseña actualizados."
}

function change_icecast_port() {
  echo "Cambiar puerto Icecast..."
  read -p "Nuevo puerto: " NEW_PORT
  sed -i "s/^ICECAST_PORT=.*/ICECAST_PORT=$NEW_PORT/" "$ENV_FILE"
  sed -i "s/<port>.*<\/port>/<port>$NEW_PORT<\/port>/" "$ICECAST_CONFIG"
  systemctl restart "$ICECAST_SERVICE"
  echo "Puerto cambiado y servidor reiniciado."
}

function main_menu() {
  echo
  echo "=== Menú principal ==="
  echo "1) Reinstalar todo (pierde configuraciones previas)"
  echo "2) Cambiar usuario/contraseña admin"
  echo "3) Cambiar puerto Icecast"
  echo "4) Salir"
  read -p "Selecciona opción: " option

  case $option in
    1)
      echo "Reinstalando..."
      create_env
      configure_icecast
      setup_database
      install_backend_frontend
      create_systemd_service
      ;;
    2)
      update_admin_credentials
      ;;
    3)
      change_icecast_port
      ;;
    4)
      echo "Saliendo..."
      exit 0
      ;;
    *)
      echo "Opción inválida."
      main_menu
      ;;
  esac
}

# --- Comienzo del script ---
check_root
install_dependencies
clone_or_update_repo

if [ ! -f "$ENV_FILE" ]; then
  echo "Primera instalación detectada."
  create_env
  configure_icecast
  setup_database
  install_backend_frontend
  create_systemd_service
else
  echo "Instalación previa detectada."
  main_menu
fi

echo "Proceso finalizado."
