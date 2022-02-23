import { requestAdmin } from '@/api';
import { Command } from 'commander';
import { gql } from 'graphql-request';

export default new Command()
  .name('list')
  .description('List spaces.')
  .action(async () => {
    const memberships = await getMemberships();

    console.table(
      memberships.map((m) => ({
        id: m.space.id,
        name: m.space.name,
        role: m.role,
      })),
    );
  });

export const getMemberships = async () => {
  const result = await requestAdmin<{
    account: {
      memberships: {
        role: string;
        space: {
          id: string;
          name: string;
        };
      }[];
    };
  }>(query);

  return result?.account?.memberships;
};

export const query = gql`
  query AccountMemberships {
    account {
      memberships {
        role

        space {
          id
          name
        }
      }
    }
  }
`;
