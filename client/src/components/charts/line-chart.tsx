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

type LineChartProps = {
  title: string;
  data: any[];
  xAxisType: 'category' | 'month' | 'weekday' | 'timeInterval';
  className?: string;
  height?: number;
}

// Ordnung für Wochentage
const WEEKDAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Ordnung für Zeitintervalle
const TIME_INTERVAL_ORDER = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00'];

// Ordnung für Monate
const MONTH_ORDER = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

export default function LineChart({ 
  title, 
  data, 
  xAxisType,
  className = "", 
  height = 350 
}: LineChartProps) {
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

    // Konvertiere in ein Array und sortiere
    const yearsArray = Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));

    // Sortieren der Daten entsprechend dem Typ
    let sortedData = [...data];
    if (xAxisType === 'weekday') {
      sortedData.sort((a, b) => WEEKDAY_ORDER.indexOf(a.name) - WEEKDAY_ORDER.indexOf(b.name));
    } else if (xAxisType === 'timeInterval') {
      sortedData.sort((a, b) => TIME_INTERVAL_ORDER.indexOf(a.name) - TIME_INTERVAL_ORDER.indexOf(b.name));
    } else if (xAxisType === 'month') {
      sortedData.sort((a, b) => MONTH_ORDER.indexOf(a.name) - MONTH_ORDER.indexOf(b.name));
    }

    // Extrahieren der x-Achsen-Kategorien
    const categories = sortedData.map(item => item.name);

    // Erstellen der Datenreihen für jedes Jahr
    const chartSeries = yearsArray.map(year => ({
      name: year,
      data: sortedData.map(item => item[year] || 0)
    }));

    // Chart-Optionen konfigurieren
    const options = {
      chart: {
        height: height,
        type: 'line',
        toolbar: {
          show: false,
        },
        fontFamily: 'inherit',
      },
      colors: yearsArray.map(year => YEAR_COLORS[year] || '#888'),
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      grid: {
        borderColor: '#e0e0e0',
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        padding: {
          top: 0,
          right: 10,
          bottom: 10,
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
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#64748b',
            fontWeight: 500,
          },
          formatter: (value: number) => Math.round(value).toString(),
        },
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false
        },
        y: {
          formatter: (value: number) => `${value} Besuche`
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
        fontSize: '14px',
        markers: {
          width: 12,
          height: 12,
          strokeWidth: 0,
          radius: 12,
          offsetX: -4,
          offsetY: 1
        },
        itemMargin: {
          horizontal: 10,
          vertical: 8
        }
      },
    };

    setChartOptions(options);
    setSeries(chartSeries);
  }, [data, xAxisType, height]);

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
            type="line"
            height={height}
          />
        </div>
      </CardContent>
    </Card>
  );
}