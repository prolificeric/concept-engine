import ConfigStore from 'configstore';
import pkg from '../package.json';

export interface Config {
  token?: string;
  spaceId?: string;
}

const store = new ConfigStore(pkg.name);

export const loadConfig = async (): Promise<Config> => {
  return store.all();
};

export const saveConfig = async (
  overrides: Partial<Config>,
): Promise<Config> => {
  const existing = await loadConfig();
  return store.all({ ...existing, ...overrides });
};

export const setConfig = async <TKey extends keyof Config>(
  key: TKey,
  value: Config[TKey],
): Promise<void> => {
  return store.set(key, value);
};

export const getConfig = async <TKey extends keyof Config>(
  key: TKey,
): Promise<Config[TKey]> => {
  return store.get(key) || undefined;
};
