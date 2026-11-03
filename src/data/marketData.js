// Regional market intelligence, APMC mandi rates, and aggregated sowing intentions
export const MANDI_PRICES = [
  { crop: 'Wheat', variety: 'HD-3086', mandi: 'Amritsar Grain Market', state: 'Punjab', currentPrice: 2470, msp: 2425, changePct: 1.8, trend: 'up', arrivalsTonnes: 320, peakArrivalMonth: 'April' },
  { crop: 'Mustard', variety: 'Pusa Bold', mandi: 'Bhatinda Mandi', state: 'Punjab', currentPrice: 5850, msp: 5650, changePct: 3.5, trend: 'up', arrivalsTonnes: 85, peakArrivalMonth: 'March' },
  { crop: 'Chickpea', variety: 'Desi Chana', mandi: 'Karnal Mandi', state: 'Haryana', currentPrice: 5720, msp: 5440, changePct: 5.1, trend: 'up', arrivalsTonnes: 60, peakArrivalMonth: 'March' },
  { crop: 'Potato', variety: 'Pukhraj', mandi: 'Jalandhar Fresh Market', state: 'Punjab', currentPrice: 890, msp: null, changePct: -4.2, trend: 'down', arrivalsTonnes: 1450, peakArrivalMonth: 'January' },
  { crop: 'Rice (Basmati)', variety: 'Pusa 1121', mandi: 'Tarn Taran Mandi', state: 'Punjab', currentPrice: 3850, msp: 2320, changePct: 2.1, trend: 'up', arrivalsTonnes: 210, peakArrivalMonth: 'October' },
  { crop: 'Maize', variety: 'Hybrid Yellow', mandi: 'Hoshiarpur Mandi', state: 'Punjab', currentPrice: 2380, msp: 2225, changePct: 6.9, trend: 'up', arrivalsTonnes: 140, peakArrivalMonth: 'October' },
  { crop: 'Moong', variety: 'SML 668', mandi: 'Moga Mandi', state: 'Punjab', currentPrice: 8950, msp: 8558, changePct: 4.6, trend: 'up', arrivalsTonnes: 45, peakArrivalMonth: 'June' },
];

export const REGIONAL_DISTRICTS = [
  { id: 'amritsar', name: 'Amritsar', state: 'Punjab', totalAcreage: 185000, activeFarmers: 1420 },
  { id: 'ludhiana', name: 'Ludhiana', state: 'Punjab', totalAcreage: 240000, activeFarmers: 1890 },
  { id: 'jalandhar', name: 'Jalandhar', state: 'Punjab', totalAcreage: 165000, activeFarmers: 1250 },
  { id: 'bathinda', name: 'Bathinda', state: 'Punjab', totalAcreage: 210000, activeFarmers: 1610 },
  { id: 'karnal', name: 'Karnal', state: 'Haryana', totalAcreage: 195000, activeFarmers: 1530 },
];

// Aggregated anonymous sowing intentions by district for regional risk detection
export const SOWING_INTENTIONS_REGISTRY = {
  amritsar: {
    district: 'Amritsar',
    season: 'Rabi 2026-27',
    totalReportedAcres: 14200,
    participatingFarmers: 412,
    crops: [
      { crop: 'Wheat', intendedAcres: 9650, sharePct: 68.0, historicalAvgSharePct: 62.0, riskStatus: 'Oversupply Alert', riskLevel: 'high', suggestion: 'High concentration. 68% intended acreage may cause harvest mandi congestion in April.' },
      { crop: 'Mustard', intendedAcres: 2410, sharePct: 17.0, historicalAvgSharePct: 14.0, riskStatus: 'Balanced', riskLevel: 'low', suggestion: 'Favorable oilseed demand. Local expellers paying ₹5,850/q.' },
      { crop: 'Potato', intendedAcres: 1420, sharePct: 10.0, historicalAvgSharePct: 16.0, riskStatus: 'Opportunity', riskLevel: 'opportunity', suggestion: 'Regional acreage down 6% vs last year. Early harvest window offers price premium.' },
      { crop: 'Chickpea', intendedAcres: 720, sharePct: 5.0, historicalAvgSharePct: 8.0, riskStatus: 'High Opportunity', riskLevel: 'opportunity', suggestion: 'Significant pulse supply deficit in northern markets. Favorable selling margins.' },
    ]
  },
  jalandhar: {
    district: 'Jalandhar',
    season: 'Rabi 2026-27',
    totalReportedAcres: 11800,
    participatingFarmers: 340,
    crops: [
      { crop: 'Potato', intendedAcres: 4950, sharePct: 42.0, historicalAvgSharePct: 35.0, riskStatus: 'Oversupply Alert', riskLevel: 'high', suggestion: 'Cold storage saturation warning in Doaba belt. Ensure forward buyer contracts.' },
      { crop: 'Wheat', intendedAcres: 5310, sharePct: 45.0, historicalAvgSharePct: 50.0, riskStatus: 'Stable', riskLevel: 'low', suggestion: 'Stable cereal baseline with full procurement support.' },
      { crop: 'Mustard', intendedAcres: 1540, sharePct: 13.0, historicalAvgSharePct: 15.0, riskStatus: 'Balanced', riskLevel: 'low', suggestion: 'Steady demand from regional mills.' },
    ]
  },
  bathinda: {
    district: 'Bathinda',
    season: 'Rabi 2026-27',
    totalReportedAcres: 16400,
    participatingFarmers: 480,
    crops: [
      { crop: 'Mustard', intendedAcres: 6230, sharePct: 38.0, historicalAvgSharePct: 29.0, riskStatus: 'Moderate Supply', riskLevel: 'medium', suggestion: 'South Punjab farmers diversifying towards oilseeds to conserve ground water.' },
      { crop: 'Wheat', intendedAcres: 8850, sharePct: 54.0, historicalAvgSharePct: 65.0, riskStatus: 'Balanced', riskLevel: 'low', suggestion: 'Reduced water pressure on canals as farmers rotate into mustard.' },
      { crop: 'Chickpea', intendedAcres: 1320, sharePct: 8.0, historicalAvgSharePct: 6.0, riskStatus: 'Opportunity', riskLevel: 'opportunity', suggestion: 'Ideal sandy loam soil match in southern belt.' },
    ]
  }
};

export const PRICE_TREND_MONTHLY = [
  { month: 'Nov', Wheat: 2350, Mustard: 5350, Potato: 1200, Chickpea: 5200 },
  { month: 'Dec', Wheat: 2380, Mustard: 5420, Potato: 980, Chickpea: 5310 },
  { month: 'Jan', Wheat: 2410, Mustard: 5500, Potato: 850, Chickpea: 5400 },
  { month: 'Feb', Wheat: 2430, Mustard: 5680, Potato: 780, Chickpea: 5550 },
  { month: 'Mar', Wheat: 2425, Mustard: 5850, Potato: 860, Chickpea: 5720 },
  { month: 'Apr', Wheat: 2470, Mustard: 5800, Potato: 950, Chickpea: 5690 },
];

