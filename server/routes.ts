import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, createAdminUser } from "./auth";
import { db } from "@db";
import { visits } from "@db/schema";
import { desc, sql } from "drizzle-orm";
import { users } from "@db/schema"; // Added import for users table

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
      // Weekday stats
      const weekdayStats = await db.execute(sql`
        WITH years AS (
          SELECT DISTINCT EXTRACT(YEAR FROM timestamp) as year
          FROM visits
          WHERE timestamp >= NOW() - INTERVAL '5 years'
        )
        SELECT 
          to_char(timestamp, 'Day') as name,
          jsonb_object_agg(EXTRACT(YEAR FROM timestamp)::text, count(*)) as data
        FROM visits
        WHERE timestamp >= NOW() - INTERVAL '5 years'
        GROUP BY to_char(timestamp, 'Day')
        ORDER BY MIN(EXTRACT(DOW FROM timestamp))
      `);

      // Time interval stats
      const timeIntervalStats = await db.execute(sql`
        WITH years AS (
          SELECT DISTINCT EXTRACT(YEAR FROM timestamp) as year
          FROM visits
          WHERE timestamp >= NOW() - INTERVAL '5 years'
        ),
        intervals AS (
          SELECT 
            CASE 
              WHEN EXTRACT(HOUR FROM timestamp) < 10 THEN '08:00-10:00'
              WHEN EXTRACT(HOUR FROM timestamp) < 12 THEN '10:00-12:00'
              WHEN EXTRACT(HOUR FROM timestamp) < 14 THEN '12:00-14:00'
              WHEN EXTRACT(HOUR FROM timestamp) < 16 THEN '14:00-16:00'
              ELSE '16:00-18:00'
            END as name,
            EXTRACT(YEAR FROM timestamp) as year,
            count(*) as count
          FROM visits
          WHERE timestamp >= NOW() - INTERVAL '5 years'
          GROUP BY 1, 2
        )
        SELECT 
          name,
          jsonb_object_agg(year::text, count) as data
        FROM intervals
        GROUP BY name
        ORDER BY name
      `);

      // Monthly stats
      const monthlyStats = await db.execute(sql`
        WITH years AS (
          SELECT DISTINCT EXTRACT(YEAR FROM timestamp) as year
          FROM visits
          WHERE timestamp >= NOW() - INTERVAL '5 years'
        )
        SELECT 
          to_char(timestamp, 'Month') as name,
          jsonb_object_agg(EXTRACT(YEAR FROM timestamp)::text, count(*)) as data
        FROM visits
        WHERE timestamp >= NOW() - INTERVAL '5 years'
        GROUP BY to_char(timestamp, 'Month')
        ORDER BY MIN(EXTRACT(MONTH FROM timestamp))
      `);

      res.json({
        weekday: weekdayStats.rows.map(row => ({ name: row.name.trim(), ...row.data })),
        timeInterval: timeIntervalStats.rows.map(row => ({ name: row.name, ...row.data })),
        month: monthlyStats.rows.map(row => ({ name: row.name.trim(), ...row.data }))
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).send("Failed to fetch statistics");
    }
  });

  // User management endpoints (admin only)
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Forbidden");
    }

    try {
      const users = await db.query.users.findMany({
        with: {
          visitCount: sql`
            SELECT COUNT(*) 
            FROM ${visits} 
            WHERE created_by = ${users.id}
          `
        }
      });
      res.json(users);
    } catch (error) {
      res.status(500).send("Failed to fetch users");
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Forbidden");
    }

    try {
      const newUser = await db.insert(users).values(req.body).returning();
      res.json(newUser[0]);
    } catch (error) {
      res.status(500).send("Failed to create user");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}