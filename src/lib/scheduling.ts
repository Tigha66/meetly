import { addMinutes, format, startOfDay, addDays, parseISO, isWithinInterval, differenceInMinutes } from 'date-fns';

export function generateAvailableSlots(
  availability: any[],
  durationMinutes: number,
  date: Date,
  buffer_before_minutes: number = 0,
  buffer_after_minutes: number = 0,
  min_notice_hours: number = 0,
  existing_bookings_count: number = 0,
  max_bookings_per_day: number = 10
) {
  // Check daily booking limit
  if (existing_bookings_count >= max_bookings_per_day) {
    return [];
  }

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
      // Check buffer constraints for availability
      const bufferedStart = addMinutes(current, -buffer_before_minutes);
      const bufferedEnd = addMinutes(slotEnd, buffer_after_minutes);
      
      if (
        bufferedStart >= start && // (slot_start - buffer_before) >= availability_start
        bufferedEnd <= end        // (slot_end + buffer_after) <= availability_end
      ) {
        // Check minimum notice
        const now = new Date();
        const minutesUntilSlot = differenceInMinutes(current, now);
        if (minutesUntilSlot >= min_notice_hours * 60) {
          slots.push({
            start: format(current, 'hh:mm a'),
            isoStart: current.toISOString(),
            isoEnd: slotEnd.toISOString(),
          });
        }
      }
    }
    current = addMinutes(current, durationMinutes);
  }
  return slots;
}