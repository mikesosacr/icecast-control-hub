
import { PageHeader } from "@/components/ui/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MountpointFormHeaderProps {
  submitError: string | null;
}

export const MountpointFormHeader = ({ submitError }: MountpointFormHeaderProps) => {
  return (
    <>
      <PageHeader 
        heading="Create New Mountpoint" 
        text="Configure a new stream mountpoint"
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
