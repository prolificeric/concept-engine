import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useAdminClient } from '../lib/api';
import { useSpaceId } from '../lib/routing';
import { Space } from '../types/models';
import SpaceMenu from './SpaceMenu';

export default function SpaceLayout(props: { children: any }) {
  return <Wrapper>{props.children}</Wrapper>;
}

const Wrapper = (props: { children: any }) => {
  const { loading, error, data } = useSpace();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data?.space) {
    return <p>Space not found.</p>;
  }

  return (
    <>
      <header>
        <Link href={`/`}>&laquo; All Spaces</Link>
        <h1 style={{ marginTop: 10 }}>{data.space.name}</h1>
        <SpaceMenu space={data.space} />
      </header>
      {props.children}
    </>
  );
};

const useSpace = () => {
  const id = useSpaceId();

  return useQuery<{ space: Space | null }, { id: string }>(GET_SPACE, {
    variables: { id },
    client: useAdminClient(),
  });
};

const GET_SPACE = gql`
  query Space($id: ID!) {
    space(id: $id) {
      id
      name
    }
  }
`;
