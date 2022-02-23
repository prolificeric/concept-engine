import { Command } from 'commander';
import list from './list';
import select from './select';

export default new Command()
  .name('space')
  .description('Manage spaces.')
  .addCommand(list)
  .addCommand(select);
