
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ConfigFormValues } from "../schema/config-schema";
import { Button } from "@/components/ui/button";
import { FormDescription } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface MountPointsSectionProps {
  form: UseFormReturn<ConfigFormValues>;
}

export const MountPointsSection = ({ form }: MountPointsSectionProps) => {
  const { fields, append, remove } = form.useFieldArray({
    name: "mountPoints",
  });

  const addMountPoint = () => {
    append({
      mountName: "/stream",
      maxListeners: undefined,
      fallbackMount: undefined,
    });
  };

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-md">
          <p className="text-sm text-muted-foreground mb-4">
            No mount points configured. Mount points define the endpoints where streams can be published and accessed.
          </p>
          <Button type="button" onClick={addMountPoint}>
            <Plus className="w-4 h-4 mr-2" /> Add Mount Point
          </Button>
        </div>
      ) : (
        <>
          <FormDescription>
            Configure mount points for your Icecast server. Each mount point represents a stream that can be accessed
            by listeners.
          </FormDescription>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`mountPoints.${index}.mountName`}>Mount Point Path</Label>
                      <Input
                        id={`mountPoints.${index}.mountName`}
                        {...form.register(`mountPoints.${index}.mountName`)}
                        placeholder="/stream"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`mountPoints.${index}.maxListeners`}>Maximum Listeners</Label>
                        <Input
                          id={`mountPoints.${index}.maxListeners`}
                          type="number"
                          {...form.register(`mountPoints.${index}.maxListeners`, { valueAsNumber: true })}
                          placeholder="Optional"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor={`mountPoints.${index}.fallbackMount`}>Fallback Mount</Label>
                        <Input
                          id={`mountPoints.${index}.fallbackMount`}
                          {...form.register(`mountPoints.${index}.fallbackMount`)}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-4">
            <Button type="button" variant="outline" onClick={addMountPoint}>
              <Plus className="w-4 h-4 mr-2" /> Add Another Mount Point
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
