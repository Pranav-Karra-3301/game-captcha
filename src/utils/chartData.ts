/**
 * Mock data utilities for chart components
 */

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface SeriesData {
  name: string;
  data: number[];
  color: string;
}

// Helper to generate deterministic but random-looking data
export const generateTimeSeriesData = (
  points: number = 12, 
  min: number = 20, 
  max: number = 90, 
  trend: 'up' | 'down' | 'volatile' | 'stable' = 'volatile',
  seed: number = 0.5 // Use a fixed default seed instead of Math.random()
): number[] => {
  const result: number[] = [];
  let value = min + (max - min) * seed;
  
  for (let i = 0; i < points; i++) {
    // Add the current value
    result.push(Math.round(value * 10) / 10);
    
    // Calculate the next value based on the trend
    const progress = i / (points - 1);
    const volatility = trend === 'stable' ? 0.03 : 0.08;
    const randomFactor = ((Math.sin(i * seed * 10) + 1) / 2) * volatility * (max - min);
    
    switch (trend) {
      case 'up':
        value += (max - min) * 0.1 * (1 - progress) + randomFactor - (volatility * (max - min) / 2);
        value = Math.min(value, max);
        break;
      case 'down':
        value -= (max - min) * 0.1 * (1 - progress) + randomFactor - (volatility * (max - min) / 2);
        value = Math.max(value, min);
        break;
      case 'volatile':
        value += randomFactor - (volatility * (max - min) / 2);
        value = Math.max(min, Math.min(max, value));
        break;
      case 'stable':
        value += randomFactor - (volatility * (max - min) / 2);
        value = Math.max(min, Math.min(max, value));
        break;
    }
  }
  
  return result;
};

// Generate labeled data points for charts
export const generateLabeledData = (
  labels: string[],
  min: number = 20,
  max: number = 90,
  trend: 'up' | 'down' | 'volatile' | 'stable' = 'volatile'
): ChartDataPoint[] => {
  const values = generateTimeSeriesData(labels.length, min, max, trend);
  return labels.map((label, i) => ({
    label,
    value: values[i]
  }));
};

// Generate multiple series data
export const generateMultiSeriesData = (
  seriesCount: number = 3,
  points: number = 12,
  labels?: string[]
): SeriesData[] => {
  const colors = [
    'rgb(59, 130, 246)', // blue
    'rgb(16, 185, 129)', // green
    'rgb(239, 68, 68)',  // red
    'rgb(217, 119, 6)',  // amber
    'rgb(139, 92, 246)'  // purple
  ];
  
  const trends: Array<'up' | 'down' | 'volatile' | 'stable'> = ['up', 'down', 'volatile', 'stable'];
  
  return Array.from({ length: seriesCount }).map((_, i) => ({
    name: `Series ${i + 1}`,
    data: generateTimeSeriesData(
      points,
      20 + (i * 5),
      70 + (i * 5),
      trends[i % trends.length],
      0.3 + (i * 0.1)
    ),
    color: colors[i % colors.length]
  }));
};

// Predefined data sets
export const modelAccuracyData = generateTimeSeriesData(10, 50, 95, 'up', 0.7);
export const trainingLossData = generateTimeSeriesData(10, 10, 80, 'down', 0.4);
export const rewardProgressData = generateTimeSeriesData(15, 30, 90, 'up', 0.6);
export const explorationRateData = generateTimeSeriesData(15, 20, 90, 'down', 0.9);

// Distribution data for categorical charts
export const trainingDistributionData: ChartDataPoint[] = [
  { label: 'Forward', value: 35 },
  { label: 'Backward', value: 15 },
  { label: 'Left', value: 20 },
  { label: 'Right', value: 22 },
  { label: 'Shoot', value: 38 }
];

// Resource usage data
export const resourceUsageData: ChartDataPoint[] = [
  { label: 'CPU', value: 78 },
  { label: 'Memory', value: 65 },
  { label: 'GPU', value: 92 },
  { label: 'Disk', value: 34 }
];

// Time period labels
export const timeLabels = {
  hourly: Array.from({ length: 24 }).map((_, i) => `${i}:00`),
  daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  weekly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}; 