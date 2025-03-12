import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { visits, users } from "@db/schema";
import { desc, sql } from "drizzle-orm";
import { hashPassword } from "./utils/crypto";

// Health check endpoint für Docker
export function registerHealthCheck(app: Express) {
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
}

export function registerRoutes(app: Express): Server {
  // Zuerst Health Check registrieren
  registerHealthCheck(app);
  setupAuth(app);

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
      // Entferne die Begrenzung auf 100 Einträge, um alle Besuche zu erhalten
      const results = await db.select().from(visits).orderBy(desc(visits.timestamp));
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
      // Weekday stats
      const weekdayStats = await db.execute(sql`
        WITH visit_years AS (
          SELECT DISTINCT date_part('year', timestamp)::text as year
          FROM visits
          ORDER BY year DESC
          LIMIT 5
        )
        SELECT 
          initcap(to_char(timestamp, 'day')) as name,
          date_part('year', timestamp)::text as year,
          COUNT(*) as count
        FROM visits 
        WHERE date_part('year', timestamp)::text IN (SELECT year FROM visit_years)
        GROUP BY 
          initcap(to_char(timestamp, 'day')),
          date_part('year', timestamp)::text,
          EXTRACT(isodow FROM timestamp)
        ORDER BY EXTRACT(isodow FROM timestamp);
      `);

      // Time interval stats
      const timeIntervalStats = await db.execute(sql`
        WITH visit_years AS (
          SELECT DISTINCT date_part('year', timestamp)::text as year
          FROM visits
          ORDER BY year DESC
          LIMIT 5
        )
        SELECT 
          time_bucket as name,
          date_part('year', timestamp)::text as year,
          COUNT(*) as count
        FROM (
          SELECT 
            timestamp,
            CASE 
              WHEN EXTRACT(HOUR FROM timestamp) < 10 THEN '08:00-10:00'
              WHEN EXTRACT(HOUR FROM timestamp) < 12 THEN '10:00-12:00'
              WHEN EXTRACT(HOUR FROM timestamp) < 14 THEN '12:00-14:00'
              WHEN EXTRACT(HOUR FROM timestamp) < 16 THEN '14:00-16:00'
              ELSE '16:00-18:00'
            END as time_bucket
          FROM visits
        ) subquery
        WHERE date_part('year', timestamp)::text IN (SELECT year FROM visit_years)
        GROUP BY time_bucket, date_part('year', timestamp)::text
        ORDER BY time_bucket;
      `);

      // Monthly stats
      const monthlyStats = await db.execute(sql`
        WITH visit_years AS (
          SELECT DISTINCT date_part('year', timestamp)::text as year
          FROM visits
          ORDER BY year DESC
          LIMIT 5
        )
        SELECT 
          initcap(to_char(timestamp, 'month')) as name,
          date_part('year', timestamp)::text as year,
          COUNT(*) as count
        FROM visits 
        WHERE date_part('year', timestamp)::text IN (SELECT year FROM visit_years)
        GROUP BY 
          initcap(to_char(timestamp, 'month')),
          date_part('year', timestamp)::text,
          EXTRACT(month FROM timestamp)
        ORDER BY EXTRACT(month FROM timestamp);
      `);

      // Subcategory stats - NEU
      const subcategoryStats = await db.execute(sql`
        WITH visit_years AS (
          SELECT DISTINCT date_part('year', timestamp)::text as year
          FROM visits
          ORDER BY year DESC
          LIMIT 5
        )
        SELECT 
          subcategory as name,
          date_part('year', timestamp)::text as year,
          COUNT(*) as count
        FROM visits 
        WHERE date_part('year', timestamp)::text IN (SELECT year FROM visit_years)
        GROUP BY 
          subcategory,
          date_part('year', timestamp)::text
        ORDER BY COUNT(*) DESC;
      `);

      // Top categories with percentage
      const topCategoriesStats = await db.execute(sql`
        WITH total AS (
          SELECT COUNT(*) as total_count FROM visits
        )
        SELECT 
          category,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0) / (SELECT total_count FROM total), 2) as percentage
        FROM visits
        GROUP BY category
        ORDER BY count DESC
        LIMIT 3;
      `);

      // Daten für die Standorte einzeln
      const officeLocations = ["Geesthacht", "Büchen", "Schwarzenbek"];
      
      // Interface für die Statistikdaten
      interface LocationStatsType {
        [location: string]: {
          weekday: any[];
          timeInterval: any[];
          month: any[];
          categoryData: any[];
        }
      }
      
      // Mit korrektem Typen initialisieren
      let locationStats: LocationStatsType = {};
      
      for (const location of officeLocations) {
        // Weekday stats for this location
        const locationWeekdayStats = await db.execute(sql`
          WITH visit_years AS (
            SELECT DISTINCT date_part('year', timestamp)::text as year
            FROM visits
            WHERE office_location = ${location}
            ORDER BY year DESC
            LIMIT 5
          )
          SELECT 
            initcap(to_char(timestamp, 'day')) as name,
            date_part('year', timestamp)::text as year,
            COUNT(*) as count
          FROM visits 
          WHERE 
            office_location = ${location} AND
            date_part('year', timestamp)::text IN (SELECT year FROM visit_years)
          GROUP BY 
            initcap(to_char(timestamp, 'day')),
            date_part('year', timestamp)::text,
            EXTRACT(isodow FROM timestamp)
          ORDER BY EXTRACT(isodow FROM timestamp);
        `);

        // Time interval stats for this location
        const locationTimeIntervalStats = await db.execute(sql`
          WITH visit_years AS (
            SELECT DISTINCT date_part('year', timestamp)::text as year
            FROM visits
            WHERE office_location = ${location}
            ORDER BY year DESC
            LIMIT 5
          )
          SELECT 
            time_bucket as name,
            date_part('year', timestamp)::text as year,
            COUNT(*) as count
          FROM (
            SELECT 
              timestamp,
              CASE 
                WHEN EXTRACT(HOUR FROM timestamp) < 10 THEN '08:00-10:00'
                WHEN EXTRACT(HOUR FROM timestamp) < 12 THEN '10:00-12:00'
                WHEN EXTRACT(HOUR FROM timestamp) < 14 THEN '12:00-14:00'
                WHEN EXTRACT(HOUR FROM timestamp) < 16 THEN '14:00-16:00'
                ELSE '16:00-18:00'
              END as time_bucket
            FROM visits
            WHERE office_location = ${location}
          ) subquery
          WHERE date_part('year', timestamp)::text IN (SELECT year FROM visit_years)
          GROUP BY time_bucket, date_part('year', timestamp)::text
          ORDER BY time_bucket;
        `);

        // Monthly stats for this location
        const locationMonthlyStats = await db.execute(sql`
          WITH visit_years AS (
            SELECT DISTINCT date_part('year', timestamp)::text as year
            FROM visits
            WHERE office_location = ${location}
            ORDER BY year DESC
            LIMIT 5
          )
          SELECT 
            initcap(to_char(timestamp, 'month')) as name,
            date_part('year', timestamp)::text as year,
            COUNT(*) as count
          FROM visits 
          WHERE 
            office_location = ${location} AND
            date_part('year', timestamp)::text IN (SELECT year FROM visit_years)
          GROUP BY 
            initcap(to_char(timestamp, 'month')),
            date_part('year', timestamp)::text,
            EXTRACT(month FROM timestamp)
          ORDER BY EXTRACT(month FROM timestamp);
        `);

        // Kategorie-basierte Auswertung für Standorte
        const locationCategoryStats = await db.execute(sql`
          WITH visit_years AS (
            SELECT DISTINCT date_part('year', timestamp)::text as year
            FROM visits
            WHERE office_location = ${location}
            ORDER BY year DESC
            LIMIT 5
          )
          SELECT 
            category,
            subcategory,
            date_part('year', timestamp)::text as year,
            EXTRACT(month FROM timestamp) as month,
            EXTRACT(year FROM timestamp) as timestamp_year,
            COUNT(*) as count,
            timestamp
          FROM visits 
          WHERE 
            office_location = ${location} AND
            date_part('year', timestamp)::text IN (SELECT year FROM visit_years)
          GROUP BY 
            category,
            subcategory,
            date_part('year', timestamp)::text,
            EXTRACT(month FROM timestamp),
            EXTRACT(year FROM timestamp),
            timestamp
          ORDER BY 
            date_part('year', timestamp)::text DESC,
            EXTRACT(month FROM timestamp) ASC;
        `);

        // Füge die Daten dem locationStats-Objekt hinzu
        locationStats[location] = {
          weekday: locationWeekdayStats.rows,
          timeInterval: locationTimeIntervalStats.rows,
          month: locationMonthlyStats.rows,
          categoryData: locationCategoryStats.rows
        };
      }

      // Transform data for frontend
      const transformData = (rows: any[]) => {
        const result: Record<string, Record<string, any>> = {};

        // First pass: collect all unique years
        const years = new Set<string>();
        rows.forEach(row => years.add(row.year));

        // Second pass: initialize data structure
        rows.forEach(row => {
          const name = row.name.trim();
          if (!result[name]) {
            result[name] = { name };
            years.forEach(year => {
              result[name][year] = 0;
            });
          }
          result[name][row.year] = parseInt(row.count);
        });

        return Object.values(result);
      };

      // Für jeden Standort die Daten transformieren
      for (const location of officeLocations) {
        if (locationStats[location]) {
          locationStats[location].weekday = transformData(locationStats[location].weekday);
          locationStats[location].timeInterval = transformData(locationStats[location].timeInterval);
          locationStats[location].month = transformData(locationStats[location].month);
          // category data bleibt unverändert
        }
      }

      res.json({
        weekday: transformData(weekdayStats.rows),
        timeInterval: transformData(timeIntervalStats.rows),
        month: transformData(monthlyStats.rows),
        subcategory: transformData(subcategoryStats.rows),
        topCategories: topCategoriesStats.rows,
        byLocation: locationStats
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

      const visitCountMap = new Map<number, number>();
      
      visitCounts.rows.forEach(row => {
        if (row.created_by !== null && row.visit_count !== null) {
          const userId = Number(row.created_by);
          const count = parseInt(String(row.visit_count));
          if (!isNaN(userId) && !isNaN(count)) {
            visitCountMap.set(userId, count);
          }
        }
      });

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
      const hashedPassword = await hashPassword(req.body.password);
      const newUser = await db.insert(users).values({
        ...req.body,
        password: hashedPassword
      }).returning();

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser[0];
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Failed to create user:", error);
      res.status(500).send("Failed to create user");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}