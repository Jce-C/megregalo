import type { Handler, HandlerEvent } from "@netlify/functions";
import { neon } from '@neondatabase/serverless';
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm"; // <-- LA CORRECCIÓN ESTÁ AQUÍ
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from 'drizzle-zod';

// Define el esquema aquí
export const photosTable = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});
const insertPhotoSchema = createInsertSchema(photosTable);


const handler: Handler = async (event: HandlerEvent) => {
  console.log("Iniciando uploadPhoto function (versión definitiva)...");
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    if (!process.env.NETLIFY_DATABASE_URL) {
      throw new Error("DATABASE_URL no fue encontrada. Asegúrate de que la extensión Neon esté activada en Netlify.");
    }

    if (!event.body) {
      throw new Error("No hay cuerpo en la solicitud (body).");
    }
    
    // Conecta a la base de datos
    const sqlNeon = neon(process.env.NETLIFY_DATABASE_URL);
    const db = drizzle(sqlNeon);
    
    console.log("Recibido body, parseando JSON...");
    const { filename, dataUrl } = JSON.parse(event.body);

    if (!filename || !dataUrl) {
      throw new Error("Faltan 'filename' o 'dataUrl' en el body.");
    }
    
    console.log(`Guardando foto en la DB: ${filename}`);
    const photoToInsert = { filename, url: dataUrl };
    
    // Inserta la nueva foto y la devuelve
    const result = await db.insert(photosTable).values(photoToInsert).returning();
    console.log("Foto guardada exitosamente:", result[0]);

    return {
      statusCode: 200,
      body: JSON.stringify(result[0]),
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
