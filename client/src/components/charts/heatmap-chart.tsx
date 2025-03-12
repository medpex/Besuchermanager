import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Ordnung für Monate
const MONTH_ORDER = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];

// Ordnung für Wochentage
const WEEKDAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Ordnung für Zeitintervalle
const TIME_INTERVAL_ORDER = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

type HeatmapChartProps = {
  title: string;
  data: any[];
  xAxisType: 'category' | 'month' | 'weekday' | 'timeInterval';
  className?: string;
  height?: number;
}

export default function HeatmapChart({ 
  title, 
  data, 
  xAxisType,
  className = "", 
  height = 350 
}: HeatmapChartProps) {
  const [chartOptions, setChartOptions] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!data || !data.length) return;

    // Sammle alle Jahre aus den Daten
    const years = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'name' && !isNaN(parseInt(key))) {
          years.add(key);
        }
      });
    });

    // Konvertiere in ein Array und sortiere (neuestes Jahr zuerst)
    const yearsArray = Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));

    // Sortieren der Daten entsprechend dem Typ
    let sortedData = [...data];
    let categories = [];
    
    if (xAxisType === 'weekday') {
      sortedData.sort((a, b) => WEEKDAY_ORDER.indexOf(a.name) - WEEKDAY_ORDER.indexOf(b.name));
      categories = sortedData.map(item => item.name);
    } else if (xAxisType === 'timeInterval') {
      sortedData.sort((a, b) => TIME_INTERVAL_ORDER.indexOf(a.name) - TIME_INTERVAL_ORDER.indexOf(b.name));
      categories = sortedData.map(item => item.name);
    } else if (xAxisType === 'month') {
      sortedData.sort((a, b) => MONTH_ORDER.indexOf(a.name) - MONTH_ORDER.indexOf(b.name));
      categories = sortedData.map(item => item.name);
    } else {
      // Für normale Kategorien, sortiere nach Häufigkeit
      sortedData.sort((a, b) => {
        const sumA = yearsArray.reduce((sum, year) => sum + (a[year] || 0), 0);
        const sumB = yearsArray.reduce((sum, year) => sum + (b[year] || 0), 0);
        return sumB - sumA;
      });
      // Beschränke Kategorien auf die Top 15
      sortedData = sortedData.slice(0, 15);
      categories = sortedData.map(item => item.name);
    }

    // Erstelle die Heatmap-Serien (ein Jahr pro Zeile)
    const heatmapSeries = yearsArray.map(year => {
      return {
        name: year,
        data: sortedData.map(item => ({
          x: item.name,
          y: item[year] || 0
        }))
      };
    });

    // Chart-Optionen konfigurieren
    const options = {
      chart: {
        height: height,
        type: 'heatmap',
        toolbar: {
          show: false
        },
        fontFamily: 'inherit',
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#fff']
        }
      },
      colors: ["#3b82f6"],
      xaxis: {
        categories: categories,
        labels: {
          rotate: -45,
          style: {
            colors: '#64748b',
            fontWeight: 500,
          }
        }
      },
      title: {
        text: '',
      },
      tooltip: {
        y: {
          formatter: (value: number) => `${value} Besuche`
        }
      },
      grid: {
        padding: {
          top: 0,
          right: 0,
          bottom: 5,
          left: 10
        },
      },
      plotOptions: {
        heatmap: {
          radius: 3,
          enableShades: true,
          shadeIntensity: 0.5,
          colorScale: {
            ranges: [
              {
                from: 0,
                to: 5,
                color: '#b3e0ff',
                name: 'niedrig',
              },
              {
                from: 6,
                to: 10,
                color: '#80c1ff',
                name: 'mittel',
              },
              {
                from: 11,
                to: 20,
                color: '#4da3ff',
                name: 'hoch',
              },
              {
                from: 21,
                to: 1000,
                color: '#0073e6',
                name: 'sehr hoch',
              }
            ]
          }
        }
      },
    };

    setChartOptions(options);
    setSeries(heatmapSeries);
  }, [data, xAxisType, height]);

  if (!mounted || !chartOptions || !series.length) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-normal text-gray-500">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6" style={{ height: `${height}px` }}>
          <p className="text-muted-foreground">Lade Heatmap...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-normal text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-full w-full">
          <ReactApexChart 
            options={chartOptions}
            series={series}
            type="heatmap"
            height={height}
          />
        </div>
      </CardContent>
    </Card>
  );
}