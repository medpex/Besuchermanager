// Dieses Skript modifiziert die Konfiguration der Cookies für die Docker-Umgebung
// Es wird vor dem Start des Servers im Docker-Container ausgeführt

const fs = require('fs');
const path = require('path');

// Pfad zur Auth-Datei
const authFilePath = path.join(__dirname, 'server', 'auth.ts');

try {
  console.log('Lese server/auth.ts...');
  let authContent = fs.readFileSync(authFilePath, 'utf8');
  
  // Suche nach Cookie-Konfigurationen
  const originalCookieConfig = authContent.match(/cookie: {[^}]*}/g);
  
  if (originalCookieConfig && originalCookieConfig.length > 0) {
    console.log('Gefundene Cookie-Konfiguration:', originalCookieConfig[0]);
    
    // Modifiziere die Cookie-Einstellungen für Docker
    // - sameSite: 'lax' für Docker-Umgebung
    // - secure: false da wir in Docker nicht HTTPS erzwingen
    const newCookieConfig = `cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    }`;
    
    // Ersetze die Cookie-Konfiguration
    authContent = authContent.replace(/cookie: {[^}]*}/g, newCookieConfig);
    
    // Schreibe die modifizierte Datei
    fs.writeFileSync(authFilePath, authContent, 'utf8');
    console.log('Cookie-Konfiguration erfolgreich aktualisiert für Docker-Umgebung');
  } else {
    console.error('Keine Cookie-Konfiguration in auth.ts gefunden');
  }
} catch (error) {
  console.error('Fehler beim Aktualisieren der Cookie-Konfiguration:', error);
  process.exit(1);
}