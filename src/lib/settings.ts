// Per-user settings (stored server-side in user_settings, synced across
// devices). All fields optional on the wire; defaults fill the gaps.
export type ThemePref = 'light' | 'dark' | 'system';

export interface UserSettings {
  appearance?: ThemePref;
  notifications?: {
    dailyReminder?: boolean;
    scheduleReminder?: boolean;
    reminderTime?: string; // HH:MM, 24-hour
  };
  study?: {
    autoExpandToday?: boolean;
  };
}

export interface ResolvedSettings {
  appearance: ThemePref;
  notifications: { dailyReminder: boolean; scheduleReminder: boolean; reminderTime: string };
  study: { autoExpandToday: boolean };
}

export const DEFAULT_SETTINGS: ResolvedSettings = {
  appearance: 'system',
  notifications: { dailyReminder: true, scheduleReminder: true, reminderTime: '05:30' },
  study: { autoExpandToday: true },
};

export function resolveSettings(s: UserSettings | null | undefined): ResolvedSettings {
  return {
    appearance: s?.appearance ?? DEFAULT_SETTINGS.appearance,
    notifications: {
      dailyReminder: s?.notifications?.dailyReminder ?? true,
      scheduleReminder: s?.notifications?.scheduleReminder ?? true,
      reminderTime: s?.notifications?.reminderTime ?? '05:30',
    },
    study: { autoExpandToday: s?.study?.autoExpandToday ?? true },
  };
}
