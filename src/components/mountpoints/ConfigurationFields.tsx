
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { z } from "zod";

// Define the form schema fragment for this section
const configurationSchema = z.object({
  status: z.enum(["active", "inactive"]).default("active"),
  isPublic: z.boolean().default(true),
});

type ConfigurationValues = z.infer<typeof configurationSchema>;

interface ConfigurationFieldsProps {
  control: Control<any>;
}

export const ConfigurationFields = ({ control }: ConfigurationFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
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
        control={control}
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
  );
};

export { configurationSchema };
