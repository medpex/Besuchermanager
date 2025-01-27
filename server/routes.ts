import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, createAdminUser } from "./auth";
import { db } from "@db";
import { visits } from "@db/schema";
import { desc, sql } from "drizzle-orm";
import { users } from "@db/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  createAdminUser().catch(console.error);

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
      console.error("Failed to create visit:", error);
      res.status(500).send("Failed to create visit");
    }
  });

  app.get("/api/visits", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const results = await db.select().from(visits).orderBy(desc(visits.timestamp)).limit(100);
      res.json(results);
    } catch (error) {
      console.error("Failed to fetch visits:", error);
      res.status(500).send("Failed to fetch visits");
    }
  });

  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      // Get years for which we have data
      const yearsResult = await db.execute(sql`
        SELECT DISTINCT EXTRACT(YEAR FROM timestamp)::integer as year
        FROM visits
        ORDER BY year DESC
        LIMIT 5
      `);
      const years = yearsResult.rows.map(row => row.year);

      // Weekday stats
      const weekdayStats = await db.execute(sql`
        SELECT 
          to_char(timestamp, 'Day') as name,
          EXTRACT(YEAR FROM timestamp)::integer as year,
          COUNT(*) as count
        FROM visits 
        WHERE EXTRACT(YEAR FROM timestamp) = ANY(${years})
        GROUP BY 
          to_char(timestamp, 'Day'),
          EXTRACT(YEAR FROM timestamp),
          EXTRACT(DOW FROM timestamp)
        ORDER BY EXTRACT(DOW FROM timestamp)
      `);

      // Time interval stats
      const timeIntervalStats = await db.execute(sql`
        SELECT 
          CASE 
            WHEN EXTRACT(HOUR FROM timestamp) < 10 THEN '08:00-10:00'
            WHEN EXTRACT(HOUR FROM timestamp) < 12 THEN '10:00-12:00'
            WHEN EXTRACT(HOUR FROM timestamp) < 14 THEN '12:00-14:00'
            WHEN EXTRACT(HOUR FROM timestamp) < 16 THEN '14:00-16:00'
            ELSE '16:00-18:00'
          END as name,
          EXTRACT(YEAR FROM timestamp)::integer as year,
          COUNT(*) as count
        FROM visits 
        WHERE EXTRACT(YEAR FROM timestamp) = ANY(${years})
        GROUP BY 1, 2
        ORDER BY 1
      `);

      // Monthly stats
      const monthlyStats = await db.execute(sql`
        SELECT 
          to_char(timestamp, 'Month') as name,
          EXTRACT(YEAR FROM timestamp)::integer as year,
          COUNT(*) as count
        FROM visits 
        WHERE EXTRACT(YEAR FROM timestamp) = ANY(${years})
        GROUP BY 
          to_char(timestamp, 'Month'),
          EXTRACT(YEAR FROM timestamp),
          EXTRACT(MONTH FROM timestamp)
        ORDER BY EXTRACT(MONTH FROM timestamp)
      `);

      // Transform the data into the required format
      const transformData = (rows: any[]) => {
        const dataByName = {};

        rows.forEach(row => {
          const name = row.name.trim();
          if (!dataByName[name]) {
            dataByName[name] = { name };
            // Initialize all years with 0
            years.forEach(year => {
              dataByName[name][year] = 0;
            });
          }
          dataByName[name][row.year] = parseInt(row.count);
        });

        return Object.values(dataByName);
      };

      res.json({
        weekday: transformData(weekdayStats.rows),
        timeInterval: transformData(timeIntervalStats.rows),
        month: transformData(monthlyStats.rows)
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
      const allUsers = await db.select().from(users);
      const visitCounts = await db.execute(sql`
        SELECT created_by, COUNT(*) as visit_count
        FROM visits
        GROUP BY created_by
      `);

      const visitCountMap = new Map(
        visitCounts.rows.map(row => [row.created_by, parseInt(row.visit_count)])
      );

      const usersWithVisits = allUsers.map(user => ({
        ...user,
        visitCount: visitCountMap.get(user.id) || 0
      }));

      res.json(usersWithVisits);
    } catch (error) {
      console.error("Failed to fetch users:", error);
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
      console.error("Failed to create user:", error);
      res.status(500).send("Failed to create user");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}