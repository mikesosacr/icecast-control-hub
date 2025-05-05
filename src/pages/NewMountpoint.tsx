
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useMountpointMutations } from "@/hooks/useIcecastApi";
import { MountpointFormHeader } from "@/components/mountpoints/MountpointFormHeader";
import { BasicInfoFields } from "@/components/mountpoints/BasicInfoFields";
import { TechnicalFields } from "@/components/mountpoints/TechnicalFields";
import { ConfigurationFields } from "@/components/mountpoints/ConfigurationFields";
import { FormActions } from "@/components/mountpoints/FormActions";
import { mountpointFormSchema, type MountpointFormValues } from "@/components/mountpoints/MountpointFormSchema";

const NewMountpoint = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createMountpoint, isCreating } = useMountpointMutations();

  const form = useForm<MountpointFormValues>({
    resolver: zodResolver(mountpointFormSchema),
    defaultValues: {
      name: "",
      point: "/",
      description: "",
      genre: "",
      status: "active",
      isPublic: true,
    },
  });

  const onSubmit = (data: MountpointFormValues) => {
    setSubmitError(null);
    
    createMountpoint({
      mountpoint: {
        name: data.name,
        point: data.point,
        description: data.description || "",
        genre: data.genre || "",
        type: "audio/mpeg", // Default value
        bitrate: data.bitrate || 128, // Default if not provided
        sampleRate: data.sampleRate,
        streamUrl: `${data.point}`, // Generated from point
        streamUser: "source", // Default value
        streamPassword: "hackme", // Default value
        listeners: {
          current: 0,
          peak: 0
        },
        status: data.status,
        isPublic: data.isPublic,
        streamStart: new Date().toISOString(),
      }
    }, {
      onSuccess: () => {
        navigate("/mountpoints");
      },
      onError: (error) => {
        setSubmitError(String(error));
      }
    });
  };

  return (
    <>
      <MountpointFormHeader submitError={submitError} />

      <div className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoFields control={form.control} />
            <TechnicalFields control={form.control} />
            <ConfigurationFields control={form.control} />
            <FormActions 
              onCancel={() => navigate("/mountpoints")} 
              isSubmitting={isCreating}
            />
          </form>
        </Form>
      </div>
    </>
  );
};

export default NewMountpoint;
