import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useVisits } from "@/hooks/use-visits";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

const categories = {
  Media: [
    "Media allgemeine Beratung",
    "Media Vertragsabschluss", 
    "Media Kündigung",
    "Media Kundenverwaltung",
    "Media Technik/HA",
    "Media Rechnungen/FM",
    "Mobilfunk",
    "Media Beschwerde",
    "Media Aktion"
  ],
  Energie: [
    "Energie allgemeine Beratung",
    "Energie Vertragsabschluss",
    "Energie Kündigung/Abmeldung",
    "Energie/Kundenverwaltung",
    "Energie Technik/HA",
    "Energie Rechnungen/FM",
    "Wärme",
    "Energie Beschwerde",
    "E-Mobilität",
    "PV/ Balkonkraftwerk",
    "Energie Aktion"
  ],
  Allgemeines: [
    "Allg. Beschwerden",
    "Umzugskartons",
    "Allg. Aktion",
    "FZB",
    "Netz Anfragen",
    "Sonstige Anliegen"
  ]
};

type VisitorFormData = {
  category: string;
  subcategory: string;
  officeLocation: string;
};

// Typ für die persistierten Besucherdaten
type PersistedVisitorData = {
  date: string;
  selectedOffice: string;
  visitorCount: number;
};

export default function VisitorForm() {
  const { createVisit } = useVisits();
  const { toast } = useToast();
  const { user } = useUser(); // Hier den aktuellen Benutzer abrufen
  const [selectedOffice, setSelectedOffice] = useState<string>("");
  const [visitorCount, setVisitorCount] = useState(0);

  // Eindeutigen Schlüssel für jeden Benutzer erstellen
  const storageKey = `visitorFormData_${user?.id || 'default'}`;

  // Beim Initialen Laden die gespeicherten Daten abrufen
  useEffect(() => {
    if (!user) return; // Nur wenn Benutzer eingeloggt ist

    const loadPersistedData = () => {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData) as PersistedVisitorData;

        // Überprüfen, ob die gespeicherten Daten vom aktuellen Tag sind
        const today = new Date().toISOString().split('T')[0];

        if (parsed.date === today) {
          // Daten vom heutigen Tag verwenden
          setSelectedOffice(parsed.selectedOffice);
          setVisitorCount(parsed.visitorCount);
        } else {
          // Bei einem neuen Tag den Standort beibehalten, aber Zähler zurücksetzen
          setSelectedOffice(parsed.selectedOffice);
          setVisitorCount(0);

          // Aktualisierte Daten speichern
          persistData(parsed.selectedOffice, 0);
        }
      }
    };

    loadPersistedData();
  }, [user, storageKey]); // Abhängigkeit von user und storageKey

  // Funktion zum Speichern der Daten im localStorage
  const persistData = (office: string, count: number) => {
    if (!user) return; // Nur wenn Benutzer eingeloggt ist

    const today = new Date().toISOString().split('T')[0];
    const dataToSave: PersistedVisitorData = {
      date: today,
      selectedOffice: office,
      visitorCount: count
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  };

  // Standort setzen und persistieren
  const handleOfficeSelection = (office: string) => {
    setSelectedOffice(office);
    persistData(office, visitorCount);
  };

  // Zähler zurücksetzen und persistieren
  const resetCounter = () => {
    setVisitorCount(0);
    persistData(selectedOffice, 0);
    toast({
      title: "Zähler zurückgesetzt",
      description: "Die Besucherzählung wurde zurückgesetzt."
    });
  };

  if (!selectedOffice) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bitte wählen Sie Ihren Standort</h3>
        <div className="grid grid-cols-3 gap-4">
          {["Geesthacht", "Büchen", "Schwarzenbek"].map((office) => (
            <Button
              key={office}
              onClick={() => handleOfficeSelection(office)}
              className="h-24 text-lg"
              variant="outline"
            >
              {office}
            </Button>
          ))}
        </div>
      </Card>
    );
  }

  const handleVisit = async (category: string, subcategory: string) => {
    await createVisit({
      category,
      subcategory,
      officeLocation: selectedOffice,
    });
    const newCount = visitorCount + 1;
    setVisitorCount(newCount);
    persistData(selectedOffice, newCount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Standort: {selectedOffice}</h3>
          <div className="text-2xl font-bold mt-2">
            Besucheranzahl: {visitorCount}
          </div>
        </div>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            onClick={resetCounter}
            className="block w-full"
          >
            Zähler zurücksetzen
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleOfficeSelection("")}
            className="block w-full"
          >
            Standort ändern
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Media Section - Purple */}
        <div className="space-y-2">
          {categories.Media.map((subcategory) => (
            <Button
              key={subcategory}
              onClick={() => handleVisit("Media", subcategory)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {subcategory}
            </Button>
          ))}
        </div>

        {/* Energy Section - Yellow */}
        <div className="space-y-2">
          {categories.Energie.map((subcategory) => (
            <Button
              key={subcategory}
              onClick={() => handleVisit("Energie", subcategory)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {subcategory}
            </Button>
          ))}
        </div>

        {/* General Section - Green */}
        <div className="space-y-2">
          {categories.Allgemeines.map((subcategory) => (
            <Button
              key={subcategory}
              onClick={() => handleVisit("Allgemeines", subcategory)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {subcategory}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}