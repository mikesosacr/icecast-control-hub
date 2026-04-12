import { MountPoint } from "@/types/icecast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Edit, Trash, Eye, EyeOff, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface MountpointCardProps {
  mountpoint: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, isPublic: boolean) => void;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copiado`);
  };
  return (
    <div className="flex items-center justify-between py-1 border-b border-dashed border-muted last:border-0">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-xs font-mono flex-1 truncate px-2">{value}</span>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={handleCopy}>
        <Copy size={12} />
      </Button>
    </div>
  );
}

export function MountpointCard({
  mountpoint,
  onEdit,
  onDelete,
  onToggleVisibility
}: MountpointCardProps) {
  const [showEncoder, setShowEncoder] = useState(false);
  const encoder = mountpoint.encoderInfo;

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
            <Badge variant={mountpoint.status === 'active' ? 'default' : 'destructive'}
              className={cn(mountpoint.status === 'active' && "bg-green-500 hover:bg-green-500/90")}>
              {mountpoint.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        <CardDescription className="flex items-center gap-1">
          <span className="font-mono text-xs">{mountpoint.point || mountpoint.mount}</span>
          <span className="text-muted-foreground">•</span>
          <span>{mountpoint.type || mountpoint.contentType || 'audio/mpeg'}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">Bitrate</div>
          <div className="font-medium">{mountpoint.bitrate} kbps</div>
          <div className="text-muted-foreground">Genre</div>
          <div className="font-medium">{mountpoint.genre || "—"}</div>
          <div className="text-muted-foreground">Listeners</div>
          <div className="font-medium">{mountpoint?.listeners?.current ?? 0} / peak {mountpoint?.listeners?.peak ?? 0}</div>
          <div className="text-muted-foreground">Visibility</div>
          <div className="font-medium">{mountpoint.isPublic ? 'Public' : 'Private'}</div>
        </div>

        <div className="mt-3">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowEncoder(!showEncoder)}>
            {showEncoder ? <ChevronUp size={12} className="mr-1" /> : <ChevronDown size={12} className="mr-1" />}
            Encoder Info
          </Button>

          {showEncoder && (
            <div className="mt-2 p-2 bg-muted/50 rounded-md border">
              {encoder ? (
                <>
                  <CopyField label="Host / IP" value={encoder.host || '129.146.17.95'} />
                  <CopyField label="Puerto" value={String(encoder.port || 8000)} />
                  <CopyField label="Mountpoint" value={encoder.mount || mountpoint.point} />
                  <CopyField label="Usuario" value={encoder.username || 'source'} />
                  <CopyField label="Contraseña" value={encoder.password || mountpoint.streamPassword || '—'} />
                  <CopyField label="Protocolo" value={encoder.protocol || 'Icecast2'} />
                  <CopyField label="Stream URL" value={encoder.streamUrl || `http://${encoder.host}:${encoder.port}${encoder.mount}`} />
                </>
              ) : (
                <>
                  <CopyField label="Host / IP" value="129.146.17.95" />
                  <CopyField label="Puerto" value="8000" />
                  <CopyField label="Mountpoint" value={mountpoint.point || mountpoint.mount || '—'} />
                  <CopyField label="Usuario" value={mountpoint.streamUser || 'source'} />
                  <CopyField label="Contraseña" value={mountpoint.streamPassword || '—'} />
                  <CopyField label="Protocolo" value="Icecast2" />
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 pt-3">
        <div className="flex items-center justify-between w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onToggleVisibility(mountpoint.id, !mountpoint.isPublic)}>
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
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(mountpoint.id)}>
              <Trash size={16} />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
