
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { z } from "zod";

// Define the form schema fragment for this section
const basicInfoSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  point: z.string().startsWith("/", { message: "Mount point must start with /" }),
  description: z.string().optional(),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

interface BasicInfoFieldsProps {
  control: Control<any>;
}

export const BasicInfoFields = ({ control }: BasicInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
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
          control={control}
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
        control={control}
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
    </>
  );
};

export { basicInfoSchema };
