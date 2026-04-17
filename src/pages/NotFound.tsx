
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/50">
      <div className="text-center px-6">
        <div className="relative mb-8 inline-block">
          <div className="h-24 w-24 text-primary">
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M25 5C14.5 5 6 13.5 6 24V45H18V24C18 20.1 21.1 17 25 17C28.9 17 32 20.1 32 24V45H44V24C44 13.5 35.5 5 25 5Z" 
                fill="currentColor" 
              />
              <path 
                d="M36 28C33.8 28 32 29.8 32 32V45H40V32C40 29.8 38.2 28 36 28Z" 
                fill="#33A3FF" 
              />
              <path 
                d="M14 28C11.8 28 10 29.8 10 32V45H18V32C18 29.8 16.2 28 14 28Z" 
                fill="#33A3FF" 
              />
            </svg>
          </div>
          <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-background text-destructive text-2xl font-bold h-8 w-8 rounded-full flex items-center justify-center border-2 border-current">
            !
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">404 - Página no encontrada</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          La página que estás buscando no existe o ha sido trasladada a otra dirección.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">Ir al Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/mountpoints">Ver Mountpoints</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
