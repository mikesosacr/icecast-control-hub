
# Instalación Inteligente del Panel Icecast2

Este script instalará automáticamente el panel de administración para Icecast2 en un VPS Ubuntu, adaptándose a instalaciones existentes.

## Características

- ✅ **Detección automática** de instalaciones existentes de Icecast2
- ✅ **Adaptación inteligente** a configuraciones previas
- ✅ **Instalación completa** si no existe Icecast2
- ✅ **Configuración automática** de servicios y firewall
- ✅ **Gestión de credenciales** existentes o nuevas

## Instalación Rápida

```bash
# Descargar e instalar
curl -fsSL https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/install/smart-install.sh | sudo bash
```

## Instalación Manual

```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO

# Ejecutar instalación
sudo chmod +x install/smart-install.sh
sudo ./install/smart-install.sh
```

## Lo que hace el script

### 1. Detección automática
- Busca instalaciones existentes de Icecast2
- Detecta configuraciones y credenciales actuales
- Identifica puertos y rutas configuradas

### 2. Instalación de dependencias
- Node.js (si no está instalado)
- Nginx (proxy reverso)
- Supervisor (gestión de procesos)
- Icecast2 (si no está instalado)

### 3. Configuración inteligente
- Usa credenciales existentes o permite crear nuevas
- Configura la API del panel
- Integra con la instalación existente

### 4. Servicios automáticos
- Panel admin corriendo en puerto 3000
- Nginx como proxy en puerto 80
- Icecast2 en su puerto configurado (normalmente 8000)

## Después de la instalación

### Acceso al panel
- **URL principal**: `http://TU_IP_DEL_SERVIDOR`
- **Admin Icecast**: `http://TU_IP_DEL_SERVIDOR:8000/admin/`

### Conectar tu aplicación frontend
```bash
# Navegar al directorio del panel
cd /opt/icecast-admin

# Si tienes tu código fuente, copiarlo aquí
# Luego construir la aplicación
npm run build

# El panel se actualizará automáticamente
```

### Gestión de servicios

```bash
# Ver estado del panel
sudo supervisorctl status icecast-admin

# Reiniciar panel
sudo supervisorctl restart icecast-admin

# Ver logs del panel
sudo tail -f /var/log/icecast-admin.log

# Reiniciar Icecast2
sudo systemctl restart icecast2

# Ver estado de Icecast2
sudo systemctl status icecast2
```

### Configuración de transmisión

Usa estos datos en tu software de transmisión (OBS, Butt, etc.):

- **Servidor**: Tu IP del servidor
- **Puerto**: 8000 (o el configurado)
- **Usuario**: source
- **Contraseña**: La que configuraste durante la instalación
- **Mountpoint**: /stream

## Resolución de problemas

### El panel no se ve
```bash
# Verificar que nginx esté corriendo
sudo systemctl status nginx

# Verificar que el panel esté corriendo
sudo supervisorctl status icecast-admin

# Ver logs del panel
sudo tail -f /var/log/icecast-admin.log
```

### Icecast no inicia
```bash
# Verificar configuración
sudo icecast2 -c /etc/icecast2/icecast.xml

# Ver logs de Icecast
sudo tail -f /var/log/icecast2/error.log
```

### Problemas de conexión
```bash
# Verificar puertos abiertos
sudo netstat -tlnp | grep -E ':(80|3000|8000)'

# Si usas firewall, verificar reglas
sudo iptables -L
```

## Archivos importantes

- **Panel**: `/opt/icecast-admin/`
- **Config Icecast**: `/etc/icecast2/icecast.xml`
- **Logs panel**: `/var/log/icecast-admin.log`
- **Info instalación**: `/opt/icecast-admin/INSTALL_INFO.md`

## Seguridad

⚠️ **IMPORTANTE**: Después de la instalación:

1. Cambia las contraseñas por defecto
2. Configura SSL/HTTPS si es necesario
3. Restringe acceso mediante firewall si es requerido

## Soporte

Para problemas o mejoras, consulta:
- Logs del sistema en `/var/log/icecast-admin-install.log`
- Info de instalación en `/opt/icecast-admin/INSTALL_INFO.md`
- Documentación del proyecto
