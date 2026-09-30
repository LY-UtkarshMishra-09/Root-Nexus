/**
 * Attendance calculation helpers for JIIT students
 */

export interface AttendanceMetrics {
  percentage: number;
  formattedPercentage: string;
  status: 'safe' | 'warning' | 'danger';
  canBunkCount: number;
  needAttendCount: number;
  statusMessage: string;
  pillColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  progressBarColor: string;
}

export function calculateAttendanceMetrics(
  attended: number,
  total: number,
  targetPercentage: number = 75
): AttendanceMetrics {
  if (total <= 0) {
    return {
      percentage: 100,
      formattedPercentage: '100.0%',
      status: 'safe',
      canBunkCount: 0,
      needAttendCount: 0,
      statusMessage: 'No classes held yet',
      pillColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      progressBarColor: 'bg-emerald-500',
    };
  }

  const rawRatio = attended / total;
  const percentage = Math.round(rawRatio * 1000) / 10;
  const targetRatio = targetPercentage / 100;

  let canBunkCount = 0;
  let needAttendCount = 0;
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  let statusMessage = '';

  if (percentage >= 80) {
    status = 'safe';
  } else if (percentage >= targetPercentage) {
    status = 'warning';
  } else {
    status = 'danger';
  }

  if (rawRatio >= targetRatio) {
    // How many can be missed: floor((attended - targetRatio * total) / targetRatio)
    canBunkCount = Math.floor((attended - targetRatio * total) / targetRatio);
    if (canBunkCount < 0) canBunkCount = 0;

    if (canBunkCount === 0) {
      statusMessage = `On the edge! Don't miss the next class`;
    } else if (canBunkCount === 1) {
      statusMessage = `You can safely bunk 1 class`;
    } else {
      statusMessage = `You can safely bunk ${canBunkCount} classes`;
    }
  } else {
    // Classes needed: ceil((targetRatio * total - attended) / (1 - targetRatio))
    needAttendCount = Math.ceil((targetRatio * total - attended) / (1 - targetRatio));
    if (needAttendCount <= 0) needAttendCount = 1;

    statusMessage = `Attend next ${needAttendCount} ${needAttendCount === 1 ? 'class' : 'classes'} to reach ${targetPercentage}%`;
  }

  // Theme-adaptive styling tokens
  let pillColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let textColor = 'text-emerald-400 dark:text-emerald-300';
  let bgColor = 'bg-emerald-500/10';
  let borderColor = 'border-emerald-500/20';
  let progressBarColor = 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]';

  if (status === 'warning') {
    pillColor = 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30';
    textColor = 'text-amber-500 dark:text-amber-300';
    bgColor = 'bg-amber-500/10';
    borderColor = 'border-amber-500/20';
    progressBarColor = 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
  } else if (status === 'danger') {
    pillColor = 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30';
    textColor = 'text-rose-500 dark:text-rose-300';
    bgColor = 'bg-rose-500/10';
    borderColor = 'border-rose-500/20';
    progressBarColor = 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
  }

  return {
    percentage,
    formattedPercentage: `${percentage.toFixed(1)}%`,
    status,
    canBunkCount,
    needAttendCount,
    statusMessage,
    pillColor,
    textColor,
    bgColor,
    borderColor,
    progressBarColor,
  };
}
