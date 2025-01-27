import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema, type SelectUser } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString('hex');
    const hash = await scryptAsync(password, salt, 32) as Buffer;
    return salt + ':' + hash.toString('hex');
  },

  verify: async (password: string, hashedPassword: string) => {
    try {
      console.log('Verifying password...');
      const [salt, storedHash] = hashedPassword.split(':');

      if (!salt || !storedHash) {
        console.log('Invalid stored hash format');
        return false;
      }

      const hash = await scryptAsync(password, salt, 32) as Buffer;
      const hashHex = hash.toString('hex');
      const match = storedHash === hashHex;

      console.log('Password verification completed. Match:', match);
      return match;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }
};

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "local-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = {
      secure: true,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Authentication attempt for username:", username);

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          console.log("User not found:", username);
          return done(null, false, { message: "Incorrect username." });
        }

        console.log("Found user:", username);
        const isValid = await crypto.verify(password, user.password);

        if (!isValid) {
          console.log("Invalid password for user:", username);
          return done(null, false, { message: "Incorrect password." });
        }

        console.log("Authentication successful for user:", username);
        return done(null, user);
      } catch (err) {
        console.error("Authentication error:", err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user:", id);
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      console.error("Deserialization error:", err);
      done(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login request received for username:", req.body.username);

    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      const errorMessage = "Invalid input: " + result.error.issues.map((i) => i.message).join(", ");
      console.log("Login validation failed:", errorMessage);
      return res.status(400).send(errorMessage);
    }

    const cb = (err: any, user: Express.User | false, info: IVerifyOptions) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }

      if (!user) {
        console.log("Login failed:", info.message);
        return res.status(400).send(info.message ?? "Login failed");
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Login session error:", err);
          return next(err);
        }

        console.log("Login successful for user:", user.username);
        return res.json({
          message: "Login successful",
          user: { id: user.id, username: user.username, isAdmin: user.isAdmin },
        });
      });
    };

    passport.authenticate("local", cb)(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    const username = req.user?.username;
    console.log("Logout request received for user:", username);

    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).send("Logout failed");
      }
      console.log("Logout successful for user:", username);
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      console.log("User session found:", req.user.username);
      return res.json(req.user);
    }
    console.log("No authenticated session found");
    res.status(401).send("Not logged in");
  });

  // Admin password reset endpoint with simpler hashing
  app.post("/api/reset-admin", async (req, res) => {
    try {
      console.log("Resetting admin password...");
      const hashedPassword = await crypto.hash("admin");
      console.log("Generated hash for admin:", hashedPassword);

      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.username, "admin"));

      console.log("Admin password reset successful");
      res.json({ message: "Admin password reset successfully" });
    } catch (error) {
      console.error("Error resetting admin password:", error);
      res.status(500).send("Failed to reset admin password");
    }
  });
}