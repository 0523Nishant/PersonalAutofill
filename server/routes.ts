import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // For Chrome extension, we don't need server-side routes
  // The extension uses Chrome Storage API for data persistence
  // All functionality is handled client-side

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
