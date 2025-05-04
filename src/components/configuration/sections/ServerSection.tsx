
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ConfigFormValues } from "../schema/config-schema";

interface ServerSectionProps {
  form: UseFormReturn<ConfigFormValues>;
}

export const ServerSection = ({ form }: ServerSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="server.location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="Server location" {...field} />
            </FormControl>
            <FormDescription>Physical location of the server</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="server.admin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Admin Email</FormLabel>
            <FormControl>
              <Input placeholder="admin@example.com" type="email" {...field} />
            </FormControl>
            <FormDescription>Contact email for server administrator</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
