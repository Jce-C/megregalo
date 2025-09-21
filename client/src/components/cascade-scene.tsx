import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPhotos, type Photo } from '@/lib/photoApi';
import { useToast } from "@/hooks/use-toast";

const MESSAGES = [
  'I love you so much baby♡',
  'I love you so much baby♡♡',
  'I love you so much baby♡♡♡'
];

const HEART_SYMBOLS = ['♡', '♥', '💕', '💖', '🧡'];

interface CascadeItem {
  id: string;
  type: 'message' | 'photo' | 'heart';
  content: string;
  style: React.CSSProperties;
  duration: number;
}

export default function CascadeScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CascadeItem[]>([]);
  const itemsRef = useRef<CascadeItem[]>([]);
  const { toast } = useToast();

  const { data: photos = [], isError, error } = useQuery<Photo[]>({
    queryKey: ['photos'],
    queryFn: getPhotos,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (isError) {
      console.error("Error al obtener fotos:", error);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudieron cargar las fotos del servidor. Mostrando respaldo local.",
      });
    }
  }, [isError, toast, error]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const createMessage = (): CascadeItem => {
    const id = `message-${Date.now()}-${Math.random()}`;
    const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    const duration = Math.random() * 10 + 15;
    
    return {
      id,
      type: 'message',
      content: message,
      style: {
        left: Math.random() * 80 + '%',
        fontSize: (Math.random() * 18 + 14) + 'px',
        transform: `rotate(${Math.random() * 30 - 15}deg)`,
        animationDuration: duration + 's',
        animationDelay: Math.random() * 2 + 's',
      },
      duration: duration * 1000,
    };
  };

  const createPhoto = (): CascadeItem | null => {
    if (photos.length === 0) return null;
    
    const id = `photo-${Date.now()}-${Math.random()}`;
    const photo = photos[Math.floor(Math.random() * photos.length)];
    const size = Math.random() * 140 + 100;
    const duration = Math.random() * 8 + 12;
    
    return {
      id,
      type: 'photo' as const,
      content: photo.url,
      style: {
        width: size + 'px',
        height: size + 'px',
        left: Math.random() * 80 + '%',
        transform: `rotate(${Math.random() * 20 - 10}deg)`,
        animationDuration: duration + 's',
        animationDelay: Math.random() * 3 + 's',
      },
      duration: duration * 1000,
    };
  };

  const createHeart = (): CascadeItem => {
    const id = `heart-${Date.now()}-${Math.random()}`;
    const heart = HEART_SYMBOLS[Math.floor(Math.random() * HEART_SYMBOLS.length)];
    const duration = Math.random() * 12 + 18;
    
    return {
      id,
      type: 'heart',
      content: heart,
      style: {
        left: Math.random() * 80 + '%',
        fontSize: (Math.random() * 15 + 15) + 'px',
        animationDuration: duration + 's',
        animationDelay: Math.random() * 4 + 's',
      },
      duration: duration * 1000,
    };
  };

  const addItem = (item: CascadeItem) => {
    setItems(prev => [...prev, item]);
    
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== item.id));
    }, item.duration + 5000);
  };

  useEffect(() => {
    const messageInterval = setInterval(() => {
      const message = createMessage();
      addItem(message);
    }, 800);

    const photoInterval = setInterval(() => {
      const photo = createPhoto();
      if (photo) addItem(photo);
    }, 1500);

    const heartInterval = setInterval(() => {
      const heart = createHeart();
      addItem(heart);
    }, 600);

    for (let i = 0; i < 10; i++) {
      setTimeout(() => addItem(createMessage()), i * 200);
      setTimeout(() => addItem(createHeart()), i * 150);
      if (photos.length > 0) {
        setTimeout(() => {
          const photo = createPhoto();
          if (photo) addItem(photo);
        }, i * 300);
      }
    }

    return () => {
      clearInterval(messageInterval);
      clearInterval(photoInterval);
      clearInterval(heartInterval);
    };
  }, [photos]);

  const renderItem = (item: CascadeItem) => {
    const baseClass = `cascade-item ${item.type === 'message' ? 'neon-text' : 
                                      item.type === 'photo' ? 'photo-frame' : 'heart'}`;
    
    if (item.type === 'photo') {
      return (
        <div
          key={item.id}
          className={baseClass}
          style={item.style}
        >
          <img 
            src={item.content} 
            alt="Uploaded photo"
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      );
    }

    return (
      <div
        key={item.id}
        className={baseClass}
        style={item.style}
      >
        {item.content}
      </div>
    );
  };

  return (
    <div className="cascade-container">
      <div ref={sceneRef} className="cascade-scene">
        {items.map(renderItem)}
      </div>
    </div>
  );
}
