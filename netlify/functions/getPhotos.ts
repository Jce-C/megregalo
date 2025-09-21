import type { Handler } from "@netlify/functions";
import { neon } from '@neondatabase/serverless';
import { drizzle } from "drizzle-orm/neon-http";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";

// Define el esquema (la estructura de la tabla) aquí mismo
// para que la función sea totalmente independiente.
export const photos = pgTable("photos", {
  id: varchar("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull(),
});

const handler: Handler = async (event) => {
  console.log("Iniciando getPhotos function (versión definitiva)...");
  try {
    // Comprueba que la variable de entorno de la base de datos exista
    if (!process.env.NETLIFY_DATABASE_URL) {
      throw new Error("DATABASE_URL no fue encontrada. Asegúrate de que la extensión Neon esté activada en Netlify.");
    }
    
    // Conecta a la base de datos
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    const db = drizzle(sql);

    // Obtiene todas las fotos
    const result = await db.select().from(photos);
    console.log(`Fotos encontradas en la base de datos: ${result.length}`);
    
    return {
      statusCode: 200,
      body: JSON.stringify(result),
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
