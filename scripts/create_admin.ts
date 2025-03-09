import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "../db";
import { users } from "../db/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
  const hashedPassword = await hashPassword("admin123");
  
  try {
    // Prüfe zuerst, ob der Admin bereits existiert
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin")
    });
    
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }
    
    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      isAdmin: true
    });
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

createAdmin().catch(console.error);
