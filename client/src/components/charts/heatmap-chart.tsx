import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Ordnung für Monate
const MONTH_ORDER = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];

// Ordnung für Wochentage
const WEEKDAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Ordnung für Zeitintervalle
const TIME_INTERVAL_ORDER = [
  '08:00-09:00', 
  '09:00-10:00', 
  '10:00-11:00', 
  '11:00-12:00', 
  '12:00-13:00', 
  '13:00-14:00', 
  '14:00-15:00', 
  '15:00-16:00', 
  '16:00-17:00', 
  '17:00-18:00',
  'Andere Zeit'
];

// Die Farben für unterschiedliche Jahre
const YEAR_COLORS = {
  '2025': '#3b82f6', // blau
  '2024': '#10b981', // grün
  '2023': '#f59e0b', // gelb
  '2022': '#ef4444', // rot
  '2021': '#8b5cf6'  // lila
};

// Farbcodes für Intensitäten
const INTENSITY_COLORS = [
  '#cce7ff', // sehr niedrig (hellblau)
  '#99ceff', // niedrig
  '#66b5ff', // mittel niedrig
  '#339cff', // mittel
  '#0084ff', // mittel hoch
  '#0066cc', // hoch
  '#004c99', // sehr hoch (dunkelblau)
];

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
      // Beschränke Kategorien auf die Top 10 für bessere Lesbarkeit
      sortedData = sortedData.slice(0, 10);
      categories = sortedData.map(item => item.name);
    }

    // Finden des maximalen Wertes für die Farbskalierung
    let maxValue = 0;
    yearsArray.forEach(year => {
      sortedData.forEach(item => {
        if (item[year] > maxValue) {
          maxValue = item[year];
        }
      });
    });

    // Berechne eine sinnvolle Anzahl von Schritten für die Farbskalierung (zwischen 5 und 7)
    const step = Math.max(1, Math.ceil(maxValue / 6));
    
    // Erstelle die Farbskala-Bereiche
    const colorRanges = [];
    let currentValue = 0;
    
    for (let i = 0; i < INTENSITY_COLORS.length; i++) {
      const nextValue = Math.min(maxValue, currentValue + step);
      
      // Letzter Bereich soll alles bis maxValue abdecken
      if (i === INTENSITY_COLORS.length - 1) {
        colorRanges.push({
          from: currentValue,
          to: maxValue,
          color: INTENSITY_COLORS[i],
          name: `${currentValue}+`
        });
      } else {
        // Sonst normale Bereiche erstellen
        colorRanges.push({
          from: currentValue,
          to: nextValue,
          color: INTENSITY_COLORS[i],
          name: `${currentValue} - ${nextValue}`
        });
        currentValue = nextValue + 1;
      }
      
      // Wenn wir maxValue erreicht haben, brechen wir ab
      if (currentValue > maxValue) break;
    }

    // Für eine kalendarartige Darstellung
    let useCalendarView = false;
    let yAxisDataLabels = true;
    
    if (xAxisType === 'month' || xAxisType === 'weekday') {
      useCalendarView = true;
      yAxisDataLabels = false; // für Kalender sehen Achsenbeschriftungen besser aus als Datenlabels
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
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      dataLabels: {
        enabled: yAxisDataLabels,
        style: {
          colors: ['#000'],
          fontSize: '12px',
          fontFamily: 'inherit',
          fontWeight: 'normal'
        },
        formatter: (val: number) => val === 0 ? '' : val.toString()
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        categories: categories,
        position: 'top',
        labels: {
          rotate: useCalendarView ? 0 : -45,
          style: {
            colors: '#64748b',
            fontWeight: 500,
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        labels: {
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
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const value = series[seriesIndex][dataPointIndex];
          const xLabel = w.globals.labels[dataPointIndex];
          const yLabel = w.globals.seriesNames[seriesIndex];
          return `
            <div class="apexcharts-tooltip-custom" style="padding: 8px; background: #fff; border-radius: 4px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <div style="font-weight: 500; margin-bottom: 4px; color: #333;">${xLabel} - ${yLabel}</div>
              <div style="font-size: 14px;">
                <span style="color: ${YEAR_COLORS[yLabel] || '#3b82f6'}; font-weight: 600;">${value} Besuche</span>
              </div>
            </div>
          `;
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
          radius: useCalendarView ? 0 : 4,
          enableShades: true,
          shadeIntensity: 0.5,
          distributed: false,
          useFillColorAsStroke: false,
          colorScale: {
            ranges: colorRanges,
            inverse: false,
            min: 0,
            max: maxValue
          }
        }
      },
      theme: {
        palette: 'palette1'
      }
    };

    setChartOptions(options);
    setSeries(heatmapSeries);
  }, [data, xAxisType, height]);

  if (!mounted || !chartOptions || !series.length || !data?.length) {
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
            type="heatmap"
            height={height}
          />
        </div>
      </CardContent>
    </Card>
  );
}