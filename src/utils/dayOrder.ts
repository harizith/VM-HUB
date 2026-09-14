/**
 * Configuration for the Day Order calculation.
 * In a real application, these values would be fetched from the database (Prisma).
 */
export interface SemesterConfig {
  startDate: string; // ISO Date string, e.g., "2024-08-01"
  holidays: string[]; // Array of ISO Date strings
  makeUpDays: string[]; // Array of ISO Date strings (weekends or holidays turned into working days)
  maxDayOrder: number; // Usually 5 or 6 depending on the college schedule
}

/**
 * Calculates the current Day Order deterministically.
 * 
 * @param targetDate The date to calculate the Day Order for.
 * @param config The semester configuration (start date, holidays, etc.).
 * @returns The Day Order (1 to maxDayOrder), or 0 if it's a holiday/weekend.
 */
export function calculateDayOrder(targetDate: Date, config: SemesterConfig): number {
  const start = new Date(config.startDate);
  start.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  // If the target date is before the start of the semester, no day order
  if (target < start) return 0;

  let workingDaysCount = 0;
  let currentDate = new Date(start);

  // Helper to check if a date string is in an array of date strings
  const isDateInArray = (date: Date, dateArray: string[]) => {
    const dateString = date.toISOString().split('T')[0];
    return dateArray.includes(dateString);
  };

  // Iterate from the start date up to and including the target date
  while (currentDate <= target) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6; // 0 = Sunday, 6 = Saturday
    const isHoliday = isDateInArray(currentDate, config.holidays);
    const isMakeUpDay = isDateInArray(currentDate, config.makeUpDays);

    // It's a working day if it's a make-up day, OR (it's not a weekend AND it's not a holiday)
    const isWorkingDay = isMakeUpDay || (!isWeekend && !isHoliday);

    if (isWorkingDay) {
      workingDaysCount++;
    }

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // If the target date itself is not a working day, return 0 (no day order)
  const isTargetWeekend = target.getDay() === 0 || target.getDay() === 6;
  const isTargetHoliday = isDateInArray(target, config.holidays);
  const isTargetMakeUpDay = isDateInArray(target, config.makeUpDays);
  
  if (!isTargetMakeUpDay && (isTargetWeekend || isTargetHoliday)) {
    return 0;
  }

  // Calculate the rotating day order
  // E.g. if maxDayOrder is 5, then working day 1 is Day 1, day 6 is Day 1, day 7 is Day 2, etc.
  let currentDayOrder = workingDaysCount % config.maxDayOrder;
  if (currentDayOrder === 0) {
    currentDayOrder = config.maxDayOrder; // E.g., working day 5 % 5 = 0, which should be Day 5
  }

  return currentDayOrder;
}
