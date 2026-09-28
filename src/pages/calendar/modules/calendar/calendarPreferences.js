export const CALENDAR_SETTINGS_KEY = 'calendarDisplaySettings';

export const DEFAULT_CALENDAR_SETTINGS = { weekDays: 7, firstDay: 0 };

export const loadCalendarSettings = () => {
  try {
    const settings = safeParse(window.localStorage.getItem(CALENDAR_SETTINGS_KEY));
    return {
      weekDays: settings?.weekDays === 5 ? 5 : DEFAULT_CALENDAR_SETTINGS.weekDays,
      firstDay:
        Number.isInteger(settings?.firstDay) && settings.firstDay >= 0 && settings.firstDay <= 6
          ? settings.firstDay
          : DEFAULT_CALENDAR_SETTINGS.firstDay,
    };
  } catch {
    return { ...DEFAULT_CALENDAR_SETTINGS };
  }
};
