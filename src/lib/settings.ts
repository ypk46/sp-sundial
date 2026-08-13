import { invoke } from '@tauri-apps/api/core';

export const SETTINGS_KEYS = {
  apiToken: 'api_token',
  lastSyncAt: 'last_sync_at',
} as const;

export type SettingKey = (typeof SETTINGS_KEYS)[keyof typeof SETTINGS_KEYS];

export const getSetting = <T>(key: string): Promise<T | null> =>
  invoke<T | null>('get_setting', { key });

export const setSetting = (key: string, value: unknown): Promise<void> =>
  invoke<void>('set_setting', { key, value });

export const validateToken = (token: string): Promise<void> =>
  invoke<void>('validate_token', { token });
