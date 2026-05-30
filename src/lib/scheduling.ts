
import { addMinutes, format, startOfDay, addDays, parseISO, isWithinInterval } from 'date-fns';

export function generateAvailableSlots(
  availability: any[], 
  durationMinutes: number, 
  date: Date
) {
  const dayOfWeek = date.getDay();
  const dayRule = availability.find(rule => rule.day_of_week === dayOfWeek && rule.is_enabled);

  if (!dayRule) return [];

  const slots = [];
  const start = new Date(date);
  start.setHours(parseInt(dayRule.start_time.split(':')[0]), parseInt(dayRule.start_time.split(':')[1]), 0);
  
  const end = new Date(date);
  end.setHours(parseInt(dayRule.end_time.split(':')[0]), parseInt(dayRule.end_time.split(':')[1]), 0);

  let current = new Date(start);
  while (current < end) {
    const slotEnd = addMinutes(current, durationMinutes);
    if (slotEnd <= end) {
      slots.push({
        start: format(current, 'hh:mm a'),
        isoStart: current.toISOString(),
        isoEnd: slotEnd.toISOString(),
      });
    }
    current = addMinutes(current, durationMinutes);
  }

  return slots;
}
