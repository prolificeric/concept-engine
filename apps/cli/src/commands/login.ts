import { Command } from 'commander';
import { ensureToken } from '@/auth/token';

export default new Command()
  .name('login')
  .description('Log into your ConceptEngine account.')
  .action(async () => {
    const token = await ensureToken();
    console.log('Login successful.');
  });
