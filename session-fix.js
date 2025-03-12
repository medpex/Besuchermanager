/**
 * Cookie-Einstellungen für Docker-Umgebung anpassen
 * Dieses Skript wird beim Start des Docker-Containers ausgeführt
 */
const fs = require('fs');
const path = require('path');

// Pfad zur auth.ts Datei
const authPath = path.join(__dirname, 'server', 'auth.ts');

// Überprüfen, ob die Datei existiert
if (!fs.existsSync(authPath)) {
  console.error(`Datei nicht gefunden: ${authPath}`);
  process.exit(1);
}

// Dateiinhalt lesen
let content = fs.readFileSync(authPath, 'utf8');

// Cookie-Einstellungen für Docker-Umgebung anpassen
// secure: false - da wir kein HTTPS in der Docker-Umgebung verwenden
// sameSite: 'lax' - für bessere Kompatibilität
const securePattern = /secure:\s*true/g;
const sameSitePattern = /sameSite:\s*'strict'/g;

// Änderungen vornehmen
content = content.replace(securePattern, 'secure: false');
content = content.replace(sameSitePattern, "sameSite: 'lax'");

// Geänderten Inhalt zurückschreiben
fs.writeFileSync(authPath, content, 'utf8');
console.log('Cookie-Einstellungen für Docker-Umgebung angepasst:');
console.log(' - secure: false (HTTP statt HTTPS)');
console.log(" - sameSite: 'lax' (verbesserte Kompatibilität)");