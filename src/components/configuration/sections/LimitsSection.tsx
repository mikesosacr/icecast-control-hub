
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ConfigFormValues } from "../schema/config-schema";

interface LimitsSectionProps {
  form: UseFormReturn<ConfigFormValues>;
}

export const LimitsSection = ({ form }: LimitsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="limits.clients"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Max Clients</FormLabel>
            <FormControl>
              <Input placeholder="100" type="number" {...field} />
            </FormControl>
            <FormDescription>Maximum number of connected clients</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="limits.sources"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Max Sources</FormLabel>
            <FormControl>
              <Input placeholder="10" type="number" {...field} />
            </FormControl>
            <FormDescription>Maximum number of source connections</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="limits.queueSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Queue Size</FormLabel>
            <FormControl>
              <Input placeholder="524288" type="number" {...field} />
            </FormControl>
            <FormDescription>Buffer size in bytes</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="limits.clientTimeout"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client Timeout</FormLabel>
            <FormControl>
              <Input placeholder="30" type="number" {...field} />
            </FormControl>
            <FormDescription>Seconds before disconnecting idle clients</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="limits.headerTimeout"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Header Timeout</FormLabel>
            <FormControl>
              <Input placeholder="15" type="number" {...field} />
            </FormControl>
            <FormDescription>Seconds to wait for client headers</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="limits.sourceTimeout"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Source Timeout</FormLabel>
            <FormControl>
              <Input placeholder="10" type="number" {...field} />
            </FormControl>
            <FormDescription>Seconds before dropping inactive sources</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
