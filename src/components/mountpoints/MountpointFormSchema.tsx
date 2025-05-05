
import { z } from "zod";
import { basicInfoSchema } from "./BasicInfoFields";
import { technicalSchema } from "./TechnicalFields";
import { configurationSchema } from "./ConfigurationFields";

// Combine all schema fragments
export const mountpointFormSchema = z.object({
  ...basicInfoSchema.shape,
  ...technicalSchema.shape,
  ...configurationSchema.shape,
});

export type MountpointFormValues = z.infer<typeof mountpointFormSchema>;
