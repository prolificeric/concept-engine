import { Command } from 'commander';
import { saveConfig } from '../config';

export default new Command()
  .name('set')
  .description('Set configuration variables.')
  .arguments('<key> [value]')
  .action(async (key: string, value?: string) => {
    await saveConfig({ [key]: value });
  });
