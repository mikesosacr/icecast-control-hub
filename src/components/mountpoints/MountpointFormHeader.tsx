import { PageHeader } from "@/components/ui/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MountpointFormHeaderProps {
  submitError: string | null;
  isEditing?: boolean;
}

export const MountpointFormHeader = ({ submitError, isEditing }: MountpointFormHeaderProps) => {
  return (
    <>
      <PageHeader
        heading={isEditing ? "Edit Mountpoint" : "Create New Mountpoint"}
        text={isEditing ? "Update your stream mountpoint settings" : "Configure a new stream mountpoint"}
      />
      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
    </>
  );
};
