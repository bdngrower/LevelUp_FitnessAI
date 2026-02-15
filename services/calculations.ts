import { UserProfile } from '../types';

export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

// Mifflin-St Jeor Equation
export const calculateBMR = (user: UserProfile): number => {
  // Sanity check for bad data (e.g. new users with 0 values)
  if (!user.weight || !user.height || !user.age || user.weight <= 0 || user.height <= 0 || user.age <= 0) {
    return 1500; // Safe fallback base BMR
  }

  let bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age);
  if (user.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Safety floor: BMR below 800 is extremely rare for adults and likely an error or extreme case.
  return Math.max(Math.round(bmr), 1000);
};

export const calculateTDEE = (user: UserProfile): number => {
  const bmr = calculateBMR(user);
  // Estimate activity factor based on gym days (min 4 days implies moderate/active)
  // 4 days ~ 1.45, 6 days ~ 1.6
  // Activity multiplier based on training days per week (1-7 range)
  const multiplierMap: Record<number, number> = {
    1: 1.2,
    2: 1.3,
    3: 1.375,
    4: 1.45,
    5: 1.55,
    6: 1.65,
    7: 1.725,
  };
  const activityMultiplier = multiplierMap[user.daysPerWeek] ?? 1.375;

  return Math.round(bmr * activityMultiplier);
};

export const getCalorieTarget = (tdee: number): number => {
  // Standard deficit for 0.5kg/week loss is approx 500 kcal
  return tdee - 500;
};
