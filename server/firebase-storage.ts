import { type Photo, type InsertPhoto } from "../shared/schema";
import { initializeFirestore, getDB } from "./firebase-config";

// Initialize Firestore
const db = initializeFirestore();

// In-memory storage as fallback when Firebase is not available
const inMemoryPhotos = new Map<string, Photo>();

export interface IFirebaseStorage {
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  getAllPhotos(): Promise<Photo[]>;
  deletePhoto(id: string): Promise<boolean>;
}

export class FirebaseStorage implements IFirebaseStorage {
  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    if (db) {
      try {
        // Add photo to Firestore using Firebase Admin SDK
        const docRef = await db.collection('photos').add({
          ...insertPhoto,
          uploadedAt: new Date(),
        });

        const photo: Photo = {
          id: docRef.id,
          ...insertPhoto,
          uploadedAt: new Date(),
        };

        console.log("Photo saved to Firestore with ID:", docRef.id);
        return photo;
      } catch (error) {
        console.error("Error saving photo to Firestore:", error);
        // Fall back to in-memory storage
        return this.createPhotoInMemory(insertPhoto);
      }
    } else {
      // In-memory fallback
      return this.createPhotoInMemory(insertPhoto);
    }
  }

  async getAllPhotos(): Promise<Photo[]> {
    if (db) {
      try {
        const snapshot = await db.collection('photos').get();
        
        const photos: Photo[] = [];
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          photos.push({
            id: doc.id,
            filename: data.filename,
            url: data.url,
            uploadedAt: data.uploadedAt,
          });
        });

        console.log(`Retrieved ${photos.length} photos from Firestore`);
        return photos;
      } catch (error) {
        console.error("Error getting photos from Firestore:", error);
        // Fall back to in-memory storage
        return Array.from(inMemoryPhotos.values());
      }
    } else {
      // In-memory fallback
      return Array.from(inMemoryPhotos.values());
    }
  }

  async deletePhoto(id: string): Promise<boolean> {
    if (db) {
      try {
        await db.collection('photos').doc(id).delete();
        console.log("Photo deleted from Firestore:", id);
        return true;
      } catch (error) {
        console.error("Error deleting photo from Firestore:", error);
        // Fall back to in-memory storage
        return inMemoryPhotos.delete(id);
      }
    } else {
      // In-memory fallback
      return inMemoryPhotos.delete(id);
    }
  }

  private createPhotoInMemory(insertPhoto: InsertPhoto): Photo {
    const photo: Photo = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...insertPhoto,
      uploadedAt: new Date(),
    };
    inMemoryPhotos.set(photo.id, photo);
    console.log("Photo saved in memory:", photo.id);
    return photo;
  }
}

export const firebaseStorage = new FirebaseStorage();