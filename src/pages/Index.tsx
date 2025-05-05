
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, Layers, Radio, Shield, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
        </div>

        {/* Call to action */}
        <div className="text-center">
          <Link to="/dashboard">
            <Button size="lg" className="animate-pulse-gentle">
              Ir al Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ icon, title, description, linkTo }) => {
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
