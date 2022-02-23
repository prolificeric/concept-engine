import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAdminClient } from '../lib/api';
import { useSpaceId } from '../lib/routing';
import { Space } from '../types/models';
import Button from './Button';
import { NavLink } from './Links';
import Submenu from './Submenu';

export default function SpaceMenu(props: { space: Space }) {
  const { space } = props;
  const router = useRouter();
  const [removeSpace, removeResult] = useRemoveSpace();

  useEffect(() => {
    if (removeResult.data?.removed) {
      router.push('/');
    }
  }, [removeResult, router]);

  const handleRemoveSpace = async () => {
    let retried = false;

    while (true) {
      const confirmedName = window.prompt(
        (retried ? 'Name did not match.\n' : '') +
          'Confirm deletion by typing its name:\n' +
          space.name,
      );

      if (confirmedName === null) {
        return;
      }

      if (confirmedName === space.name) {
        removeSpace({
          variables: {
            id: space.id,
          },
        });
        return;
      }

      retried = true;
    }
  };

  return (
    <Submenu>
      <li>
        <NavLink href={`/spaces/${space.id}`}>Browse</NavLink>
      </li>
      <li>
        <NavLink href={`/spaces/${space.id}/query`}>Query</NavLink>
      </li>
      <li>
        <NavLink href={`/spaces/${space.id}/compose`}>Compose</NavLink>
      </li>
      <li>
        <NavLink href={`/spaces/${space.id}/graphql`}>GraphQL Console</NavLink>
      </li>
      <li>
        <NavLink href={`/spaces/${space.id}/tokens`}>API Access</NavLink>
      </li>
      <li>
        <Button
          size="small"
          kind="destructive"
          onClick={handleRemoveSpace}
          disabled={removeResult.loading}
        >
          Delete Space
        </Button>
        {removeResult.error && <p>Error: {removeResult.error.message}</p>}
      </li>
    </Submenu>
  );
}

const useRemoveSpace = () => {
  return useMutation<{ removed: boolean }, { id: string }>(
    REMOVE_SPACE_MUTATION,
    { client: useAdminClient() },
  );
};

const REMOVE_SPACE_MUTATION = gql`
  mutation RemoveSpace($id: ID!) {
    removed: removeSpace(id: $id)
  }
`;
