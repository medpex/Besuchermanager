import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, createAdminUser } from "./auth";
import { db } from "@db";
import { visits } from "@db/schema";
import { desc, sql } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Create admin user on server start
  createAdminUser().catch(console.error);

  // Visit tracking endpoints
  app.post("/api/visits", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const visit = await db.insert(visits).values({
        ...req.body,
        createdBy: req.user.id
      }).returning();
      res.json(visit[0]);
    } catch (error) {
      res.status(500).send("Failed to create visit");
    }
  });

  app.get("/api/visits", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const results = await db.select().from(visits).orderBy(desc(visits.timestamp));
      res.json(results);
    } catch (error) {
      res.status(500).send("Failed to fetch visits");
    }
  });

  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const dailyStats = await db.select({
        date: sql`date_trunc('day', ${visits.timestamp})`,
        count: sql`count(*)`,
        category: visits.category
      })
      .from(visits)
      .groupBy(sql`date_trunc('day', ${visits.timestamp})`, visits.category)
      .orderBy(sql`date_trunc('day', ${visits.timestamp})`);

      res.json(dailyStats);
    } catch (error) {
      res.status(500).send("Failed to fetch statistics");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}