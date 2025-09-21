// Sistema de almacenamiento local para fotos que reemplaza el backend
export interface LocalPhoto {
  id: string;
  filename: string;
  url: string; // data URL en base64
  uploadedAt: Date;
}

const STORAGE_KEY = 'cascade-photos';

// Comprimir imagen para optimizar almacenamiento
const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convertir a base64 comprimido
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.onerror = reject;
    
    // Cargar imagen original
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Convertir archivo a base64 (mantenemos para compatibilidad)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Generar ID único
const generateId = () => `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Obtener todas las fotos del localStorage
export const getLocalPhotos = (): LocalPhoto[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const photos = JSON.parse(stored);
    // Convertir uploadedAt string a Date
    return photos.map((photo: any) => ({
      ...photo,
      uploadedAt: new Date(photo.uploadedAt)
    }));
  } catch (error) {
    console.error('Error loading photos from localStorage:', error);
    return [];
  }
};

// Guardar fotos en localStorage
const savePhotos = (photos: LocalPhoto[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch (error) {
    console.error('Error saving photos to localStorage:', error);
    throw new Error('No se pudo guardar la foto');
  }
};

// Agregar una nueva foto
export const addLocalPhoto = async (file: File): Promise<LocalPhoto> => {
  try {
    const base64 = await fileToBase64(file);
    const newPhoto: LocalPhoto = {
      id: generateId(),
      filename: file.name,
      url: base64,
      uploadedAt: new Date()
    };
    
    const existingPhotos = getLocalPhotos();
    const updatedPhotos = [...existingPhotos, newPhoto];
    savePhotos(updatedPhotos);
    
    return newPhoto;
  } catch (error) {
    console.error('Error adding photo:', error);
    throw new Error('Error al procesar la imagen');
  }
};

// Eliminar una foto
export const deleteLocalPhoto = (id: string): boolean => {
  try {
    const photos = getLocalPhotos();
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    savePhotos(updatedPhotos);
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};

// Limpiar todas las fotos (útil para desarrollo)
export const clearAllPhotos = () => {
  localStorage.removeItem(STORAGE_KEY);
};