import { UserProfile } from '../types';

export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

// Mifflin-St Jeor Equation
export const calculateBMR = (user: UserProfile): number => {
  let bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age);
  if (user.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
};

export const calculateTDEE = (user: UserProfile): number => {
  const bmr = calculateBMR(user);
  // Estimate activity factor based on gym days (min 4 days implies moderate/active)
  // 4 days ~ 1.45, 6 days ~ 1.6
  let activityMultiplier = 1.2; // Sedentary base
  
  if (user.daysPerWeek === 4) activityMultiplier = 1.45;
  else if (user.daysPerWeek === 5) activityMultiplier = 1.55;
  else if (user.daysPerWeek >= 6) activityMultiplier = 1.65;

  return Math.round(bmr * activityMultiplier);
};

export const getCalorieTarget = (tdee: number): number => {
  // Standard deficit for 0.5kg/week loss is approx 500 kcal
  return tdee - 500;
};
