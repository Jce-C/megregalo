# Configuración de Firebase para el Proyecto Photo Cascade

## ¿Qué necesitas hacer?

Para que tu aplicación use Firebase como base de datos persistente en lugar del almacenamiento local, necesitas configurar las siguientes variables de entorno:

## Variables de entorno requeridas

### Para el Backend (servidor):
```
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-clave-privada\n-----END PRIVATE KEY-----\n"
```

### Para el Frontend (cliente):
```
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

## Cómo obtener estas credenciales:

### 1. Crear un proyecto en Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita Firestore Database en modo de prueba

### 2. Configurar Authentication (para el frontend)
1. En Firebase Console, ve a "Project Settings" (configuración del proyecto)
2. En la sección "Your apps", agrega una aplicación web
3. Copia los valores de configuración que aparecen

### 3. Configurar Admin SDK (para el backend)
1. En Firebase Console, ve a "Project Settings"
2. Ve a la pestaña "Service accounts" 
3. Haz clic en "Generate new private key"
4. Descarga el archivo JSON
5. Extrae los valores: `project_id`, `client_email`, y `private_key`

## Configuración en Replit

1. Ve a la sección "Secrets" en tu proyecto de Replit
2. Agrega cada una de las variables de entorno listadas arriba
3. Para `FIREBASE_PRIVATE_KEY`, asegúrate de incluir las comillas y los `\n` para los saltos de línea

## Estado actual

✅ **Firebase está configurado y listo para usar**
✅ **Fallback a almacenamiento en memoria funciona correctamente**
✅ **Frontend usa localStorage como respaldo**

Mientras no configures las credenciales de Firebase, la aplicación funcionará perfectamente usando almacenamiento local y en memoria. Una vez que agregues las credenciales, las fotos se guardarán automáticamente en Firebase Firestore.

## Ventajas de usar Firebase

- **Persistencia real**: Las fotos no se pierden al reiniciar el servidor
- **Escalabilidad**: Firebase maneja automáticamente el crecimiento de datos
- **Sincronización**: Múltiples usuarios pueden ver las mismas fotos
- **Respaldo automático**: Google maneja las copias de seguridad