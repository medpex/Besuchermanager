import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, requireAdmin } from "./auth";
import { db } from "@db";
import { visits, users } from "@db/schema";
import { desc, sql } from "drizzle-orm";
import { hashPassword } from "./utils/crypto";
import { eq } from "drizzle-orm";
import { verifyPassword } from "./utils/crypto";
import multer from "multer";
import { parse } from "csv-parse";
import fs from "fs";
import path from "path";

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Health check endpoint für Systemüberwachung
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
              WHEN EXTRACT(HOUR FROM timestamp) = 8 THEN '08:00-09:00'
              WHEN EXTRACT(HOUR FROM timestamp) = 9 THEN '09:00-10:00'
              WHEN EXTRACT(HOUR FROM timestamp) = 10 THEN '10:00-11:00'
              WHEN EXTRACT(HOUR FROM timestamp) = 11 THEN '11:00-12:00'
              WHEN EXTRACT(HOUR FROM timestamp) = 12 THEN '12:00-13:00'
              WHEN EXTRACT(HOUR FROM timestamp) = 13 THEN '13:00-14:00'
              WHEN EXTRACT(HOUR FROM timestamp) = 14 THEN '14:00-15:00'
              WHEN EXTRACT(HOUR FROM timestamp) = 15 THEN '15:00-16:00'
              WHEN EXTRACT(HOUR FROM timestamp) = 16 THEN '16:00-17:00'
              WHEN EXTRACT(HOUR FROM timestamp) = 17 THEN '17:00-18:00'
              ELSE 'Andere Zeit'
            END as time_bucket
          FROM visits
        ) subquery
        WHERE date_part('year', timestamp)::text IN (SELECT year FROM visit_years)
        GROUP BY time_bucket, date_part('year', timestamp)::text
        ORDER BY 
          CASE 
            WHEN time_bucket = '08:00-09:00' THEN 1
            WHEN time_bucket = '09:00-10:00' THEN 2
            WHEN time_bucket = '10:00-11:00' THEN 3
            WHEN time_bucket = '11:00-12:00' THEN 4
            WHEN time_bucket = '12:00-13:00' THEN 5
            WHEN time_bucket = '13:00-14:00' THEN 6
            WHEN time_bucket = '14:00-15:00' THEN 7
            WHEN time_bucket = '15:00-16:00' THEN 8
            WHEN time_bucket = '16:00-17:00' THEN 9
            WHEN time_bucket = '17:00-18:00' THEN 10
            ELSE 11
          END;
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
                WHEN EXTRACT(HOUR FROM timestamp) = 8 THEN '08:00-09:00'
                WHEN EXTRACT(HOUR FROM timestamp) = 9 THEN '09:00-10:00'
                WHEN EXTRACT(HOUR FROM timestamp) = 10 THEN '10:00-11:00'
                WHEN EXTRACT(HOUR FROM timestamp) = 11 THEN '11:00-12:00'
                WHEN EXTRACT(HOUR FROM timestamp) = 12 THEN '12:00-13:00'
                WHEN EXTRACT(HOUR FROM timestamp) = 13 THEN '13:00-14:00'
                WHEN EXTRACT(HOUR FROM timestamp) = 14 THEN '14:00-15:00'
                WHEN EXTRACT(HOUR FROM timestamp) = 15 THEN '15:00-16:00'
                WHEN EXTRACT(HOUR FROM timestamp) = 16 THEN '16:00-17:00'
                WHEN EXTRACT(HOUR FROM timestamp) = 17 THEN '17:00-18:00'
                ELSE 'Andere Zeit'
              END as time_bucket
            FROM visits
            WHERE office_location = ${location}
          ) subquery
          WHERE date_part('year', timestamp)::text IN (SELECT year FROM visit_years)
          GROUP BY time_bucket, date_part('year', timestamp)::text
          ORDER BY 
            CASE 
              WHEN time_bucket = '08:00-09:00' THEN 1
              WHEN time_bucket = '09:00-10:00' THEN 2
              WHEN time_bucket = '10:00-11:00' THEN 3
              WHEN time_bucket = '11:00-12:00' THEN 4
              WHEN time_bucket = '12:00-13:00' THEN 5
              WHEN time_bucket = '13:00-14:00' THEN 6
              WHEN time_bucket = '14:00-15:00' THEN 7
              WHEN time_bucket = '15:00-16:00' THEN 8
              WHEN time_bucket = '16:00-17:00' THEN 9
              WHEN time_bucket = '17:00-18:00' THEN 10
              ELSE 11
            END;
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

  // Speichern nicht, aber zugreifen ja
  app.get("/api/analytics/clicks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(403).send("Forbidden");
    }

    try {
      // Da 'clicks' nicht definiert ist, ersetzen wir es durch eine leere Array-Antwort
      // bis das richtige Datenmodell implementiert ist
      res.json([]);
    } catch (error) {
      console.error('Clicks fetch error:', error);
      res.status(500).send("Failed to fetch clicks");
    }
  });

  // Change own password (for all authenticated users)
  app.post("/api/user/change-password", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Nicht eingeloggt");
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).send("Aktuelles und neues Passwort erforderlich");
    }

    try {
      // Verify current password
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (!user) {
        return res.status(404).send("Benutzer nicht gefunden");
      }

      const isMatch = await verifyPassword(user.password, currentPassword);
      if (!isMatch) {
        return res.status(400).send("Aktuelles Passwort ist falsch");
      }

      // Update to new password
      const hashedPassword = await hashPassword(newPassword);
      
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, req.user.id));

      res.json({ message: "Passwort erfolgreich geändert" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).send("Fehler bei der Passwortänderung");
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

  // Update user (admin only)
  app.patch("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Forbidden");
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    try {
      // Don't allow updating own admin status (prevent self-lockout)
      if (userId === req.user.id && req.body.isAdmin === false) {
        return res.status(400).send("Kann Administratorrechte nicht vom eigenen Konto entfernen");
      }

      // Prepare update data
      const updateData: any = {};
      
      // Only update fields that are provided
      if (req.body.username !== undefined) updateData.username = req.body.username;
      if (req.body.isAdmin !== undefined) updateData.isAdmin = req.body.isAdmin;
      
      // If password is provided, hash it
      if (req.body.password) {
        updateData.password = await hashPassword(req.body.password);
      }

      const updatedUser = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser.length) {
        return res.status(404).send("Benutzer nicht gefunden");
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser[0];
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).send("Failed to update user");
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Forbidden");
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    // Don't allow deleting own account
    if (userId === req.user.id) {
      return res.status(400).send("Kann eigenes Konto nicht löschen");
    }

    try {
      const deletedUser = await db
        .delete(users)
        .where(eq(users.id, userId))
        .returning();

      if (!deletedUser.length) {
        return res.status(404).send("Benutzer nicht gefunden");
      }

      res.json({ message: "Benutzer erfolgreich gelöscht" });
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).send("Failed to delete user");
    }
  });

  // CSV Upload endpoint for importing old visitor data (admin only)
  app.post("/api/admin/upload-csv", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Forbidden");
    }

    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }

      // Speichere den Dateipfad, damit er später sicher verwendet werden kann
      const filePath = req.file.path;
      
      const csvRecords: any[] = [];
      const parser = fs.createReadStream(filePath)
        .pipe(parse({
          columns: true,
          delimiter: ',',
          trim: true,
          skip_empty_lines: true
        }));

      parser.on('readable', async function() {
        let record;
        while ((record = parser.read()) !== null) {
          csvRecords.push(record);
        }
      });

      parser.on('error', function(err) {
        console.error('CSV parsing error:', err);
        res.status(500).send("Error parsing CSV file");
      });

      parser.on('end', async function() {
        try {
          const insertPromises = csvRecords.map(async (record) => {
            // Validate required fields
            if (!record.timestamp || !record.category || !record.subcategory || !record.office_location) {
              return { success: false, error: "Missing required fields", record };
            }

            try {
              // Validate timestamp format
              const timestampDate = new Date(record.timestamp);
              if (isNaN(timestampDate.getTime())) {
                return { success: false, error: "Invalid timestamp format", record };
              }

              // Insert visit record
              await db.insert(visits).values({
                timestamp: timestampDate,
                category: record.category,
                subcategory: record.subcategory,
                officeLocation: record.office_location,
                createdBy: req.user.id // Default to current admin user
              });
              
              return { success: true, record };
            } catch (error) {
              console.error("Error inserting visit:", error);
              return { success: false, error: "Database error", record };
            }
          });

          const processResults = await Promise.all(insertPromises);
          
          // Clean up the uploaded file
          fs.unlinkSync(filePath);
          
          const successCount = processResults.filter(r => r.success).length;
          const failedResults = processResults.filter(r => !r.success);

          res.json({
            success: true,
            totalProcessed: processResults.length,
            successCount,
            failedCount: failedResults.length,
            failedRecords: failedResults
          });
        } catch (error) {
          console.error("Error processing CSV records:", error);
          res.status(500).send("Error processing CSV records");
        }
      });
    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).send("Error uploading file");
    }
  });

  // Route zum Leeren der Datenbank (nur für Admins)
  app.post("/api/admin/clear-database", requireAdmin, async (req, res) => {
    try {
      // Lösche alle Besuche
      await db.delete(visits);
      
      res.json({ success: true, message: "Datenbank wurde erfolgreich geleert" });
    } catch (error) {
      console.error("Fehler beim Leeren der Datenbank:", error);
      res.status(500).json({ 
        success: false, 
        message: "Fehler beim Leeren der Datenbank" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}