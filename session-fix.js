// session-fix.js
import fs from 'fs';

// Pfad zur auth.ts Datei
const authFilePath = './server/auth.ts';

try {
  // Datei lesen
  let authContent = fs.readFileSync(authFilePath, 'utf8');
  
  // Session-Konfiguration ersetzen
  const oldSessionConfig = /secret: process.env.SESSION_SECRET[^,}]*(,|\})/s;
  const newSessionConfig = `secret: process.env.SESSION_SECRET || "supersecretkey123",
    cookie: { 
      secure: process.env.COOKIE_SECURE === 'false' ? false : true,
      sameSite: process.env.COOKIE_SAMESITE || 'lax'
    }$1`;
  
  authContent = authContent.replace(oldSessionConfig, newSessionConfig);
  
  // Datei schreiben
  fs.writeFileSync(authFilePath, authContent);
  
  console.log('Session-Konfiguration erfolgreich aktualisiert');
} catch (err) {
  console.error('Fehler beim Aktualisieren der Session-Konfiguration:', err);
}