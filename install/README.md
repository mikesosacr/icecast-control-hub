
# Icecast2 Admin Panel - Instalación

Este directorio contiene todos los archivos necesarios para instalar y configurar el Panel de Administración de Icecast2 en servidores Ubuntu.

## Archivos Incluidos

### Instalador Principal
- **`complete-installer.sh`** - Instalador completo y automatizado que:
  - Detecta instalaciones existentes de Icecast2
  - Configura credenciales interactivamente
  - Instala todas las dependencias necesarias
  - Configura servicios (Nginx, Supervisor)
  - Crea la aplicación del panel completa

### Configuración de Referencia
- **`icecast2-config-template.xml`** - Plantilla de configuración de Icecast2 optimizada

## Instalación Rápida

### Opción 1: Instalador Completo (Recomendado)
```bash
# Descargar e instalar
wget https://raw.githubusercontent.com/tu-usuario/icecast-admin/main/install/complete-installer.sh
chmod +x complete-installer.sh
sudo ./complete-installer.sh
```

### Opción 2: Desde Git
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/icecast-admin.git
cd icecast-admin/install

# Ejecutar instalador
chmod +x complete-installer.sh
sudo ./complete-installer.sh
```

## Características del Instalador

### ✅ Detección Inteligente
- Detecta instalaciones existentes de Icecast2
- Extrae configuraciones actuales automáticamente
- Preserva credenciales existentes cuando es posible

### ⚙️ Configuración Automática
- Instala Node.js, Nginx, Supervisor y dependencias
- Configura servicios del sistema automáticamente
- Genera credenciales seguras si no se proporcionan

### 🔒 Seguridad
- Configuración de firewall automática
- Autenticación básica para API
- Respaldos automáticos de configuraciones

### 📊 Monitoring
- Logs detallados de instalación
- Supervisión automática de servicios
- Reinicio automático en caso de fallas

## Post-Instalación

Después de la instalación exitosa:

1. **Acceder al Panel**: `http://TU_IP_SERVIDOR`
2. **Admin Icecast**: `http://TU_IP_SERVIDOR:8000/admin/`
3. **Verificar servicios**:
   ```bash
   sudo supervisorctl status icecast-admin
   sudo systemctl status icecast2
   sudo systemctl status nginx
   ```

## Archivos de Configuración

- **Panel**: `/opt/icecast-admin/.env`
- **Icecast2**: `/etc/icecast2/icecast.xml`
- **Nginx**: `/etc/nginx/sites-available/icecast-admin`
- **Supervisor**: `/etc/supervisor/conf.d/icecast-admin.conf`
- **Info de instalación**: `/opt/icecast-admin/INSTALL_INFO.md`

## Gestión de Servicios

```bash
# Panel de administración
sudo supervisorctl restart icecast-admin
sudo supervisorctl tail -f icecast-admin

# Servidor Icecast2
sudo systemctl restart icecast2
sudo systemctl status icecast2

# Servidor web
sudo systemctl restart nginx
```

## Desarrollo

Para desarrollar usando este panel:

1. Construye tu aplicación frontend
2. Copia los archivos a `/opt/icecast-admin/dist/`
3. Los cambios se servirán automáticamente

## Solución de Problemas

### Verificar logs
```bash
# Logs del panel
sudo supervisorctl tail -f icecast-admin

# Logs de Icecast2
sudo tail -f /var/log/icecast2/error.log

# Logs de instalación
sudo tail -f /var/log/icecast-admin-install.log
```

### Restablecer configuración
```bash
# Reiniciar todos los servicios
sudo systemctl restart icecast2 nginx
sudo supervisorctl restart icecast-admin

# Verificar estado
sudo supervisorctl status
sudo systemctl status icecast2 nginx
```

## Soporte

Para problemas específicos:
1. Revisa los logs mencionados arriba
2. Verifica que los puertos 80, 3000 y 8000 estén abiertos
3. Confirma que las credenciales sean correctas
4. Revisa el archivo `/opt/icecast-admin/INSTALL_INFO.md` para detalles de instalación

## Requisitos del Sistema

- Ubuntu 18.04+ (20.04, 22.04 recomendado)
- Acceso root o sudo
- Conexión a internet para descargar dependencias
- Puertos 80, 3000, 8000 disponibles
