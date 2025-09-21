import type { Handler } from "@netlify/functions";
import admin from 'firebase-admin';

// Función para decodificar la variable Base64 y obtener las credenciales
function getFirebaseCredentials() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT_BASE64 no está definida.');
  }
  const encodedCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
  return JSON.parse(decodedCredentials);
}

// Inicializa Firebase Admin solo si no se ha hecho antes
if (admin.apps.length === 0) {
  try {
    const serviceAccount = getFirebaseCredentials();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error("Error FATAL al inicializar Firebase Admin SDK:", error.message);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

const handler: Handler = async () => {
  if (!db) {
    const errorMessage = "La base de datos de Firebase no pudo inicializarse. Revisa las credenciales.";
    console.error(errorMessage);
    return { statusCode: 500, body: JSON.stringify({ message: errorMessage }) };
  }
  
  try {
    const snapshot = await db.collection('photos').orderBy('uploadedAt', 'desc').get();
    const photos: any[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      photos.push({
        id: doc.id,
        ...data,
        uploadedAt: data.uploadedAt.toDate().toISOString()
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify(photos),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error: any) {
    console.error("Error en el handler de getPhotos:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Error al obtener fotos: ${error.message}` })
    };
  }
};

export { handler };
