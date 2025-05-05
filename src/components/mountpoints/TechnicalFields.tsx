
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { z } from "zod";

// Define the form schema fragment for this section
const technicalSchema = z.object({
  genre: z.string().optional(),
  bitrate: z.coerce.number().min(32, { message: "Minimum bitrate is 32 kbps" }).optional(),
  sampleRate: z.coerce.number().min(8000, { message: "Minimum sample rate is 8000 Hz" }).optional(),
});

type TechnicalValues = z.infer<typeof technicalSchema>;

interface TechnicalFieldsProps {
  control: Control<any>;
}

export const TechnicalFields = ({ control }: TechnicalFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
  );
};

export { technicalSchema };
