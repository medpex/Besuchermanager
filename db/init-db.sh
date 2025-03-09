#!/bin/bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Erstelle Benutzer- und Besuchertabellen, falls sie nicht existieren
    
    -- Benutzertabelle
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE
    );

    -- Besuchertabelle
    CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        category TEXT NOT NULL,
        subcategory TEXT NOT NULL,
        office_location TEXT NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id)
    );
EOSQL