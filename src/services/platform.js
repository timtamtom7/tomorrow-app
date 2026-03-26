// Platform Detection and Subscription Utilities - Tomorrow

export const PLATFORM = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
};

export function getPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android')) return PLATFORM.ANDROID;
  if (/iphone|ipad|ipod/.test(ua)) return PLATFORM.IOS;
  return PLATFORM.WEB;
}

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  KEEPER: 'keeper',
  LEGACY: 'legacy',
};

export const subscriptionConfig = {
  [SUBSCRIPTION_TIERS.FREE]: {
    name: 'Free',
    price: '$0',
    features: ['5 letters/month', 'Basic templates', '1 recipient'],
  },
  [SUBSCRIPTION_TIERS.KEEPER]: {
    name: 'Keeper',
    price: '$9.99/year',
    features: ['Unlimited letters', 'All templates', '5 recipients', 'AI insights', 'Export'],
  },
  [SUBSCRIPTION_TIERS.LEGACY]: {
    name: 'Legacy',
    price: '$19.99/year',
    features: ['Everything in Keeper', 'Unlimited recipients', 'Family tree', 'Physical mail', 'Priority support'],
  },
};

export const RETENTION_MILESTONES = [
  { day: 1, event: 'first_letter', title: 'First Letter', description: 'Write your first letter to the future' },
  { day: 3, event: 'first_reflection', title: 'First Reflection', description: 'Write a reflection entry' },
  { day: 7, event: 'first_ai_insight', title: 'AI Insight', description: 'Receive your first AI insight' },
];
