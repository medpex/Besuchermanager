-- Initialisierungsskript für die PostgreSQL-Datenbank im Docker-Container
-- Dieses Skript wird beim ersten Start des Containers automatisch ausgeführt

-- Tabellen erstellen
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    office_location VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Standard-Admin-Benutzer erstellen
INSERT INTO users (username, password, display_name, is_admin)
VALUES 
    ('admin', '21da697a798615b0a779499f0c8fc402cb086daab8c33f8e8507e8a79660ba1ccb5465e44cfc6d0a6b766451629f85c3b550d42b1b55c1e1a0e89dfeb0e6bbe2.f69131d310d2a378a3c5ff084df3f06d', 'Administrator', TRUE),
    ('benutzer', '1c18ebf7b269f7b99b599f939295c792f5c63aec8a5ad7c7d358341c049d8083acd524d266b8272bf91807532e7734b70f1af4fd4c867d0980667feef4ad09e9.04730a13fadcfff6387a6cdd81f38d46', 'Benutzer', FALSE)
ON CONFLICT (username) DO NOTHING;

-- Einige Beispiel-Besuche einfügen, wenn die Tabelle leer ist
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM visits) = 0 THEN
        -- Benutzer-IDs abrufen
        DECLARE
            admin_id INTEGER := (SELECT id FROM users WHERE username = 'admin');
            user_id INTEGER := (SELECT id FROM users WHERE username = 'benutzer');
        BEGIN
            -- Beispieldaten für verschiedene Kategorien und Standorte einfügen
            -- Geesthacht
            INSERT INTO visits (category, subcategory, office_location, timestamp, created_by)
            VALUES 
                ('Beratungsgespräch', 'Wohngeld', 'Geesthacht', NOW() - INTERVAL '1 day', admin_id),
                ('Beratungsgespräch', 'Sozialhilfe', 'Geesthacht', NOW() - INTERVAL '2 day', admin_id),
                ('Antragstellung', 'Wohngeld', 'Geesthacht', NOW() - INTERVAL '3 day', user_id),
                ('Antragstellung', 'Sozialhilfe', 'Geesthacht', NOW() - INTERVAL '4 day', user_id),
                ('Informationen', 'Allgemein', 'Geesthacht', NOW() - INTERVAL '5 day', admin_id);
                
            -- Büchen
            INSERT INTO visits (category, subcategory, office_location, timestamp, created_by)
            VALUES 
                ('Beratungsgespräch', 'Wohngeld', 'Büchen', NOW() - INTERVAL '1 day', user_id),
                ('Beratungsgespräch', 'Sozialhilfe', 'Büchen', NOW() - INTERVAL '2 day', user_id),
                ('Antragstellung', 'Wohngeld', 'Büchen', NOW() - INTERVAL '3 day', admin_id),
                ('Antragstellung', 'Bürgergeld', 'Büchen', NOW() - INTERVAL '4 day', admin_id),
                ('Informationen', 'Allgemein', 'Büchen', NOW() - INTERVAL '5 day', user_id);
                
            -- Schwarzenbek
            INSERT INTO visits (category, subcategory, office_location, timestamp, created_by)
            VALUES 
                ('Beratungsgespräch', 'Bürgergeld', 'Schwarzenbek', NOW() - INTERVAL '1 day', admin_id),
                ('Beratungsgespräch', 'Sozialhilfe', 'Schwarzenbek', NOW() - INTERVAL '2 day', user_id),
                ('Antragstellung', 'Bürgergeld', 'Schwarzenbek', NOW() - INTERVAL '3 day', user_id),
                ('Antragstellung', 'Wohngeld', 'Schwarzenbek', NOW() - INTERVAL '4 day', admin_id),
                ('Informationen', 'Allgemein', 'Schwarzenbek', NOW() - INTERVAL '5 day', user_id);
                
            -- Weitere Einträge für statistische Verteilung
            INSERT INTO visits (category, subcategory, office_location, timestamp, created_by)
            SELECT
                CASE WHEN random() < 0.33 THEN 'Beratungsgespräch' WHEN random() < 0.66 THEN 'Antragstellung' ELSE 'Informationen' END,
                CASE WHEN random() < 0.25 THEN 'Wohngeld' WHEN random() < 0.5 THEN 'Sozialhilfe' WHEN random() < 0.75 THEN 'Bürgergeld' ELSE 'Allgemein' END,
                CASE WHEN random() < 0.33 THEN 'Geesthacht' WHEN random() < 0.66 THEN 'Büchen' ELSE 'Schwarzenbek' END,
                NOW() - (random() * 365 * 2 || ' days')::INTERVAL,
                CASE WHEN random() < 0.5 THEN admin_id ELSE user_id END
            FROM generate_series(1, 100);
        END;
    END IF;
END $$;