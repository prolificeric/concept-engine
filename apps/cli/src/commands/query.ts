import { Command } from 'commander';
import { parseConcepts } from '@creatureco/concept-ml-parser';
import { gql } from 'graphql-request';
import { requestSpace } from '@/api';
import { ensureSpace } from './space/select';

export default new Command()
  .name('query')
  .description('Run a rule-based query against the selected space.')
  .argument('<rules...>', 'ConceptML rules')
  .action(async (rules: string[]) => {
    const matches = await getMatches(rules);
    return console.table(matches);
  });

export const getMatches = async (rules: string[]) => {
  const spaceId = await ensureSpace();

  const data = await requestSpace<
    {
      matches: {
        variables: {
          name: string;
          match: { key: string };
        }[];
      }[];
    },
    { rules: string[] }
  >(spaceId, query, { rules });

  return data.matches.map((match) => {
    const varDict: Record<string, string> = {};

    match.variables.forEach((v) => {
      varDict[v.name] = v.match.key;
    });

    return varDict;
  });
};

export const query = gql`
  query Matches($rules: [String!]!) {
    matches(query: { rules: $rules }) {
      variables {
        name
        match {
          key
        }
      }
    }
  }
`;
