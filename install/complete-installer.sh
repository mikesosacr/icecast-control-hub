
#!/bin/bash

# Icecast Control Hub - Complete Installation Script
# Supports Ubuntu 20.04, 22.04, and 24.04

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository configuration
REPO_URL="https://github.com/mikesosacr/icecast-control-hub.git"
INSTALL_DIR="/opt/icecast-control-hub"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║               Icecast Control Hub Installer                  ║${NC}"
echo -e "${BLUE}║                  Complete Installation                       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "Este script no debe ejecutarse como root."
   print_warning "Por favor, ejecuta el script con un usuario que tenga permisos sudo."
   exit 1
fi

# Check Ubuntu version
check_ubuntu_version() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" != "ubuntu" ]]; then
            print_error "Este script está diseñado para Ubuntu. Sistema detectado: $ID"
            exit 1
        fi
        
        case "$VERSION_ID" in
            "20.04"|"22.04"|"24.04")
                print_status "Ubuntu $VERSION_ID detectado - Compatible ✅"
                ;;
            *)
                print_warning "Versión de Ubuntu no probada: $VERSION_ID"
                print_warning "Continuando con la instalación..."
                ;;
        esac
    else
        print_error "No se pudo detectar la versión del sistema operativo"
        exit 1
    fi
}

# Download and execute the complete installer
download_and_install() {
    print_status "Descargando instalador completo desde el repositorio..."
    
    # Create temporary directory
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    # Clone repository
    git clone "$REPO_URL" .
    
    # Make scripts executable
    chmod +x scripts/install-with-auto-update.sh
    chmod +x scripts/update-vps.sh
    
    print_status "Ejecutando instalador completo..."
    ./scripts/install-with-auto-update.sh
    
    # Cleanup
    cd /
    rm -rf "$TEMP_DIR"
}

# Main installation function
main() {
    print_status "Iniciando proceso de instalación..."
    
    # Pre-installation checks
    print_status "Verificando sistema..."
    check_ubuntu_version
    
    # Check for required commands
    for cmd in git curl wget sudo; do
        if ! command -v $cmd &> /dev/null; then
            print_error "Comando requerido no encontrado: $cmd"
            print_status "Instalando dependencias básicas..."
            sudo apt update
            sudo apt install -y git curl wget
            break
        fi
    done
    
    # Run installation
    download_and_install
    
    print_status "¡Instalación completada exitosamente!"
}

# Error handling
trap 'print_error "Error durante la instalación en la línea $LINENO"' ERR

# Run main function
main "$@"
