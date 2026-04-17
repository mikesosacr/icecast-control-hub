
import * as z from "zod";

export const formSchema = z.object({
  radioName: z.string().min(2, {
    message: "El nombre de la radio debe tener al menos 2 caracteres.",
  }),
  description: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  style: z.enum(["minimal", "modernista", "retro", "neón", "glassmorphism", "compact", "premium", "vintage", "luna-dark", "luna-light", "luna-gradient", "luna-glass"]),
  layout: z.enum(["horizontal", "vertical", "card", "mini"]),
  showVisualizer: z.boolean().optional(),
  showPlaylist: z.boolean().optional(),
  showVolume: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  fontFamily: z.enum(["inter", "roboto", "poppins", "montserrat"]).optional(),
  backgroundImage: z.string().optional(),
  logoImage: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;

export interface PlayerStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
}

export interface LayoutOption {
  id: string;
  name: string;
  description: string;
}

export interface FontOption {
  id: string;
  name: string;
  description: string;
}

export interface GeneratedPlayer {
  id: number;
  type: string;
  timestamp: string;
  radioName: string;
  description?: string;
  style: string;
  layout: string;
  showVisualizer?: boolean;
  showPlaylist?: boolean;
  showVolume?: boolean;
  showProgress?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  backgroundImage?: string;
  logoImage?: string;
}
