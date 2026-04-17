
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export const ImageUpload = ({ label, value, onChange, placeholder }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor selecciona solo archivos de imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      toast.success("Imagen cargada correctamente");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {value ? (
        <div className="relative group">
          <div className="w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden">
            <img 
              src={value} 
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={removeImage}
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div
          className={`w-full h-32 rounded-lg border-2 border-dashed transition-colors cursor-pointer
            ${isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Image size={32} className="mb-2" />
            <p className="text-sm text-center">
              {placeholder || "Arrastra una imagen aquí o haz clic para seleccionar"}
            </p>
            <p className="text-xs mt-1">PNG, JPG hasta 5MB</p>
          </div>
        </div>
      )}
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};
