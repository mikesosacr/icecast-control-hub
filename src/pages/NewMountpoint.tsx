
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMountpointMutations } from "@/hooks/useIcecastApi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define the form schema using zod
const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  point: z.string().startsWith("/", { message: "Mount point must start with /" }),
  description: z.string().optional(),
  genre: z.string().optional(),
  bitrate: z.coerce.number().min(32, { message: "Minimum bitrate is 32 kbps" }).optional(),
  sampleRate: z.coerce.number().min(8000, { message: "Minimum sample rate is 8000 Hz" }).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  isPublic: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const NewMountpoint = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createMountpoint, isCreating } = useMountpointMutations();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      point: "/",
      description: "",
      genre: "",
      status: "active",
      isPublic: true,
    },
  });

  const onSubmit = (data: FormValues) => {
    setSubmitError(null);
    
    createMountpoint({
      mountpoint: {
        name: data.name,
        point: data.point,
        description: data.description || "",
        genre: data.genre || "",
        bitrate: data.bitrate,
        sampleRate: data.sampleRate,
        status: data.status,
        isPublic: data.isPublic,
        listeners: 0,
        peakListeners: 0,
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

      <div className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Stream" {...field} />
                    </FormControl>
                    <FormDescription>
                      Display name for this mountpoint
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mount Point</FormLabel>
                    <FormControl>
                      <Input placeholder="/stream" {...field} />
                    </FormControl>
                    <FormDescription>
                      Path used to access this stream (must start with /)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Stream description" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="Pop, Rock, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bitrate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitrate (kbps)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="128" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sampleRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sample Rate (Hz)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="44100" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "public")} 
                      defaultValue={field.value ? "public" : "private"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Public mountpoints are visible in directories
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/mountpoints")}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Mountpoint"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default NewMountpoint;
