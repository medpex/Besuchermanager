/**
 * Datenbank-Initialisierungsskript für das Besuchererfassungssystem
 * Erstellt die Datenbankstruktur und fügt Beispieldaten ein
 */

const { db } = require("./db");
const { users, visits } = require("./db/schema");
const { hashPassword } = require("./server/utils/crypto");

async function initializeDatabase() {
  try {
    console.log("Starte Datenbankinitialisierung...");

    // 1. Admin-Benutzer erstellen
    console.log("Erstelle Admin-Benutzer...");
    const adminPassword = await hashPassword("admin123");
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      isAdmin: true
    }).returning();

    console.log(`Admin-Benutzer erstellt mit ID: ${adminUser.id}`);

    // 2. Normalen Benutzer erstellen
    console.log("Erstelle normalen Benutzer...");
    const userPassword = await hashPassword("user123");
    const [normalUser] = await db.insert(users).values({
      username: "benutzer",
      password: userPassword,
      isAdmin: false
    }).returning();

    console.log(`Normaler Benutzer erstellt mit ID: ${normalUser.id}`);

    // 3. Beispiel-Besuche hinzufügen
    console.log("Füge Beispiel-Besuche hinzu...");

    // Aktuelle Datum generieren, um realistische Daten zu haben
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Einige Beispielbesuche für verschiedene Kategorien und Standorte
    const sampleVisits = [
      // Besuche für heute
      {
        timestamp: new Date(),
        category: "Media",
        subcategory: "Media allgemeine Beratung",
        officeLocation: "Geesthacht",
        createdBy: adminUser.id
      },
      {
        timestamp: new Date(),
        category: "Media",
        subcategory: "Media Vertragsabschluss",
        officeLocation: "Geesthacht",
        createdBy: adminUser.id
      },
      {
        timestamp: new Date(),
        category: "Energie",
        subcategory: "Energie allgemeine Beratung",
        officeLocation: "Geesthacht",
        createdBy: adminUser.id
      },
      {
        timestamp: new Date(),
        category: "Sonstiges",
        subcategory: "Beschwerden",
        officeLocation: "Geesthacht",
        createdBy: adminUser.id
      },
      // Besuche für gestern
      {
        timestamp: yesterday,
        category: "Media",
        subcategory: "Media Kundenverwaltung",
        officeLocation: "Büchen",
        createdBy: normalUser.id
      },
      {
        timestamp: yesterday,
        category: "Media",
        subcategory: "Media Technik/HA",
        officeLocation: "Büchen",
        createdBy: normalUser.id
      },
      {
        timestamp: yesterday,
        category: "Energie",
        subcategory: "Energie Vertragsabschluss",
        officeLocation: "Büchen",
        createdBy: normalUser.id
      },
      {
        timestamp: yesterday,
        category: "Energie",
        subcategory: "Energie/Kundenverwaltung",
        officeLocation: "Büchen",
        createdBy: normalUser.id
      },
      // Besuche für letzte Woche
      {
        timestamp: lastWeek,
        category: "Media",
        subcategory: "Media Rechnungen/FM",
        officeLocation: "Schwarzenbek",
        createdBy: adminUser.id
      },
      {
        timestamp: lastWeek,
        category: "Energie",
        subcategory: "Energie Rechnungen/FM",
        officeLocation: "Schwarzenbek",
        createdBy: adminUser.id
      },
      {
        timestamp: lastWeek,
        category: "Energie",
        subcategory: "Energie Technik/HA",
        officeLocation: "Schwarzenbek",
        createdBy: adminUser.id
      },
      {
        timestamp: lastWeek,
        category: "Sonstiges",
        subcategory: "E-Mobilität/PV",
        officeLocation: "Schwarzenbek",
        createdBy: adminUser.id
      },
      {
        timestamp: lastWeek,
        category: "Sonstiges",
        subcategory: "E-Bike Verleih",
        officeLocation: "Schwarzenbek",
        createdBy: adminUser.id
      },
      {
        timestamp: lastWeek,
        category: "Sonstiges",
        subcategory: "Shop",
        officeLocation: "Schwarzenbek",
        createdBy: adminUser.id
      },
    ];

    // Füge weitere zufällige Besuche hinzu, um mehr Daten für Statistiken zu haben
    const categories = ["Media", "Energie", "Sonstiges"];
    const subcategories = {
      "Media": [
        "Media allgemeine Beratung",
        "Media Vertragsabschluss", 
        "Media Kündigung",
        "Media Kundenverwaltung",
        "Media Technik/HA",
        "Media Rechnungen/FM"
      ],
      "Energie": [
        "Energie allgemeine Beratung",
        "Energie Vertragsabschluss",
        "Energie Kündigung/Abmeldung",
        "Energie/Kundenverwaltung",
        "Energie Technik/HA",
        "Energie Rechnungen/FM"
      ],
      "Sonstiges": [
        "E-World",
        "Beschwerden",
        "E-Mobilität/PV",
        "E-Bike Verleih",
        "Umzugskartons",
        "FZB",
        "Shop"
      ]
    };
    const locations = ["Geesthacht", "Büchen", "Schwarzenbek"];
    const users = [adminUser.id, normalUser.id];

    // Generiere 50 zufällige historische Besuche für die letzten 30 Tage
    for (let i = 0; i < 50; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const subcategoryList = subcategories[category];
      const subcategory = subcategoryList[Math.floor(Math.random() * subcategoryList.length)];
      
      sampleVisits.push({
        timestamp: randomDate,
        category,
        subcategory,
        officeLocation: locations[Math.floor(Math.random() * locations.length)],
        createdBy: users[Math.floor(Math.random() * users.length)]
      });
    }

    // Füge alle Beispielbesuche in die Datenbank ein
    await db.insert(visits).values(sampleVisits);

    console.log(`${sampleVisits.length} Beispiel-Besuche wurden hinzugefügt.`);
    console.log("Datenbankinitialisierung erfolgreich abgeschlossen!");
    
    console.log("\nZugangsdaten für die Anwendung:");
    console.log("  Admin: username='admin', password='admin123'");
    console.log("  Benutzer: username='benutzer', password='user123'");
    
  } catch (error) {
    console.error("Fehler bei der Datenbankinitialisierung:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Führe die Initialisierung aus
initializeDatabase();
