import type { Handler } from "@netlify/functions";
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

const handler: Handler = async () => {
  try {
    const snapshot = await db.collection('photos').orderBy('uploadedAt', 'desc').get();
    if (snapshot.empty) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
        headers: { 'Content-Type': 'application/json' }
      };
    }

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
    console.error("Error CRÍTICO en getPhotos:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Error al obtener fotos: ${error.message}` })
    };
  }
};

export { handler };
