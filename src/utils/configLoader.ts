import { invoke } from '@tauri-apps/api/core';
import { AppConfig } from '../types';

export async function loadConfig(): Promise<AppConfig> {
  return await invoke<AppConfig>('get_initial_data');
}
