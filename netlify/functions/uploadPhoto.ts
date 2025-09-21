import type { Handler, HandlerEvent } from "@netlify/functions";
import admin from 'firebase-admin';

// Inicializa Firebase Admin solo si no se ha hecho antes
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
  }
}

const db = admin.firestore();

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    if (!event.body) {
      throw new Error("No hay cuerpo en la solicitud.");
    }

    const { filename, dataUrl } = JSON.parse(event.body);
    if (!filename || !dataUrl) {
      throw new Error("Faltan 'filename' o 'dataUrl' en el body.");
    }

    const docRef = await db.collection('photos').add({
      filename,
      url: dataUrl,
      uploadedAt: new Date(),
    });

    const newPhoto = { id: docRef.id, filename, url: dataUrl, uploadedAt: new Date().toISOString() };

    return {
      statusCode: 200,
      body: JSON.stringify(newPhoto),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (error: any) {
    console.error('Error CRÍTICO en uploadPhoto:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Error al subir la foto: ${error.message}` })
    };
  }
};

export { handler };
