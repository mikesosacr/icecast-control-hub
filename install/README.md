# Icecast Control Hub - Instalación VPS

## Instalación rápida

```bash
curl -sSL https://raw.githubusercontent.com/mikesosacr/icecast-control-hub/main/install/install.sh | bash
```

## Actualizar

```bash
sudo /usr/local/bin/update-icecast-hub
```

## Desinstalar

```bash
sudo bash /opt/icecast-control-hub/install/uninstall.sh
```

## Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend (Nginx) | 80 | Panel de administración |
| Backend API | 3000 | API REST |
| Icecast2 | 8000 | Servidor de streaming |

## Credenciales por defecto

- **Usuario**: admin
- **Contraseña**: hackme

⚠️ Cambia las credenciales después de la instalación.

## Comandos útiles

```bash
# Estado de servicios
sudo systemctl status icecast2 icecast-control-hub nginx

# Logs del backend
sudo journalctl -u icecast-control-hub -f

# Actualización manual
sudo /usr/local/bin/update-icecast-hub

# Habilitar actualizaciones automáticas diarias
sudo systemctl enable --now icecast-hub-update.timer
```
