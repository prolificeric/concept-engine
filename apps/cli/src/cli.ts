import { Command } from 'commander';
import { version } from '../package.json';
import add from './commands/add';
import set from './commands/set';
import login from './commands/login';
import logout from './commands/logout';
import space from './commands/space';
import query from './commands/query';
import data from './commands/data';

new Command()
  .name('coeng')
  .description('CLI to interact with ConceptEngine knowledge spaces.')
  .version(version)
  .addCommand(add)
  .addCommand(set)
  .addCommand(login)
  .addCommand(logout)
  .addCommand(space)
  .addCommand(query)
  .addCommand(data)
  .parse(process.argv);
