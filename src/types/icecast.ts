
export interface IcecastServer {
  id: string;
  name: string;
  host: string;
  port: number;
  adminUsername: string;
  adminPassword: string;
  isLocal: boolean;
  status: 'online' | 'offline' | 'warning';
}

export interface MountPoint {
  id: string;
  name: string;
  point: string; // the actual mountpoint path like /stream
  type: 'audio/mpeg' | 'audio/aac' | 'audio/ogg' | string;
  bitrate: number;
  description: string;
  genre: string;
  streamUrl: string;
  listeners: {
    current: number;
    peak: number;
  };
  streamUser: string; // source username
  streamPassword: string; // source password
  isPublic: boolean;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'streamer';
  allowedMountpoints: string[]; // list of mountpoint IDs they can manage
}

export interface Listener {
  id: string;
  ip: string;
  userAgent: string;
  connectedAt: string;
  duration: number; // seconds
  mountpoint: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

export interface ServerStats {
  uptime: number; // seconds
  totalConnections: number;
  connections: {
    current: number;
    peak: number;
  };
  bandwidth: {
    incoming: number; // bytes per second
    outgoing: number; // bytes per second
  };
  cpu: number; // percentage
  memory: number; // bytes
}

export type ServerStatus = 'running' | 'stopped';
