# Besuchererfassungssystem

## Installation

Für die automatische Installation auf einem Ubuntu-Server:

1. Archiv entpacken: `unzip besuchererfassungssystem.zip`
2. In das Verzeichnis wechseln: `cd besuchererfassungssystem`
3. Skript ausführbar machen (falls nötig): `chmod +x install.sh`
4. Installation starten: `sudo ./install.sh`

## Zugangsdaten

Nach erfolgreicher Installation kann das System mit folgenden Zugangsdaten erreicht werden:

- URL: http://[server-ip]:5000
- Benutzername: admin
- Passwort: admin

## Systemverwaltung

- Dienst starten: `sudo systemctl start besuchererfassung`
- Dienst stoppen: `sudo systemctl stop besuchererfassung`
- Dienst neustarten: `sudo systemctl restart besuchererfassung`
- Status prüfen: `sudo systemctl status besuchererfassung`
- Logs anzeigen: `sudo journalctl -u besuchererfassung -f`
