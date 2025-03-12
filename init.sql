-- Tabellen erstellen
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS visits (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  office_location TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id) NOT NULL
);

-- Admin-Benutzer erstellen (Passwort: J123654789j)
INSERT INTO users (username, password, is_admin) 
VALUES ('admin', '1abb6f374c76b34f25cfa6b9a5eeba29df9ecdfec0157760f461c370ec32debb1aa6f12887c3c1de1d3bb9e599c52b76915c1bc294480abb35ac6fb1ecac32a0.ddf9ff73c2a87b5df300ac75c9671859', TRUE);

-- Normalen Benutzer erstellen (Passwort: user123)
INSERT INTO users (username, password, is_admin) 
VALUES ('benutzer', '3ace64ccca6a4f5887f42c210b3f21a9e9bb2ed442cc72df2ff0c39f93725b766ed41c9b61c95592b4a0f3de98d9b6ed13f34b222ef578c33f9cd908582123b7.5e6ff1b2ca4de2f4b7b773671d75f106', FALSE);

-- Beispieldaten: Besuche
-- Heutige Besuche für Geesthacht
INSERT INTO visits (timestamp, category, subcategory, office_location, created_by) VALUES
(NOW(), 'Media', 'Media allgemeine Beratung', 'Geesthacht', 1),
(NOW(), 'Media', 'Media Vertragsabschluss', 'Geesthacht', 1),
(NOW(), 'Energie', 'Energie allgemeine Beratung', 'Geesthacht', 1),
(NOW(), 'Sonstiges', 'Beschwerden', 'Geesthacht', 1);

-- Besuche vom Vortag für Büchen
INSERT INTO visits (timestamp, category, subcategory, office_location, created_by) VALUES
(NOW() - INTERVAL '1 day', 'Media', 'Media Kundenverwaltung', 'Büchen', 2),
(NOW() - INTERVAL '1 day', 'Media', 'Media Technik/HA', 'Büchen', 2),
(NOW() - INTERVAL '1 day', 'Energie', 'Energie Vertragsabschluss', 'Büchen', 2),
(NOW() - INTERVAL '1 day', 'Energie', 'Energie/Kundenverwaltung', 'Büchen', 2);

-- Besuche von letzter Woche für Schwarzenbek
INSERT INTO visits (timestamp, category, subcategory, office_location, created_by) VALUES
(NOW() - INTERVAL '7 days', 'Media', 'Media Rechnungen/FM', 'Schwarzenbek', 1),
(NOW() - INTERVAL '7 days', 'Energie', 'Energie Rechnungen/FM', 'Schwarzenbek', 1),
(NOW() - INTERVAL '7 days', 'Energie', 'Energie Technik/HA', 'Schwarzenbek', 1),
(NOW() - INTERVAL '7 days', 'Sonstiges', 'E-Mobilität/PV', 'Schwarzenbek', 1),
(NOW() - INTERVAL '7 days', 'Sonstiges', 'E-Bike Verleih', 'Schwarzenbek', 1),
(NOW() - INTERVAL '7 days', 'Sonstiges', 'Shop', 'Schwarzenbek', 1);

-- Weitere historische Besuche (zufällig verteilt)
DO $$
DECLARE
  random_date TIMESTAMP;
  category_name TEXT;
  subcategory_name TEXT;
  office_name TEXT;
  user_id INTEGER;
  r FLOAT;
BEGIN
  FOR i IN 1..50 LOOP
    -- Zufälliges Datum innerhalb der letzten 30 Tage
    random_date := NOW() - (INTERVAL '1 day' * (random() * 30)::INTEGER);
    
    -- Zufällige Kategorie
    r := random();
    IF r < 0.33 THEN
      category_name := 'Media';
      -- Zufällige Subkategorie für Media
      r := random();
      IF r < 0.17 THEN subcategory_name := 'Media allgemeine Beratung';
      ELSIF r < 0.34 THEN subcategory_name := 'Media Vertragsabschluss';
      ELSIF r < 0.51 THEN subcategory_name := 'Media Kündigung';
      ELSIF r < 0.68 THEN subcategory_name := 'Media Kundenverwaltung';
      ELSIF r < 0.85 THEN subcategory_name := 'Media Technik/HA';
      ELSE subcategory_name := 'Media Rechnungen/FM';
      END IF;
    ELSIF r < 0.66 THEN
      category_name := 'Energie';
      -- Zufällige Subkategorie für Energie
      r := random();
      IF r < 0.17 THEN subcategory_name := 'Energie allgemeine Beratung';
      ELSIF r < 0.34 THEN subcategory_name := 'Energie Vertragsabschluss';
      ELSIF r < 0.51 THEN subcategory_name := 'Energie Kündigung/Abmeldung';
      ELSIF r < 0.68 THEN subcategory_name := 'Energie/Kundenverwaltung';
      ELSIF r < 0.85 THEN subcategory_name := 'Energie Technik/HA';
      ELSE subcategory_name := 'Energie Rechnungen/FM';
      END IF;
    ELSE
      category_name := 'Sonstiges';
      -- Zufällige Subkategorie für Sonstiges
      r := random();
      IF r < 0.14 THEN subcategory_name := 'E-World';
      ELSIF r < 0.28 THEN subcategory_name := 'Beschwerden';
      ELSIF r < 0.42 THEN subcategory_name := 'E-Mobilität/PV';
      ELSIF r < 0.56 THEN subcategory_name := 'E-Bike Verleih';
      ELSIF r < 0.70 THEN subcategory_name := 'Umzugskartons';
      ELSIF r < 0.84 THEN subcategory_name := 'FZB';
      ELSE subcategory_name := 'Shop';
      END IF;
    END IF;
    
    -- Zufälliger Standort
    r := random();
    IF r < 0.33 THEN office_name := 'Geesthacht';
    ELSIF r < 0.66 THEN office_name := 'Büchen';
    ELSE office_name := 'Schwarzenbek';
    END IF;
    
    -- Zufälliger Benutzer
    user_id := CASE WHEN random() < 0.5 THEN 1 ELSE 2 END;
    
    -- Einfügen des Besuchs
    INSERT INTO visits (timestamp, category, subcategory, office_location, created_by)
    VALUES (random_date, category_name, subcategory_name, office_name, user_id);
  END LOOP;
END $$;