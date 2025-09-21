import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPhotoSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Upload photo endpoint
  app.post('/api/photos', upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Sanitize filename to prevent path traversal attacks
      const sanitizedOriginalName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileExtension = path.extname(sanitizedOriginalName).toLowerCase();
      
      // Only allow image extensions
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ message: 'Only image files are allowed' });
      }
      
      const filename = `${Date.now()}-${sanitizedOriginalName}`;
      const filepath = path.join(uploadsDir, filename);
      
      await fs.writeFile(filepath, req.file.buffer);
      
      const photo = await storage.createPhoto({
        filename: req.file.originalname,
        url: `/uploads/${filename}`,
      });

      res.json(photo);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload photo' });
    }
  });

  // Get all photos
  app.get('/api/photos', async (req, res) => {
    try {
      const photos = await storage.getAllPhotos();
      res.json(photos);
    } catch (error) {
      console.error('Fetch photos error:', error);
      res.status(500).json({ message: 'Failed to fetch photos' });
    }
  });

  // Delete photo
  app.delete('/api/photos/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePhoto(id);
      
      if (success) {
        res.json({ message: 'Photo deleted successfully' });
      } else {
        res.status(404).json({ message: 'Photo not found' });
      }
    } catch (error) {
      console.error('Delete photo error:', error);
      res.status(500).json({ message: 'Failed to delete photo' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
