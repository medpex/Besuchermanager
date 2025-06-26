import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Die Farben für unterschiedliche Jahre
const YEAR_COLORS = {
  '2025': '#3b82f6', // blau
  '2024': '#10b981', // grün
  '2023': '#f59e0b', // gelb
  '2022': '#ef4444', // rot
  '2021': '#8b5cf6'  // lila
};

// Kategorie-Farben
const CATEGORY_COLORS = {
  'Media': '#3b82f6',      // blue
  'Energie': '#10b981',    // green
  'Allgemeines': '#f59e0b' // amber
};

// Ordnung für Monate
const MONTH_ORDER = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

// Ordnung für Wochentage
const WEEKDAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Ordnung für Zeitintervalle
const TIME_INTERVAL_ORDER = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

type BarChartProps = {
  title: string;
  data: any[];
  xAxisType: 'category' | 'month' | 'weekday' | 'timeInterval';
  selectedYear?: string; // Optional, um ein bestimmtes Jahr anzuzeigen
  className?: string;
  height?: number;
  stacked?: boolean;
}

export default function BarChart({ 
  title, 
  data, 
  xAxisType,
  selectedYear,
  className = "",
  height = 350,
  stacked = false
}: BarChartProps) {
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
    let yearsArray = Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    
    // Falls ein spezifisches Jahr ausgewählt wurde, nur dieses Jahr verwenden
    if (selectedYear && yearsArray.includes(selectedYear)) {
      yearsArray = [selectedYear];
    }

    // Sortieren der Daten entsprechend dem Typ
    let sortedData = [...data];
    
    if (xAxisType === 'weekday') {
      sortedData.sort((a, b) => WEEKDAY_ORDER.indexOf(a.name) - WEEKDAY_ORDER.indexOf(b.name));
    } else if (xAxisType === 'timeInterval') {
      sortedData.sort((a, b) => TIME_INTERVAL_ORDER.indexOf(a.name) - TIME_INTERVAL_ORDER.indexOf(b.name));
    } else if (xAxisType === 'month') {
      sortedData.sort((a, b) => MONTH_ORDER.indexOf(a.name) - MONTH_ORDER.indexOf(b.name));
    } else {
      // Für normale Kategorien, sortiere nach Häufigkeit
      sortedData.sort((a, b) => {
        const sumA = yearsArray.reduce((sum, year) => sum + (a[year] || 0), 0);
        const sumB = yearsArray.reduce((sum, year) => sum + (b[year] || 0), 0);
        return sumB - sumA;
      });
      // Beschränke Kategorien auf die Top 8 für bessere Lesbarkeit
      sortedData = sortedData.slice(0, 8);
    }

    // Extrahiere Kategorien für die x-Achse
    const categories = sortedData.map(item => item.name);

    // Erstelle die Serien für das Balkendiagramm
    const chartSeries = yearsArray.map(year => {
      return {
        name: `${year}`,
        data: sortedData.map(item => item[year] || 0),
        color: YEAR_COLORS[year] || '#3b82f6'
      };
    });

    // Chart-Optionen konfigurieren
    const options = {
      chart: {
        type: 'bar',
        height: height,
        stacked: stacked,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        },
        fontFamily: 'inherit',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4,
          columnWidth: '60%',
          dataLabels: {
            position: 'top',
          },
        }
      },
      colors: yearsArray.map(year => YEAR_COLORS[year] || '#3b82f6'),
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 5,
          left: 10
        },
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: '#64748b',
            fontWeight: 500,
          },
          rotate: -45,
          offsetY: 0
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        title: {
          text: 'Anzahl Besuche',
          style: {
            color: '#64748b',
            fontWeight: 500,
            fontFamily: 'inherit'
          }
        },
        labels: {
          style: {
            colors: '#64748b',
            fontWeight: 500,
          },
          formatter: (value: number) => Math.round(value).toString(),
        },
      },
      fill: {
        opacity: 0.9,
        type: 'solid'
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (value: number) => `${value} Besuche`
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        offsetY: -10,
        fontWeight: 500,
        fontSize: '13px',
        fontFamily: 'inherit',
        itemMargin: {
          horizontal: 10,
          vertical: 0
        },
        markers: {
          width: 12,
          height: 12,
          radius: 6,
          offsetX: -3
        }
      }
    };

    setChartOptions(options);
    setSeries(chartSeries);
  }, [data, xAxisType, height, stacked, selectedYear]);

  if (!mounted || !chartOptions || !series.length) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-normal text-gray-500">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6" style={{ height: `${height}px` }}>
          <p className="text-muted-foreground">Lade Diagramm...</p>
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
            type="bar"
            height={height}
          />
        </div>
      </CardContent>
    </Card>
  );
}