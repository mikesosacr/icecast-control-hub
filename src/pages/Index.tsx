
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, Layers, Radio, Shield, Settings, Music, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('icecast_auth');

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const encoded = btoa(`${credentials.username}:${credentials.password}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encoded}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        localStorage.setItem('icecast_auth', encoded);
        localStorage.setItem('icecast_user', credentials.username);
        setShowLoginDialog(false);
        toast.success('Login successful');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="py-10 container mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3 text-gradient">Bienvenido a Icecast Admin</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Una interfaz moderna para administrar y monitorear tu servidor Icecast2
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <FeatureCard 
            icon={<BarChart2 className="h-8 w-8" />}
            title="Estadísticas en tiempo real"
            description="Monitorea oyentes, uso del ancho de banda y rendimiento del servidor con estadísticas detalladas."
            linkTo="/statistics"
          />
          <FeatureCard 
            icon={<Radio className="h-8 w-8" />}
            title="Gestión de puntos de montaje"
            description="Administra tus streams fácilmente con controles intuitivos para crear, editar y eliminar puntos de montaje."
            linkTo="/mountpoints"
          />
          <FeatureCard 
            icon={<Shield className="h-8 w-8" />}
            title="Control de acceso"
            description="Gestiona usuarios y permisos para mantener tu servidor seguro en todo momento."
            linkTo="/users"
          />
          <FeatureCard 
            icon={<Settings className="h-8 w-8" />}
            title="Configuración avanzada"
            description="Personaliza cada aspecto de tu servidor Icecast2 a través de una interfaz amigable."
            linkTo="/configuration"
          />
          <FeatureCard 
            icon={<Music className="h-8 w-8" />}
            title="Generador de reproductores IA"
            description="Crea reproductores de audio personalizados para tus radios con diseños llamativos generados por IA."
            linkTo="/ai-radio-player"
          />
          <FeatureCard 
            icon={<Layers className="h-8 w-8" />}
            title="Gestión multi-servidor"
            description="Administra múltiples servidores Icecast2 desde una única interfaz centralizada."
            linkTo="/remote-servers"
          />
        </div>

        {/* Call to action */}
        <div className="text-center space-y-4">
          {isLoggedIn ? (
            <Link to="/dashboard">
              <Button size="lg" className="animate-pulse-gentle">
                Ir al Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div className="space-y-4">
              <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="animate-pulse-gentle">
                    <LogIn size={16} className="mr-2" />
                    Iniciar Sesión
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Iniciar Sesión en Icecast Admin</DialogTitle>
                    <DialogDescription>
                      Ingresa tus credenciales de administrador de Icecast para acceder al panel de control
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuario</Label>
                      <Input
                        id="username"
                        value={credentials.username}
                        onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="admin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Ingresa tu contraseña"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleLogin} disabled={isLoading || !credentials.username || !credentials.password}>
                      {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <p className="text-sm text-muted-foreground">
                Necesitas iniciar sesión para acceder al panel de administración
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ icon, title, description, linkTo }) => {
  const isLoggedIn = !!localStorage.getItem('icecast_auth');
  
  if (!isLoggedIn && linkTo !== '/ai-radio-player') {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm opacity-50 cursor-not-allowed h-full">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-2 italic">Requiere autenticación</p>
      </div>
    );
  }

  return (
    <Link to={linkTo} className="block">
      <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
};

export default Index;
