import type { Handler, HandlerEvent } from "@netlify/functions";
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

const handler: Handler = async (event: HandlerEvent) => {
  if (!db) {
    const errorMessage = "La base de datos de Firebase no pudo inicializarse. Revisa las credenciales.";
    console.error(errorMessage);
    return { statusCode: 500, body: JSON.stringify({ message: errorMessage }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    if (!event.body) throw new Error("No hay cuerpo en la solicitud.");
    
    const { filename, dataUrl } = JSON.parse(event.body);
    if (!filename || !dataUrl) throw new Error("Faltan 'filename' o 'dataUrl' en el body.");

    const docRef = await db.collection('photos').add({
      filename,
      url: dataUrl,
      uploadedAt: new Date(),
    });

    const newPhoto = { id: docRef.id, filename, url: dataUrl, uploadedAt: new Date().toISOString() };
    return { statusCode: 200, body: JSON.stringify(newPhoto), headers: { 'Content-Type': 'application/json' } };

  } catch (error: any) {
    console.error('Error en el handler de uploadPhoto:', error.message);
    return { statusCode: 500, body: JSON.stringify({ message: `Error al subir la foto: ${error.message}` }) };
  }
};

export { handler };
