
# Instalador del Panel de Administración Icecast2

Este directorio contiene el script de instalación para configurar el Panel de Administración Icecast2 en un VPS con Ubuntu.

## Instrucciones de Instalación

### Requisitos Previos

- Un servidor Ubuntu limpio (18.04, 20.04 o 22.04)
- Acceso root o sudo
- Puertos abiertos: 80 (HTTP), 8000 (Icecast)

### Pasos de Instalación

1. Conéctate a tu VPS Ubuntu mediante SSH
2. Sube el script `install-icecast.sh` a tu servidor
3. Haz el script ejecutable:
   ```
   chmod +x install-icecast.sh
   ```
4. Ejecuta el instalador:
   ```
   sudo ./install-icecast.sh
   ```
5. Sigue las instrucciones en pantalla

### Después de la Instalación

- El servidor Icecast2 estará accesible en: `http://TU_IP_SERVIDOR:8000`
- El panel de administración estará accesible en: `http://TU_IP_SERVIDOR`
- Credenciales de administrador por defecto:
  - Usuario: `admin`
  - Contraseña: `hackme`

## Notas Importantes de Seguridad

- **Cambia las contraseñas por defecto** inmediatamente después de la instalación
- Considera configurar SSL/TLS para conexiones seguras
- Restringe el acceso a tu servidor usando un firewall

## Solución de Problemas

- Consulta el registro de instalación en: `/var/log/icecast-admin-install.log`
- Los logs de Icecast2 están ubicados en: `/var/log/icecast2/`
- Los logs del Panel están ubicados en: `/var/log/icecast-admin.log`

## Iniciar/Detener Manualmente

- Servidor Icecast2:
  ```
  sudo systemctl start/stop/restart icecast2
  ```
- Servidor API del Panel:
  ```
  sudo supervisorctl start/stop/restart icecast-admin
  ```

## Sincronización con GitHub

Para instrucciones sobre cómo sincronizar con tu repositorio de GitHub, consulta el archivo `GITHUB_SYNC.md` creado durante la instalación.
