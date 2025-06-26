import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Info } from "lucide-react";

export default function CsvImportGuide() {
  const downloadSampleCsv = () => {
    // Create sample CSV content
    const headers = ['timestamp', 'category', 'subcategory', 'office_location'];
    const rows = [
      ['2023-06-15T09:30:00.000Z', 'Media', 'Pass', 'Geesthacht'],
      ['2023-07-22T11:15:00.000Z', 'Energie', 'Zählerstand', 'Büchen'],
      ['2023-08-10T14:45:00.000Z', 'Allgemeines', 'Beratung', 'Schwarzenbek'],
      ['2023-09-05T16:20:00.000Z', 'Media', 'Störung', 'Geesthacht'],
      ['2023-10-18T10:05:00.000Z', 'Energie', 'Neuanmeldung', 'Büchen']
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'besucher_vorlage.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSV-Import Anleitung
        </CardTitle>
        <CardDescription>
          Anleitung für das Format der CSV-Datei zum Import von Besucherdaten
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="format">
          <TabsList className="mb-4">
            <TabsTrigger value="format">CSV-Format</TabsTrigger>
            <TabsTrigger value="example">Beispieldaten</TabsTrigger>
            <TabsTrigger value="tips">Tipps</TabsTrigger>
          </TabsList>
          
          <TabsContent value="format">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Erforderliche Spalten</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Spaltenname</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead>Format</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>timestamp</TableCell>
                      <TableCell>Zeitpunkt des Besuchs</TableCell>
                      <TableCell>ISO 8601 (z.B. 2023-06-15T09:30:00.000Z)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>category</TableCell>
                      <TableCell>Hauptkategorie des Anliegens</TableCell>
                      <TableCell>Text (z.B. Media, Energie, Allgemeines)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>subcategory</TableCell>
                      <TableCell>Unterkategorie des Anliegens</TableCell>
                      <TableCell>Text (z.B. Pass, Zählerstand, Beratung)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>office_location</TableCell>
                      <TableCell>Standort des Besuchs</TableCell>
                      <TableCell>Text (Geesthacht, Büchen, Schwarzenbek)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="example">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-2">
                So sollte Ihre CSV-Datei aussehen:
              </p>
              <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
                <pre className="text-xs">
                  timestamp,category,subcategory,office_location<br/>
                  2023-06-15T09:30:00.000Z,Media,Pass,Geesthacht<br/>
                  2023-07-22T11:15:00.000Z,Energie,Zählerstand,Büchen<br/>
                  2023-08-10T14:45:00.000Z,Allgemeines,Beratung,Schwarzenbek<br/>
                  2023-09-05T16:20:00.000Z,Media,Störung,Geesthacht<br/>
                  2023-10-18T10:05:00.000Z,Energie,Neuanmeldung,Büchen
                </pre>
              </div>
              <Button onClick={downloadSampleCsv} variant="outline" size="sm" className="mt-2">
                <Download className="mr-2 h-4 w-4" />
                Beispiel-CSV herunterladen
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="tips">
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-start">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Zeitstempel-Format:</strong> Verwenden Sie das ISO 8601-Format für Zeitstempel (YYYY-MM-DDTHH:MM:SS.sssZ). Die Zeitzone sollte in UTC (Z) oder mit Offset angegeben werden.
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Standorte:</strong> Die Standorte müssen genau wie in der Anwendung geschrieben sein: "Geesthacht", "Büchen" oder "Schwarzenbek".
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Kategorien:</strong> Verwenden Sie die bestehenden Kategorien "Media", "Energie" und "Allgemeines". Neue Kategorien werden automatisch hinzugefügt.
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>CSV-Format:</strong> Stellen Sie sicher, dass Ihre Datei im UTF-8-Format mit Kommas als Trennzeichen gespeichert ist.
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Größenbeschränkung:</strong> Die maximale Dateigröße beträgt 10 MB. Bei größeren Dateien teilen Sie diese bitte in mehrere Dateien auf.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 