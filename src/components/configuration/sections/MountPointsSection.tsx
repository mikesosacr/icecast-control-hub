
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ConfigFormValues } from "../schema/config-schema";

interface MountPointsSectionProps {
  form: UseFormReturn<ConfigFormValues>;
}

export const MountPointsSection = ({ form }: MountPointsSectionProps) => {
  // This is a placeholder for future implementation of mount points management
  // For now we're not adding UI for this since it's not critical for the refactoring
  return (
    <div className="py-2">
      <p className="text-sm text-muted-foreground">
        Mount points can be configured in the XML editor for now.
      </p>
    </div>
  );
};
