import { getConfig, setConfig } from '@/config';
import { Command } from 'commander';
import prompts from 'prompts';
import { getMemberships } from './list';

export default new Command()
  .name('select')
  .description('Select the space to run operations against.')
  .action(() => selectSpace());

export const selectSpace = async () => {
  const memberships = await getMemberships();

  const { spaceId } = await prompts([
    {
      type: 'select',
      name: 'spaceId',
      message: 'Select a space:',
      choices: memberships.map((m) => ({
        title: `${m.space.name} (id: ${m.space.id})`,
        value: m.space.id,
      })),
    },
  ]);

  await setConfig('spaceId', spaceId);

  return spaceId;
};

export const ensureSpace = async () => {
  const spaceId = (await getConfig('spaceId')) || (await selectSpace());
  return spaceId;
};
