// Helper functions to generate realistic data
const generateTrendingData = (
  points: number, 
  startValue: number, 
  maxValue: number, 
  volatility: number, 
  improvementRate: number
): number[] => {
  let result = [];
  let currentValue = startValue;
  
  for (let i = 0; i < points; i++) {
    // Add some random volatility
    const randomFactor = (Math.random() * 2 - 1) * volatility;
    
    // General upward trend with occasional plateaus
    const improvementFactor = Math.random() < 0.8 ? improvementRate : 0;
    
    // Calculate new value with constraints
    currentValue = Math.min(
      maxValue,
      Math.max(0, currentValue + randomFactor + improvementFactor)
    );
    
    result.push(Number(currentValue.toFixed(2)));
  }
  
  return result;
};

const generateDates = (days: number): string[] => {
  const dates = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

// Generate hours for a day
const generateHours = (): string[] => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return hours;
};

// Dashboard Data - Daily View
export const getDashboardDailyData = () => {
  // Hourly timestamps
  const hours = generateHours();
  
  // Computational resources usage (GPU/CPU hours, measured in compute units)
  const computeResourcesData = generateTrendingData(24, 20, 250, 15, 8);
  const allocatedResources = 200;
  const overAllocated = computeResourcesData[computeResourcesData.length - 1] - allocatedResources;
  
  // Agent performance metrics (reward and loss data)
  const rewardData = generateTrendingData(24, 120, 210, 10, 3.5);
  const lossData = generateTrendingData(24, 180, 140, 7, -1.8);
  const rewardImprovement = 11.7;
  const lossReduction = 16.4;
  
  // Training categories
  const categories = [
    { name: "Exploration", amount: 73, budget: 100 },
    { name: "Q-Learning", amount: 58, budget: 75 },
    { name: "Policy Gradient", amount: 21, budget: 40 },
    { name: "Experience Replay", amount: 14, budget: 20 },
    { name: "Parameter Updates", amount: 36, budget: 35 },
    { name: "Environment Steps", amount: 104, budget: 120 },
  ];
  
  // Training sessions to review
  const yesterdayTrainingSessions = [
    { id: 1, name: "DQN Training Session #145", category: "DQN", amount: 10.48, checked: false },
    { id: 2, name: "Hyperparameter Tuning #12", category: "TUNING", amount: 5.20, checked: false },
    { id: 3, name: "Environment Testing", category: "ENV", amount: 3.63, checked: false },
    { id: 4, name: "Model Checkpoint Validation", category: "VALID", amount: 8.67, checked: false }
  ];
  
  const marchTrainingSessions = [
    { id: 5, name: "Policy Evaluation", category: "EVAL", amount: 1.00, checked: false },
    { id: 6, name: "Target Network Update", category: "NETWORK", amount: 2.52, checked: false }
  ];
  
  const olderTrainingSessions = [
    { id: 7, name: "Initial State Distribution Analysis", category: "ANALYSIS", amount: 4.20, checked: false }
  ];
  
  return {
    spending: {
      data: hours.map((hour, i) => ({
        hour,
        amount: computeResourcesData[i],
      })),
      total: computeResourcesData[computeResourcesData.length - 1],
      budgeted: allocatedResources,
      overBudget: overAllocated,
    },
    assets: {
      data: hours.map((hour, i) => ({
        hour,
        assets: rewardData[i],
        debt: lossData[i],
      })),
      current: rewardData[rewardData.length - 1],
      growth: rewardImprovement,
    },
    debt: {
      current: lossData[lossData.length - 1],
      decrease: lossReduction,
    },
    categories,
    transactions: {
      yesterday: yesterdayTrainingSessions,
      march26: marchTrainingSessions,
      march25: olderTrainingSessions,
    },
  };
};

// Dashboard Data - Yearly View
export const getDashboardYearlyData = () => {
  // Monthly timestamps
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Yearly computational resources projection
  const computeResourcesData = generateTrendingData(12, 7500, 42000, 1500, 2800);
  const allocatedResources = 32000;
  const overAllocated = computeResourcesData[computeResourcesData.length - 1] - allocatedResources;
  
  // Yearly agent performance metrics
  const rewardData = generateTrendingData(12, 12000, 35000, 1000, 1800);
  const lossData = generateTrendingData(12, 20000, 12000, 800, -650);
  const rewardImprovement = 191.67;
  const lossReduction = 40.00;
  
  // Yearly training categories
  const categories = [
    { name: "Exploration", amount: 14305, budget: 18000 },
    { name: "Q-Learning", amount: 9242, budget: 16000 },
    { name: "Policy Gradient", amount: 7586, budget: 14000 },
    { name: "Experience Replay", amount: 5421, budget: 8000 },
    { name: "Parameter Updates", amount: 12750, budget: 14000 },
    { name: "Environment Steps", amount: 32100, budget: 40000 },
  ];
  
  // Training statistics with a yearly view
  const trainingStats = {
    totalEpisodes: 45728,
    totalTrainingHours: 8760,
    modelsCreated: 52,
    bestReward: 9876,
    improvementFromStart: 356.8,
  };
  
  return {
    spending: {
      data: months.map((month, i) => ({
        month,
        amount: computeResourcesData[i],
      })),
      total: computeResourcesData[computeResourcesData.length - 1],
      budgeted: allocatedResources,
      overBudget: overAllocated,
    },
    assets: {
      data: months.map((month, i) => ({
        month,
        assets: rewardData[i],
        debt: lossData[i],
      })),
      current: rewardData[rewardData.length - 1],
      growth: rewardImprovement,
    },
    debt: {
      current: lossData[lossData.length - 1],
      decrease: lossReduction,
    },
    categories,
    trainingStats,
  };
};

// Performance Data
export const getPerformanceData = (timeRange: string) => {
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 180;
  const dates = generateDates(days);
  
  // Start at 10, max at 1000, with different volatility based on time range
  const volatility = timeRange === "7d" ? 5 : timeRange === "30d" ? 8 : 12;
  const rewardValues = generateTrendingData(days + 1, 10, 1000, volatility, 5);
  
  // Human baseline is more consistent but lower
  const humanBaseline = Array(days + 1).fill(0).map((_, i) => 
    Math.min(650, 400 + (i / days) * 250 + (Math.random() * 30 - 15))
  );
  
  return dates.map((date, i) => ({
    date,
    reward: rewardValues[i],
    humanBaseline: humanBaseline[i]
  }));
};

// Action Distribution Data
export const getActionDistributionData = (timeRange: string) => {
  // Later models learn more complex behaviors
  const complexity = timeRange === "7d" ? 0.9 : 
                     timeRange === "30d" ? 0.7 : 
                     timeRange === "90d" ? 0.5 : 0.3;
  
  return [
    { 
      name: "Move Left", 
      value: Math.round(25 - (10 * (1 - complexity))) 
    },
    { 
      name: "Move Right", 
      value: Math.round(25 - (10 * (1 - complexity))) 
    },
    { 
      name: "Shoot", 
      value: Math.round(30 - (5 * (1 - complexity))) 
    },
    { 
      name: "Dodge", 
      value: Math.round(10 + (10 * (1 - complexity))) 
    },
    { 
      name: "Combo Actions", 
      value: Math.round(10 + (15 * (1 - complexity))) 
    }
  ];
};

// Learning Metrics Data
export const getLearningMetricsData = (timeRange: string) => {
  // These metrics improve over time
  const timeFactors = {
    "7d": 0.2,
    "30d": 0.4,
    "90d": 0.7,
    "all": 1
  };
  const factor = timeFactors[timeRange as keyof typeof timeFactors] || 0.5;
  
  return {
    winRate: {
      current: 42.3 + (26.4 * factor),
      previous: 42.3
    },
    averageScore: Math.round(5000 + (7450 * factor)),
    gamesProcessed: Math.round(100000 + (924302 * factor)),
    explorationRate: Math.max(0.05, 0.3 - (0.15 * factor))
  };
};

// Training Progress Data
export const getTrainingProgressData = (timeRange: string) => {
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 180;
  const dates = generateDates(days);
  
  // More episodes completed in recent days as training accelerates
  const episodesPerDay = dates.map((_, i) => {
    const progress = i / days;
    const baseEpisodes = 100 + (progress * 300);
    return Math.round(baseEpisodes + (Math.random() * 50 - 25));
  });
  
  // Rolling average increases over time with occasional dips
  const rollingAverage = generateTrendingData(days + 1, 100, 800, 30, 4);
  
  return dates.map((date, i) => ({
    date,
    episodes: episodesPerDay[i],
    rollingReward: rollingAverage[i]
  }));
};

// Model Diagnostics Data
export const getModelDiagnosticsData = (timeRange: string) => {
  const episodes = 30;
  
  // Generate Q-value distribution data (5x5 grid)
  const qValueHeatmap = Array(5).fill(0).map(() => 
    Array(5).fill(0).map(() => Math.random() * 100)
  );
  
  // TD Errors tend to decrease over time
  const tdErrors = Array(episodes).fill(0).map((_, i) => ({
    episode: i + 1,
    error: Math.max(0.1, 2 - (i / episodes) * 1.5 + (Math.random() * 0.5 - 0.25))
  }));
  
  // Recent training sessions
  const trainingSessions = Array(6).fill(0).map((_, i) => {
    const daysAgo = Math.round(i * (timeRange === "7d" ? 1 : timeRange === "30d" ? 5 : 15));
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return {
      id: `session-${100 + i}`,
      date: date.toISOString().split('T')[0],
      episodes: 1000 + (i * 200),
      duration: `${1 + Math.round(Math.random() * 3)}h ${Math.round(Math.random() * 59)}m`,
      avgReward: 300 + (50 * (5 - i)) + Math.round(Math.random() * 30),
      improvements: ["Dodge rate", "Target acquisition", "Resource management"][i % 3]
    };
  });
  
  return {
    qValueHeatmap,
    tdErrors,
    trainingSessions
  };
};

// Model Version History
export const getModelVersionHistoryData = (timeRange: string) => {
  // More versions in longer timeframes
  const versionCount = timeRange === "7d" ? 2 : 
                       timeRange === "30d" ? 4 : 
                       timeRange === "90d" ? 7 : 10;
  
  return Array(versionCount).fill(0).map((_, i) => {
    const version = (1 + i / 10).toFixed(1);
    const daysAgo = Math.round(i * (timeRange === "7d" ? 3 : timeRange === "30d" ? 7 : 12));
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // Performance improves with newer versions
    const improvement = Math.round(15 + (i * 5) + (Math.random() * 10 - 5));
    
    return {
      version: `v${version}`,
      date: date.toISOString().split('T')[0],
      performance: 100 + improvement,
      winRate: `${Math.round(35 + (i * 4))}%`,
      key_improvements: [
        "Improved target prioritization",
        "Enhanced dodge mechanics",
        "Optimized resource usage",
        "Better combo execution",
        "Reduced exploration noise",
        "Fixed oscillation patterns"
      ].slice(0, Math.min(3, Math.ceil((i + 1) / 2)))
    };
  }).reverse(); // Newest versions first
}; 