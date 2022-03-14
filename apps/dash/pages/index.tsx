import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Button, { SubmitButton } from '../components/Button';
import { SpaceLink } from '../components/Links';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import { Horizontal } from '../components/Utils';
import { useAdminClient } from '../lib/api';
import { intercept } from '../lib/events';
import { useAccessToken } from '../providers/AuthProvider';
import styles from '../styles/Home.module.scss';

interface Space {
  id: string;
  name: string;
}

export default function Home() {
  const router = useRouter();
  const token = useAccessToken();
  const { loading, error, data } = useSpaces();

  const [state, setState] = useState({
    showCreateModal: false,
  });

  if (loading || !token) {
    return <Loading />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data?.account) {
    return null;
  }

  const { memberships } = data.account;

  const modal = state.showCreateModal ? (
    <AddSpaceModal
      onClose={() => {
        setState({
          ...state,
          showCreateModal: false,
        });
      }}
      onAddSpace={(space) => {
        router.push(`/spaces/${space.id}`);
      }}
    />
  ) : null;

  const createButton = (
    <Button
      onClick={() => {
        setState({
          ...state,
          showCreateModal: true,
        });
      }}
    >
      Create Space
    </Button>
  );

  if (memberships.length === 0) {
    return (
      <div className={styles.Home}>
        <h1>Welcome to ConceptEngine!</h1>
        <p>Let&apos;s setup your first knowledge space.</p>
        {createButton}
        {modal}
      </div>
    );
  }

  return (
    <div className={styles.Home}>
      <Horizontal>
        <h1>Your Spaces</h1> {createButton}
      </Horizontal>

      <ul className={styles.spaceList}>
        {memberships.map(({ space }) => (
          <li key={space.id}>
            <SpaceLink space={space} />
          </li>
        ))}
      </ul>
      {modal}
    </div>
  );
}

const AddSpaceModal = (props: {
  onClose?: () => void;
  onAddSpace?: (space: Space) => void;
}) => {
  const [addSpace] = useAddSpace();

  const [state, setState] = useState({
    name: '',
    error: null as string | null,
  });

  const handleSubmit = async () => {
    addSpace({
      variables: {
        input: {
          name: state.name,
        },
      },
    })
      .then(({ data, errors }) => {
        if (errors) {
          setState({
            ...state,
            error: errors[0].message,
          });
        } else if (data && props.onAddSpace) {
          props.onAddSpace(data.space);
        }
      })
      .catch((error) => {
        setState({
          ...state,
          error: error.message,
        });
      });
  };

  return (
    <Modal {...props}>
      <h1>Create Space</h1>

      {state.error && <p>{state.error}</p>}

      <form onSubmit={intercept(handleSubmit)}>
        <div>
          <label htmlFor="name">Name</label>{' '}
          <input
            required
            name="name"
            type="text"
            value={state.name}
            onChange={(event) => {
              setState({
                ...state,
                name: event.currentTarget.value,
              });
            }}
          />
        </div>

        <SubmitButton value="Create Space" />
      </form>
    </Modal>
  );
};

const useSpaces = () => {
  return useQuery<{
    account: {
      memberships: {
        role: 'admin' | 'member' | 'owner';
        space: Space;
      }[];
    };
  }>(GET_SPACES, {
    client: useAdminClient(),
    fetchPolicy: 'no-cache',
  });
};

const GET_SPACES = gql`
  query GetSpaces {
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

const useAddSpace = () => {
  return useMutation<{ space: Space }, { input: { name: string } }>(ADD_SPACE, {
    client: useAdminClient(),
  });
};

const ADD_SPACE = gql`
  mutation AddSpace($input: AddSpaceInput!) {
    space: addSpace(input: $input) {
      id
      name
    }
  }
`;
