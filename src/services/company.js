// Company Structure and Investment Readiness - Tomorrow

export const COMPANY = {
  name: 'Tomorrow Technologies, Inc.',
  founded: '2023',
  website: 'tomorrow.app',
  structure: 'C-Corp (Delaware)',
  stage: 'Bootstrapped / Pre-seed',
  employees: 1,
};

export const SUBSCRIPTION_PRICING = {
  free: { name: 'Free', price: 0, lettersPerMonth: 5 },
  keeper: { name: 'Keeper', price: 9.99, lettersPerMonth: -1, period: 'year', features: ['Unlimited letters', 'AI insights'] },
  legacy: { name: 'Legacy', price: 19.99, lettersPerMonth: -1, period: 'year', features: ['Everything in Keeper', 'Physical mail', 'Family tree'] },
};

export const FINANCIAL_METRICS = {
  arr: 0,
  arrTarget: 500000,
  activeSubscribers: 0,
  churnRate: 0.04,
  ltv: 200,
  cac: 12,
  get progressToTarget() { return Math.min(1, this.arr / this.arrTarget); },
};

export const INVESTMENT_CHECKLIST = [
  { title: 'Business Plan', completed: true, notes: 'Personal legacy platform strategy' },
  { title: 'Financial Model', completed: true, notes: 'ARR projections to $500K' },
  { title: 'Cap Table', completed: false, notes: 'Pending legal setup' },
  { title: 'Pitch Deck', completed: false, notes: 'Needs emotional narrative' },
  { title: 'Unit Economics', completed: true, notes: 'LTV:CAC > 4x' },
  { title: 'Traction Metrics', completed: true, notes: 'Letters written tracked' },
];

export const HIRING_PLAN = [
  { role: 'iOS Engineer', timing: 'Q1 2025', priority: 'high', salaryRange: '$110-140K' },
  { role: 'AI/ML Engineer', timing: 'Q2 2025', priority: 'high', salaryRange: '$130-160K' },
];
