import { type Photo, type InsertPhoto } from "../shared/schema";
import { firebaseStorage } from "./firebase-storage";

export interface IStorage {
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  getAllPhotos(): Promise<Photo[]>;
  deletePhoto(id: string): Promise<boolean>;
}

// Use Firebase storage as the primary storage solution
export const storage = firebaseStorage;
