
import { MountPoint } from "@/types/icecast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Edit, Trash, Eye, EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MountpointCardProps {
  mountpoint: MountPoint;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isPublic: boolean) => void;
}

export function MountpointCard({ 
  mountpoint, 
  onEdit, 
  onDelete,
  onToggleVisibility 
}: MountpointCardProps) {
  return (
    <Card className="mountpoint-card overflow-hidden">
      <CardHeader className={cn(
        "pb-2",
        mountpoint.status === 'active' ? "border-l-4 border-icecast-success" : "border-l-4 border-icecast-danger"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Radio size={14} className="text-primary" />
            </div>
            <CardTitle>{mountpoint.name}</CardTitle>
          </div>
          <div>
            <Badge variant={mountpoint.status === 'active' ? 'default' : 'destructive'}>
              {mountpoint.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        <CardDescription className="flex items-center gap-1">
          <span className="font-mono text-xs">{mountpoint.point}</span>
          <span className="text-muted-foreground">•</span>
          <span>{mountpoint.type}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Bitrate</div>
          <div className="font-medium">{mountpoint.bitrate} kbps</div>
          
          <div className="text-muted-foreground">Genre</div>
          <div className="font-medium">{mountpoint.genre || "—"}</div>
          
          <div className="text-muted-foreground">Current Listeners</div>
          <div className="font-medium">{mountpoint.listeners.current}</div>
          
          <div className="text-muted-foreground">Peak Listeners</div>
          <div className="font-medium">{mountpoint.listeners.peak}</div>

          <div className="text-muted-foreground">Visibility</div>
          <div className="font-medium">{mountpoint.isPublic ? 'Public' : 'Private'}</div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 pt-3">
        <div className="flex items-center justify-between w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleVisibility(mountpoint.id, !mountpoint.isPublic)}
                >
                  {mountpoint.isPublic ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {mountpoint.isPublic ? 'Set to private' : 'Set to public'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => onEdit(mountpoint.id)}>
              <Edit size={16} />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(mountpoint.id)}>
              <Trash size={16} />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
