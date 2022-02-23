import { Command } from 'commander';
import * as config from '../config';

export default new Command()
  .name('logout')
  .description('Log into your ConceptEngine account.')
  .action(async () => {
    await config.setConfig('token', undefined);
    console.log('Your are now logged out.');
  });
