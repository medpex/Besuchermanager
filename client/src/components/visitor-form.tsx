import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useVisits } from "@/hooks/use-visits";

const categories = {
  Media: [
    "Media allgemeine Beratung",
    "Media Vertragsabschluss", 
    "Media Kündigung",
    "Media Kundenverwaltung",
    "Media Technik/HA",
    "Media Rechnungen/FM"
  ],
  Energie: [
    "Energie allgemeine Beratung",
    "Energie Vertragsabschluss",
    "Energie Kündigung/Abmeldung",
    "Energie/Kundenverwaltung",
    "Energie Technik/HA",
    "Energie Rechnungen/FM"
  ],
  Sonstiges: [
    "E-World",
    "Beschwerden",
    "E-Mobilität/PV",
    "E-Bike Verleih",
    "Umzugskartons",
    "FZB",
    "Shop"
  ]
};

type VisitorFormData = {
  category: string;
  subcategory: string;
  officeLocation: string;
};

export default function VisitorForm() {
  const { createVisit } = useVisits();
  const [selectedOffice, setSelectedOffice] = useState<string>("");
  const [visitorCount, setVisitorCount] = useState(0);

  if (!selectedOffice) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bitte wählen Sie Ihren Standort</h3>
        <div className="grid grid-cols-3 gap-4">
          {["Geesthacht", "Büchen", "Schwarzenbek"].map((office) => (
            <Button
              key={office}
              onClick={() => setSelectedOffice(office)}
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
    setVisitorCount(prev => prev + 1);
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
            onClick={() => setVisitorCount(0)}
            className="block w-full"
          >
            Zähler zurücksetzen
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedOffice("")}
            className="block w-full"
          >
            Standort ändern
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
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
          {categories.Sonstiges.map((subcategory) => (
            <Button
              key={subcategory}
              onClick={() => handleVisit("Sonstiges", subcategory)}
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