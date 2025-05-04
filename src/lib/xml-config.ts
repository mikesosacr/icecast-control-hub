
import { xmlToJson, jsonToXml } from './xml-utils';

interface Mount {
  mountName: string;
  maxListeners?: number;
  fallbackMount?: string;
}

export interface IcecastConfig {
  server: {
    location: string;
    admin: string;
  };
  limits: {
    clients: number;
    sources: number;
    queueSize: number;
    clientTimeout: number;
    headerTimeout: number;
    sourceTimeout: number;
  };
  authentication: {
    sourcePassword: string;
    relayPassword: string;
    adminUser: string;
    adminPassword: string;
  };
  listen: {
    port: number;
    bindAddress: string;
  };
  mountPoints?: Mount[];
}

export function parseXmlToConfig(xmlString: string): IcecastConfig {
  try {
    // Basic parsing, in a real implementation you would use a proper XML parser
    const parseSimpleValue = (xml: string, tag: string): string => {
      const regex = new RegExp(`<${tag}>([^<]+)</${tag}>`, 'i');
      const match = xml.match(regex);
      return match ? match[1] : '';
    };
    
    const parseNumberValue = (xml: string, tag: string): number => {
      const value = parseSimpleValue(xml, tag);
      return value ? parseInt(value, 10) : 0;
    };
    
    // Parse mount points
    const parseMounts = (xml: string): Mount[] => {
      const mounts: Mount[] = [];
      const mountRegex = /<mount>([\s\S]*?)<\/mount>/g;
      let mountMatch;
      
      while ((mountMatch = mountRegex.exec(xml)) !== null) {
        const mountXml = mountMatch[1];
        const mount: Mount = {
          mountName: parseSimpleValue(mountXml, 'mount-name'),
          maxListeners: parseInt(parseSimpleValue(mountXml, 'max-listeners'), 10) || undefined,
          fallbackMount: parseSimpleValue(mountXml, 'fallback-mount') || undefined,
        };
        mounts.push(mount);
      }
      
      return mounts;
    };
    
    return {
      server: {
        location: parseSimpleValue(xmlString, 'location'),
        admin: parseSimpleValue(xmlString, 'admin'),
      },
      limits: {
        clients: parseNumberValue(xmlString, 'clients'),
        sources: parseNumberValue(xmlString, 'sources'),
        queueSize: parseNumberValue(xmlString, 'queue-size'),
        clientTimeout: parseNumberValue(xmlString, 'client-timeout'),
        headerTimeout: parseNumberValue(xmlString, 'header-timeout'),
        sourceTimeout: parseNumberValue(xmlString, 'source-timeout'),
      },
      authentication: {
        sourcePassword: parseSimpleValue(xmlString, 'source-password'),
        relayPassword: parseSimpleValue(xmlString, 'relay-password'),
        adminUser: parseSimpleValue(xmlString, 'admin-user'),
        adminPassword: parseSimpleValue(xmlString, 'admin-password'),
      },
      listen: {
        port: parseNumberValue(xmlString, 'port'),
        bindAddress: parseSimpleValue(xmlString, 'bind-address'),
      },
      mountPoints: parseMounts(xmlString),
    };
  } catch (error) {
    console.error("Error parsing XML config:", error);
    // Return default values if parsing fails
    return {
      server: { location: "Earth", admin: "admin@example.com" },
      limits: { 
        clients: 100, 
        sources: 10, 
        queueSize: 524288,
        clientTimeout: 30,
        headerTimeout: 15,
        sourceTimeout: 10
      },
      authentication: {
        sourcePassword: "hackme",
        relayPassword: "hackme",
        adminUser: "admin",
        adminPassword: "hackme"
      },
      listen: { port: 8000, bindAddress: "127.0.0.1" }
    };
  }
}

export function configToXml(config: IcecastConfig): string {
  try {
    let xml = `<icecast>\n`;
    
    // Server section
    xml += `  <location>${config.server.location}</location>\n`;
    xml += `  <admin>${config.server.admin}</admin>\n`;
    
    // Limits section
    xml += `  <limits>\n`;
    xml += `    <clients>${config.limits.clients}</clients>\n`;
    xml += `    <sources>${config.limits.sources}</sources>\n`;
    xml += `    <queue-size>${config.limits.queueSize}</queue-size>\n`;
    xml += `    <client-timeout>${config.limits.clientTimeout}</client-timeout>\n`;
    xml += `    <header-timeout>${config.limits.headerTimeout}</header-timeout>\n`;
    xml += `    <source-timeout>${config.limits.sourceTimeout}</source-timeout>\n`;
    xml += `  </limits>\n`;
    
    // Authentication section
    xml += `  <authentication>\n`;
    xml += `    <source-password>${config.authentication.sourcePassword}</source-password>\n`;
    xml += `    <relay-password>${config.authentication.relayPassword}</relay-password>\n`;
    xml += `    <admin-user>${config.authentication.adminUser}</admin-user>\n`;
    xml += `    <admin-password>${config.authentication.adminPassword}</admin-password>\n`;
    xml += `  </authentication>\n`;
    
    // Listen socket
    xml += `  <listen-socket>\n`;
    xml += `    <port>${config.listen.port}</port>\n`;
    xml += `    <bind-address>${config.listen.bindAddress}</bind-address>\n`;
    xml += `  </listen-socket>\n`;
    
    // Mount points
    if (config.mountPoints && config.mountPoints.length > 0) {
      config.mountPoints.forEach(mount => {
        xml += `  <mount>\n`;
        xml += `    <mount-name>${mount.mountName}</mount-name>\n`;
        if (mount.maxListeners) {
          xml += `    <max-listeners>${mount.maxListeners}</max-listeners>\n`;
        }
        if (mount.fallbackMount) {
          xml += `    <fallback-mount>${mount.fallbackMount}</fallback-mount>\n`;
        }
        xml += `  </mount>\n`;
      });
    }
    
    xml += `</icecast>`;
    return xml;
  } catch (error) {
    console.error("Error generating XML:", error);
    throw error;
  }
}

// In a real implementation, this would use an actual XML parser/generator
export const xmlToJson = (xml: string): Record<string, any> => {
  // This is a simplified placeholder - a real app would use a proper XML parser
  return {};
};

export const jsonToXml = (json: Record<string, any>): string => {
  // This is a simplified placeholder - a real app would use a proper XML generator
  return "";
};
