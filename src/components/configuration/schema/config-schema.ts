
import * as z from "zod";

// Define the Mount type schema
export const mountSchema = z.object({
  mountName: z.string().min(1, "Mount name is required"),
  maxListeners: z.coerce.number().int().positive().optional(),
  fallbackMount: z.string().optional(),
});

// Full configuration schema
export const configSchema = z.object({
  server: z.object({
    location: z.string().min(1, "Location is required"),
    admin: z.string().email("Must be a valid email"),
  }),
  limits: z.object({
    clients: z.coerce.number().int().positive().min(1),
    sources: z.coerce.number().int().positive().min(1),
    queueSize: z.coerce.number().int().positive().min(1024),
    clientTimeout: z.coerce.number().int().positive(),
    headerTimeout: z.coerce.number().int().positive(),
    sourceTimeout: z.coerce.number().int().positive(),
  }),
  authentication: z.object({
    sourcePassword: z.string().min(6, "Password must be at least 6 characters"),
    relayPassword: z.string().min(6, "Password must be at least 6 characters"),
    adminUser: z.string().min(3, "Username must be at least 3 characters"),
    adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
  listen: z.object({
    port: z.coerce.number().int().min(1).max(65535),
    bindAddress: z.string().min(1, "Bind address is required"),
  }),
  mountPoints: z.array(mountSchema).optional(),
});

export type ConfigFormValues = z.infer<typeof configSchema>;
