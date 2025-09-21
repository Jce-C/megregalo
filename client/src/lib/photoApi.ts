// API client para comunicarse con el backend y persistir fotos globalmente
export interface Photo {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
}

// Obtener todas las fotos del servidor con fallback a localStorage
export const getPhotos = async (): Promise<Photo[]> => {
  try {
    // CAMBIO 1: La ruta ahora apunta a la función específica 'getPhotos'
    const response = await fetch('/api/getPhotos');
    if (!response.ok) {
      throw new Error('Error al cargar las fotos del servidor');
    }
    const photos = await response.json();
    // Si la respuesta está vacía o no es un array, usa el respaldo local.
    if (!Array.isArray(photos)) {
        return getLocalPhotos();
    }
    return photos;
  } catch (error) {
    console.error('Error fetching photos from server, usando localStorage como respaldo:', error);
    // Fallback a localStorage
    return getLocalPhotos();
  }
};

// --- Funciones de Respaldo para LocalStorage ---
const STORAGE_KEY = 'cascade-photos';

const getLocalPhotos = (): Photo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const photos = JSON.parse(stored);
    return photos.map((photo: any) => ({
      ...photo,
      uploadedAt: new Date(photo.uploadedAt).toISOString()
    }));
  } catch (error) {
    console.error('Error loading photos from localStorage:', error);
    return [];
  }
};

const saveLocalPhotos = (photos: Photo[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch (error) {
    console.error('Error saving photos to localStorage:', error);
    throw new Error('No se pudo guardar la foto');
  }
};

// --- Funciones de Procesamiento de Imágenes ---
const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
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
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          reject(new Error('Error al comprimir la imagen'));
        }
      }, 'image/jpeg', quality);
    };
    
    img.onerror = reject;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const compressImageToBase64 = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        compressImage(file, maxWidth, maxHeight, quality)
            .then(fileToBase64)
            .then(resolve)
            .catch(reject);
    });
};


// --- Funciones de API (Subir y Borrar) ---
export const uploadPhoto = async (file: File): Promise<Photo> => {
  try {
    const compressedFile = await compressImage(file);
    const dataUrl = await fileToBase64(compressedFile);
    
    // CAMBIO 2: La ruta ahora apunta a la función específica 'uploadPhoto'
    const response = await fetch('/api/uploadPhoto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        filename: compressedFile.name,
        dataUrl: dataUrl 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al subir la foto');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al subir la foto al servidor, usando respaldo local:', error);
    
    try {
      const compressedDataUrl = await compressImageToBase64(file);
      const newPhoto: Photo = {
        id: `local-${Date.now()}`,
        filename: file.name,
        url: compressedDataUrl,
        uploadedAt: new Date().toISOString()
      };
      
      const existingPhotos = getLocalPhotos();
      const updatedPhotos = [...existingPhotos, newPhoto];
      saveLocalPhotos(updatedPhotos);
      
      return newPhoto;
    } catch (localError) {
      console.error('Error al guardar en localStorage:', localError);
      throw new Error('Error al procesar la imagen');
    }
  }
};

export const deletePhoto = async (id: string): Promise<boolean> => {
  // Esta función es opcional, la dejamos por si la necesitas en el futuro.
  try {
    const response = await fetch(`/api/photos/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la foto');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};
