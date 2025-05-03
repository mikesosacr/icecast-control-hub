
# Icecast2 Panel Installer

This directory contains the installation script for setting up the Icecast2 Panel on an Ubuntu VPS.

## Installation Instructions

### Prerequisites

- A clean Ubuntu server (18.04, 20.04, or 22.04)
- Root or sudo access
- Open ports: 80 (HTTP), 8000 (Icecast)

### Installation Steps

1. SSH into your Ubuntu VPS
2. Upload the `ubuntu-setup.sh` script to your server
3. Make the script executable:
   ```
   chmod +x ubuntu-setup.sh
   ```
4. Run the installer:
   ```
   sudo ./ubuntu-setup.sh
   ```
5. Follow the on-screen instructions

### After Installation

- The Icecast2 server will be accessible at: `http://YOUR_SERVER_IP:8000`
- The admin panel will be accessible at: `http://YOUR_SERVER_IP`
- Default admin credentials:
  - Username: `admin`
  - Password: `hackme`

## Important Security Notes

- **Change default passwords** immediately after installation
- Consider setting up SSL/TLS for secure connections
- Restrict access to your server using a firewall

## Troubleshooting

- Check the installation log at: `/var/log/icecast-panel-install.log`
- Icecast2 logs are located at: `/var/log/icecast2/`
- Panel logs are located at: `/var/log/icecast-panel.log`

## Manual Start/Stop

- Icecast2 server:
  ```
  sudo systemctl start/stop/restart icecast2
  ```
- Panel API server:
  ```
  sudo supervisorctl start/stop/restart icecast-panel
  ```
