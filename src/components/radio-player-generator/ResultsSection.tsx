
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Copy, Download, Palette } from "lucide-react";
import { toast } from "sonner";
import { PlayerPreview } from "./PlayerPreview";
import { GeneratedPlayer } from "./types";

interface ResultsSectionProps {
  generatedPlayers: GeneratedPlayer[];
  selectedPlayer: GeneratedPlayer | null;
  generatedCode: string;
  copyCode: () => void;
  exportPlayer: () => void;
}

export const ResultsSection = ({ 
  generatedPlayers, 
  selectedPlayer, 
  generatedCode, 
  copyCode, 
  exportPlayer 
}: ResultsSectionProps) => {
  if (generatedPlayers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>
            Aquí aparecerán los reproductores generados por la IA
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Music size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">Ningún reproductor generado</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Completa la configuración y haz clic en "Generar Reproductor" para crear un diseño personalizado con IA
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="preview" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        <TabsTrigger value="code">Código</TabsTrigger>
        <TabsTrigger value="export">Exportar</TabsTrigger>
      </TabsList>
      
      <TabsContent value="preview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reproductor Generado</CardTitle>
            <CardDescription>
              Vista previa interactiva del reproductor generado con IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPlayer && (
              <PlayerPreview 
                style={selectedPlayer.style}
                radioName={selectedPlayer.radioName}
                layout={selectedPlayer.layout}
                showVisualizer={selectedPlayer.showVisualizer}
                showVolume={selectedPlayer.showVolume}
                showProgress={selectedPlayer.showProgress}
                description={selectedPlayer.description}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Generado: {selectedPlayer && new Date(selectedPlayer.timestamp).toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyCode}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
              <Button onClick={exportPlayer}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="code">
        <Card>
          <CardHeader>
            <CardTitle>Código del Reproductor</CardTitle>
            <CardDescription>
              Código React completo y optimizado para tu reproductor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-xs max-h-96 scrollbar-modern">
                <code>{generatedCode}</code>
              </pre>
              <Button 
                size="sm" 
                variant="secondary" 
                className="absolute top-2 right-2"
                onClick={copyCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="export">
        <Card>
          <CardHeader>
            <CardTitle>Opciones de Exportación</CardTitle>
            <CardDescription>
              Exporta tu reproductor en diferentes formatos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={exportPlayer} className="h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Componente React</div>
                  <div className="text-sm text-muted-foreground">Archivo .jsx listo para usar</div>
                </div>
              </Button>
              
              <Button variant="outline" onClick={() => toast.info("Próximamente disponible")} className="h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">HTML + CSS</div>
                  <div className="text-sm text-muted-foreground">Código HTML independiente</div>
                </div>
              </Button>
              
              <Button variant="outline" onClick={() => toast.info("Próximamente disponible")} className="h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">WordPress Plugin</div>
                  <div className="text-sm text-muted-foreground">Plugin para WordPress</div>
                </div>
              </Button>
              
              <Button variant="outline" onClick={() => toast.info("Próximamente disponible")} className="h-auto p-4">
                <div className="text-left">
                  <div className="font-medium">Embed Code</div>
                  <div className="text-sm text-muted-foreground">Código iframe embebido</div>
                </div>
              </Button>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Instrucciones de Instalación</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Descarga el archivo del reproductor</li>
                <li>Importa el componente en tu proyecto React</li>
                <li>Configura la URL de tu stream de Icecast</li>
                <li>Personaliza los estilos según tus necesidades</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
