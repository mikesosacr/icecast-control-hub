
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateCredentials } from "@/services/api/auth";
import { ShieldAlert } from "lucide-react";

interface ChangeCredentialsDialogProps {
  open: boolean;
  onComplete: () => void;
}

export const ChangeCredentialsDialog = ({ open, onComplete }: ChangeCredentialsDialogProps) => {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });

  const handleSave = () => {
    if (!form.username || form.username.length < 3) {
      toast.error('El usuario debe tener al menos 3 caracteres');
      return;
    }
    if (!form.password || form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (form.username === 'admin' && form.password === 'admin') {
      toast.error('Elige credenciales diferentes a las predeterminadas');
      return;
    }

    updateCredentials(form.username, form.password);
    localStorage.setItem('icecast_auth', btoa(`${form.username}:${form.password}`));
    localStorage.setItem('icecast_user', form.username);
    toast.success('Credenciales actualizadas correctamente');
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[420px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <DialogTitle>Cambiar credenciales predeterminadas</DialogTitle>
          </div>
          <DialogDescription>
            Estás usando las credenciales por defecto. Por seguridad, crea un nuevo usuario y contraseña.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-username">Nuevo usuario</Label>
            <Input
              id="new-username"
              value={form.username}
              onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Tu nuevo usuario"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <Input
              id="new-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Repite la contraseña"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={!form.username || !form.password || !form.confirmPassword}>
            Guardar y continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
