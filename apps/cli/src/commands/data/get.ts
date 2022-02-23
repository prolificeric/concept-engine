import { requestSpace } from '@/api';
import { Command } from 'commander';
import { gql } from 'graphql-request';
import { ensureSpace } from '../space/select';

export default new Command()
  .name('get')
  .description('Retrieve data for a given concept key.')
  .argument('<key>', 'Concept key')
  .action(async (key: string) => {
    const data = await getConceptData(key);

    if (!data) {
      console.error('Concept does not exist.');
      process.exit(1);
    }

    console.log(data);
  });

export const getConceptData = async (key: string): Promise<null | string> => {
  const spaceId = await ensureSpace();
  const { concept } = await requestSpace(spaceId, query, { key });
  return concept?.data || null;
};

export const query = gql`
  query ConceptData($key: ID!) {
    concept(key: $key) {
      data
    }
  }
`;
