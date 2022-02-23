import { Command } from 'commander';
import get from './get';

export default new Command()
  .name('data')
  .description('Manipulate stored data of concepts.')
  .addCommand(get);
