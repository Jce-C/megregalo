import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { uploadPhoto } from '@/lib/photoApi';

interface UploadZoneProps {
  onPhotoUploaded?: (photoUrl: string) => void;
}

export default function UploadZone({ onPhotoUploaded }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Validar tamaño de archivo (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande (máximo 10MB)');
      }
      
      // Usar nuevo sistema de upload con compresión automática
      return await uploadPhoto(file);
    },
    onSuccess: (data) => {
      toast({
        title: "Foto subida exitosamente",
        description: "Tu foto ahora aparecerá en la cascada ♡",
      });
      onPhotoUploaded?.(data.url);
      // Invalidar cache para que se recarguen las fotos
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir foto",
        description: error.message || "Por favor intenta de nuevo",
        variant: "destructive",
      });
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        uploadMutation.mutate(file);
      } else {
        toast({
          title: "Archivo no válido",
          description: "Solo se permiten archivos de imagen",
          variant: "destructive",
        });
      }
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-5 right-5 w-8 h-8 bg-black bg-opacity-60 border border-neon-pink rounded-full flex items-center justify-center z-[1001] hover:bg-opacity-80 transition-all"
        data-testid="toggle-upload-zone"
        title={isVisible ? 'Ocultar zona de upload' : 'Mostrar zona de upload'}
      >
        <span className="text-neon-pink text-lg">
          {isVisible ? '✕' : '📷'}
        </span>
      </button>

      {/* Upload zone - conditionally visible */}
      {isVisible && (
        <div
          className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="upload-zone"
        >
          <div className="text-2xl">
            {uploadMutation.isPending ? '⏳' : '📷'}
          </div>
          <div className="upload-text">
            {uploadMutation.isPending ? 'Subiendo...' : 'Arrastra fotos aquí'}
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        data-testid="file-input"
      />
    </>
  );
}
