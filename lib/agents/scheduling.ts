const INTERVAL_PREFIX = 'interval:';

interface CalculateNextRunOptions {
  from?: Date;
}

/**
 * Validates and returns the interval in minutes if the schedule string is supported.
 */
export function parseIntervalSchedule(schedule: string): number | null {
  if (!schedule.startsWith(INTERVAL_PREFIX)) {
    return null;
  }

  const value = Number(schedule.slice(INTERVAL_PREFIX.length));
  if (Number.isNaN(value) || value <= 0) {
    return null;
  }

  return value;
}

export function isSupportedSchedule(schedule: string | null | undefined): boolean {
  if (!schedule) {
    return true;
  }
  return parseIntervalSchedule(schedule) !== null;
}

/**
 * Calculates the next run time based on the provided schedule. Currently supports interval schedules in minutes.
 */
export function calculateNextRunAt(
  schedule: string | null | undefined,
  options: CalculateNextRunOptions = {},
): Date | null {
  if (!schedule) {
    return null;
  }

  const minutes = parseIntervalSchedule(schedule);
  if (minutes === null) {
    return null;
  }

  const base = options.from ?? new Date();
  return new Date(base.getTime() + minutes * 60 * 1000);
}

