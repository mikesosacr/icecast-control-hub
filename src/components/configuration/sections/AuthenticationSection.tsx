
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ConfigFormValues } from "../schema/config-schema";

interface AuthenticationSectionProps {
  form: UseFormReturn<ConfigFormValues>;
}

export const AuthenticationSection = ({ form }: AuthenticationSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="authentication.adminUser"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Admin Username</FormLabel>
            <FormControl>
              <Input placeholder="admin" {...field} />
            </FormControl>
            <FormDescription>Web interface admin username</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="authentication.adminPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Admin Password</FormLabel>
            <FormControl>
              <Input placeholder="password" type="password" {...field} />
            </FormControl>
            <FormDescription>Web interface admin password</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="authentication.sourcePassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Source Password</FormLabel>
            <FormControl>
              <Input placeholder="password" type="password" {...field} />
            </FormControl>
            <FormDescription>Password for source clients</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="authentication.relayPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Relay Password</FormLabel>
            <FormControl>
              <Input placeholder="password" type="password" {...field} />
            </FormControl>
            <FormDescription>Password for relay sources</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
