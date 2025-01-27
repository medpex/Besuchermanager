import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull()
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  officeLocation: text("office_location").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const insertVisitSchema = createInsertSchema(visits);
export const selectVisitSchema = createSelectSchema(visits);
export type InsertVisit = typeof visits.$inferInsert;
export type SelectVisit = typeof visits.$inferSelect;
