
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { Loader2, Wand2, Settings } from "lucide-react";
import { FormData } from "./types";
import { playerStyles, layoutOptions, fontOptions } from "./constants";

interface ConfigurationFormProps {
  form: UseFormReturn<FormData>;
  onSubmit: (data: FormData) => void;
  isGenerating: boolean;
  activeStyleCategory: string;
  setActiveStyleCategory: (category: string) => void;
}

export const ConfigurationForm = ({ 
  form, 
  onSubmit, 
  isGenerating, 
  activeStyleCategory, 
  setActiveStyleCategory 
}: ConfigurationFormProps) => {
  const filteredStyles = activeStyleCategory === "all" 
    ? playerStyles 
    : playerStyles.filter(style => style.category === activeStyleCategory);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Configuración del Reproductor
        </CardTitle>
        <CardDescription>
          Personaliza todos los aspectos de tu reproductor de radio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="radioName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Radio</FormLabel>
                    <FormControl>
                      <Input placeholder="Mi Radio Online" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="layout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diseño</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un diseño" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {layoutOptions.map(layout => (
                          <SelectItem key={layout.id} value={layout.id}>
                            <div>
                              <div className="font-medium">{layout.name}</div>
                              <div className="text-xs text-muted-foreground">{layout.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Música las 24 horas del día" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Style Selection Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <FormLabel className="text-base font-semibold">Estilo del Reproductor</FormLabel>
                <div className="flex flex-wrap gap-1">
                  {["all", "basic", "premium", "themed", "luna"].map(category => (
                    <Button
                      key={category}
                      type="button"
                      variant={activeStyleCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveStyleCategory(category)}
                      className="text-xs"
                    >
                      {category === "all" ? "Todos" : 
                       category === "basic" ? "Básicos" :
                       category === "premium" ? "Premium" : 
                       category === "themed" ? "Temáticos" : "Luna"}
                    </Button>
                  ))}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredStyles.map(style => (
                        <div key={style.id} className="text-center">
                          <FormControl>
                            <button
                              type="button"
                              className={`w-full h-20 rounded-xl border-2 transition-all text-xs font-medium relative overflow-hidden ${
                                field.value === style.id
                                  ? "border-primary ring-2 ring-primary ring-opacity-50 scale-105"
                                  : "border-muted hover:border-muted-foreground/50 hover:scale-102"
                              } ${style.preview}`}
                              onClick={() => field.onChange(style.id)}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center p-2">
                                  <div className="font-semibold">{style.name}</div>
                                </div>
                              </div>
                            </button>
                          </FormControl>
                          <div className="mt-2">
                            <div className="text-sm font-medium">{style.name}</div>
                            <div className="text-xs text-muted-foreground">{style.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <FormLabel className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Características
              </FormLabel>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="showVisualizer"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <FormLabel className="text-sm">Visualizador</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="showVolume"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <FormLabel className="text-sm">Control de Volumen</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="showProgress"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <FormLabel className="text-sm">Barra de Progreso</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="showPlaylist"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <FormLabel className="text-sm">Lista de Reproducción</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Primario</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-12 h-10 p-1 border" />
                        <Input {...field} placeholder="#3b82f6" className="flex-1" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Secundario</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-12 h-10 p-1 border" />
                        <Input {...field} placeholder="#8b5cf6" className="flex-1" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fontOptions.map(font => (
                          <SelectItem key={font.id} value={font.id}>
                            <div>
                              <div className="font-medium">{font.name}</div>
                              <div className="text-xs text-muted-foreground">{font.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando reproductor personalizado...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generar Reproductor con IA
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
