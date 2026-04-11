import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useMountpoint, useMountpointMutations } from "@/hooks/api/useMountpoints";
import { MountpointFormHeader } from "@/components/mountpoints/MountpointFormHeader";
import { BasicInfoFields } from "@/components/mountpoints/BasicInfoFields";
import { TechnicalFields } from "@/components/mountpoints/TechnicalFields";
import { ConfigurationFields } from "@/components/mountpoints/ConfigurationFields";
import { FormActions } from "@/components/mountpoints/FormActions";
import { mountpointFormSchema, type MountpointFormValues } from "@/components/mountpoints/MountpointFormSchema";
import { Skeleton } from "@/components/ui/skeleton";

const EditMountpoint = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { updateMountpoint, isUpdating } = useMountpointMutations();

  const { data: mountpointResponse, isLoading } = useMountpoint('local', id || '');
  const mountpoint = mountpointResponse?.success ? mountpointResponse.data : undefined;

  const form = useForm<MountpointFormValues>({
    resolver: zodResolver(mountpointFormSchema),
    defaultValues: {
      name: "",
      point: "/",
      description: "",
      genre: "",
      contentType: "audio/mpeg",
      status: "active",
      isPublic: true,
    },
  });

  // Rellenar el formulario cuando carguen los datos
  useEffect(() => {
    if (mountpoint) {
      form.reset({
        name: mountpoint.name || "",
        point: mountpoint.point || mountpoint.mount || "/",
        description: mountpoint.description || "",
        genre: mountpoint.genre || "",
        contentType: mountpoint.type || mountpoint.contentType || "audio/mpeg",
        bitrate: mountpoint.bitrate || 128,
        sampleRate: mountpoint.sampleRate,
        status: mountpoint.status === 'active' ? 'active' : 'inactive',
        isPublic: mountpoint.isPublic !== undefined ? mountpoint.isPublic : true,
      });
    }
  }, [mountpoint, form]);

  const onSubmit = (data: MountpointFormValues) => {
    if (!id) return;
    setSubmitError(null);
    updateMountpoint({
      mountpointId: id,
      mountpoint: {
        name: data.name,
        point: data.point,
        description: data.description || "",
        genre: data.genre || "",
        type: data.contentType || "audio/mpeg",
        bitrate: data.bitrate || 128,
        sampleRate: data.sampleRate,
        status: data.status,
        isPublic: data.isPublic,
      }
    });
    navigate("/mountpoints");
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <MountpointFormHeader submitError={submitError} isEditing />
      <div className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoFields control={form.control} />
            <TechnicalFields control={form.control} />
            <ConfigurationFields control={form.control} />
            <FormActions
              onCancel={() => navigate("/mountpoints")}
              isSubmitting={isUpdating}
              isEditing
            />
          </form>
        </Form>
      </div>
    </>
  );
};

export default EditMountpoint;
