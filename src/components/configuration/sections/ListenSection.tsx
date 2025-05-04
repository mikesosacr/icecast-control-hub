
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ConfigFormValues } from "../schema/config-schema";

interface ListenSectionProps {
  form: UseFormReturn<ConfigFormValues>;
}

export const ListenSection = ({ form }: ListenSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="listen.port"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Port</FormLabel>
            <FormControl>
              <Input placeholder="8000" type="number" {...field} />
            </FormControl>
            <FormDescription>Port that Icecast will listen on</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="listen.bindAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bind Address</FormLabel>
            <FormControl>
              <Input placeholder="127.0.0.1" {...field} />
            </FormControl>
            <FormDescription>IP address to bind to (leave as 127.0.0.1 for localhost only)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
