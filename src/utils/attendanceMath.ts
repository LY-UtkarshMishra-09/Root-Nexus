import { Subject, SubjectCalculation, AttendanceAggregate, AttendanceZone } from '@/types/attendance';

/**
 * Pure mathematical functions for JIIT Attendance & Bunk Predictor
 */

/**
 * Calculates raw attendance percentage with edge case handling.
 * If total == 0, defaults to 100.0%.
 */
export function calculatePercentage(attended: number, total: number): number {
  if (total <= 0) return 100.0;
  if (attended <= 0) return 0.0;
  const ratio = (attended / total) * 100;
  return Math.round(ratio * 10) / 10;
}

/**
 * Calculates the maximum consecutive upcoming classes a student can safely bunk
 * without dropping below the target threshold.
 * Formula: Math.floor((attended - targetRatio * total) / targetRatio)
 */
export function calculateSafeBunks(attended: number, total: number, target: number = 75): number {
  if (total <= 0) return 0;
  const targetRatio = target / 100;
  const currentRatio = attended / total;
  
  if (currentRatio < targetRatio) {
    return 0;
  }

  const bunks = Math.floor((attended - targetRatio * total) / targetRatio);
  return Math.max(0, bunks);
}

/**
 * Calculates the minimum consecutive upcoming classes a student must attend
 * to bring their attendance up to at least the target threshold.
 * Formula: Math.ceil((targetRatio * total - attended) / (1 - targetRatio))
 * For 75%: Math.ceil((0.75 * total - attended) / 0.25)
 */
export function calculateDeficit(attended: number, total: number, target: number = 75): number {
  if (total <= 0) return 0;
  const targetRatio = target / 100;
  const currentRatio = attended / total;

  if (currentRatio >= targetRatio) {
    return 0;
  }

  const classesNeeded = Math.ceil((targetRatio * total - attended) / (1 - targetRatio));
  return Math.max(1, classesNeeded);
}

/**
 * Classifies an attendance percentage into zones:
 * - Emerald/Green (>= 80%): Safe zone
 * - Amber/Yellow (75% to 79.9%): Warning buffer zone
 * - Rose/Red (< 75%): Critical debarment zone
 */
export function determineZone(percentage: number): AttendanceZone {
  if (percentage >= 80.0) return 'safe';
  if (percentage >= 75.0) return 'warning';
  return 'danger';
}

/**
 * Computes all metrics and styling tokens for a given Subject.
 */
export function calculateSubjectMetrics(subject: Subject, target: number = 75): SubjectCalculation {
  const percentage = calculatePercentage(subject.attended, subject.total);
  const zone = determineZone(percentage);
  const isDebarred = percentage < 75.0;
  const isSafe = percentage >= target;
  const isWarning = percentage >= 75.0 && percentage < 80.0;

  const safeBunkCount = calculateSafeBunks(subject.attended, subject.total, target);
  const deficitCount = calculateDeficit(subject.attended, subject.total, target);

  let statusText = '';
  if (isSafe) {
    if (safeBunkCount === 0) {
      statusText = `On the brink! Don't skip the next class to maintain ${target}%`;
    } else if (safeBunkCount === 1) {
      statusText = `Safe to skip 1 class and stay above ${target}%`;
    } else {
      statusText = `Safe to skip ${safeBunkCount} classes and stay above ${target}%`;
    }
  } else {
    statusText = `Must attend next ${deficitCount} ${deficitCount === 1 ? 'class' : 'classes'} to hit ${target}%`;
  }

  // Styling token assignments
  let badgeColorClass = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  let textColorClass = 'text-emerald-600 dark:text-emerald-400';
  let progressBarColorClass = 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
  let ringColorClass = '#10b981';
  let cardGlowClass = 'hover:border-emerald-500/30';

  if (zone === 'warning') {
    badgeColorClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    textColorClass = 'text-amber-600 dark:text-amber-400';
    progressBarColorClass = 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
    ringColorClass = '#f59e0b';
    cardGlowClass = 'hover:border-amber-500/30';
  } else if (zone === 'danger') {
    badgeColorClass = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    textColorClass = 'text-rose-600 dark:text-rose-400';
    progressBarColorClass = 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
    ringColorClass = '#f43f5e';
    cardGlowClass = 'hover:border-rose-500/40';
  }

  return {
    percentage,
    formattedPercentage: `${percentage.toFixed(1)}%`,
    zone,
    isDebarred,
    isSafe,
    isWarning,
    safeBunkCount,
    deficitCount,
    statusText,
    badgeColorClass,
    textColorClass,
    progressBarColorClass,
    ringColorClass,
    cardGlowClass,
  };
}

/**
 * Aggregates statistics across all enrolled subjects.
 */
export function calculateAggregate(subjects: Subject[], target: number = 75): AttendanceAggregate {
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalConducted = subjects.reduce((sum, s) => sum + s.total, 0);
  const overallPercentage = calculatePercentage(totalAttended, totalConducted);
  const zone = determineZone(overallPercentage);

  let atRiskCount = 0;
  let warningCount = 0;
  let safeCount = 0;

  subjects.forEach((s) => {
    const p = calculatePercentage(s.attended, s.total);
    if (p < 75.0) {
      atRiskCount++;
    } else if (p < 80.0) {
      warningCount++;
    } else {
      safeCount++;
    }
  });

  const canBunkAggregate = calculateSafeBunks(totalAttended, totalConducted, target);
  const deficitAggregate = calculateDeficit(totalAttended, totalConducted, target);

  const statusBadge: AttendanceAggregate['statusBadge'] = 
    atRiskCount === 0 ? 'All Clear' : `${atRiskCount} Subject(s) at Risk`;

  return {
    totalAttended,
    totalConducted,
    overallPercentage,
    formattedOverallPercentage: `${overallPercentage.toFixed(1)}%`,
    zone,
    atRiskCount,
    warningCount,
    safeCount,
    statusBadge,
    canBunkAggregate,
    deficitAggregate,
  };
}

/**
 * Simulates future bunks or attended classes for hypothetical scenarios.
 */
export function simulateOutcome(
  attended: number,
  total: number,
  futureAttended: number,
  futureBunked: number,
  target: number = 75
): { newPercentage: number; formatted: string; safeBunks: number; deficit: number; zone: AttendanceZone } {
  const newAttended = attended + futureAttended;
  const newTotal = total + futureAttended + futureBunked;
  const newPercentage = calculatePercentage(newAttended, newTotal);
  const safeBunks = calculateSafeBunks(newAttended, newTotal, target);
  const deficit = calculateDeficit(newAttended, newTotal, target);
  const zone = determineZone(newPercentage);

  return {
    newPercentage,
    formatted: `${newPercentage.toFixed(1)}%`,
    safeBunks,
    deficit,
    zone,
  };
}
