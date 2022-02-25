import { gql, useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import Button, { SubmitButton } from '../../../components/Button';
import Modal from '../../../components/Modal';
import SpaceLayout from '../../../components/SpaceLayout';
import { Horizontal } from '../../../components/Utils';
import { useAdminClient } from '../../../lib/api';
import { intercept } from '../../../lib/events';
import { useSpaceId } from '../../../lib/routing';

interface Token {
  id: string;
  label: string;
  role: 'admin' | 'collaborator' | 'owner';
}

export default function TokensPage() {
  return (
    <SpaceLayout>
      <Content />
    </SpaceLayout>
  );
}

const Content = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [addedTokens, setAddedTokens] = useState<Token[]>([]);
  const spaceId = useSpaceId();

  return (
    <>
      <Horizontal>
        <h2>API Tokens</h2>
        <Button size="small" onClick={() => setShowCreateModal(true)}>
          Create
        </Button>
      </Horizontal>

      {showCreateModal && (
        <AddTokenModal
          onClose={() => {
            setShowCreateModal(false);
          }}
          onAddToken={(token) => {
            setAddedTokens(addedTokens.concat(token));
            setShowCreateModal(false);
          }}
        />
      )}

      <TokensList addedTokens={addedTokens} />

      <Horizontal>
        <div>
          <h2>Usage</h2>

          <p>
            <strong>API URL:</strong>{' '}
            <code>{`https://api.coeng.workers.dev/spaces/${spaceId}/graphql`}</code>
          </p>

          <p>
            Use API tokens within the <code>Authorization</code> header of
            requests to the GraphQL API. For example:
          </p>

          <p>
            <code
              style={{
                padding: 15,
                background: 'rgba(177,177,177,0.1)',
                borderRadius: 10,
                display: 'block',
              }}
            >
              <pre>{createApiExample({ spaceId })}</pre>
            </code>
          </p>
        </div>
      </Horizontal>
    </>
  );
};

const QUERY_EXAMPLE = `query { concepts { key } }`;

const createApiExample = (values: {
  spaceId: string;
  token?: string;
}) => `fetch('https://api.coeng.workers.dev/spaces/${values.spaceId}/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ${values.token || '<token-goes-here>'}',
  },
  body: JSON.stringify({
    query: '${QUERY_EXAMPLE}',
    variables: {}
  })
});`;

const TokensList = (props: { addedTokens: Token[] }) => {
  const { loading, error, data } = useTokens();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <p>Error loading data.</p>;
  }

  const tokens = data.concat(props.addedTokens);

  return tokens.length > 0 ? (
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th>Label</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <TokenRow key={token.id} token={token} />
        ))}
      </tbody>
    </table>
  ) : (
    <p>No API tokens for this space.</p>
  );
};

const TokenRow = (props: { token: Token }) => {
  const [remove, { loading, error, data }] = useRemoveToken();
  const { token } = props;

  if (data?.removed) {
    return null;
  }

  const handleRemove = () => {
    const shouldRemove = confirm(
      `Are you sure you want to remove "${token.label}"?`,
    );

    if (shouldRemove) {
      remove({ variables: { id: token.id } });
    }
  };

  return (
    <tr key={token.id}>
      <td>
        <code>{token.id}</code>
      </td>
      <td>{token.label}</td>
      <td>{token.role}</td>
      <td>
        {error && <p>Error: {error.message}</p>}
        <menu>
          <li>
            {loading ? (
              <p>Revoking...</p>
            ) : (
              <a href="#" onClick={handleRemove}>
                Remove
              </a>
            )}
          </li>
        </menu>
      </td>
    </tr>
  );
};

const AddTokenModal = (props: {
  onClose: () => void;
  onAddToken: (token: Token) => void;
}) => {
  const { onClose, onAddToken } = props;
  const spaceId = useSpaceId();
  const [label, setLabel] = useState('');
  const [addToken, { loading, error, data }] = useAddToken();

  useEffect(() => {
    if (data) {
      setLabel('');
      onAddToken(data.token);
    }
  }, [data, onAddToken]);

  if (data) {
    return null;
  }

  const handleClose = () => {
    setLabel('');
    onClose();
  };

  const handleSubmit = () => {
    if (loading) {
      return;
    }

    addToken({
      variables: {
        input: {
          label,
          spaceId,
          role: 'collaborator',
        },
      },
    }).catch((err) => {});
  };

  return (
    <Modal onClose={handleClose}>
      <h1>Create API Token</h1>
      <form onSubmit={intercept(handleSubmit)}>
        {error && <p>{error.message}</p>}

        {loading ? (
          <p>Creating token...</p>
        ) : (
          <>
            <div>
              <label htmlFor="label">Label</label>
              <input
                type="text"
                required
                id="label"
                value={label}
                onChange={(event) => {
                  setLabel(event.currentTarget.value);
                }}
              />
            </div>
            <SubmitButton value="Create" />
          </>
        )}
      </form>
    </Modal>
  );
};

const useTokens = () => {
  const { loading, error, data } = useQuery<{
    space: null | {
      accessTokens: Token[];
    };
  }>(GET_TOKENS, {
    client: useAdminClient(),
    variables: {
      spaceId: useSpaceId(),
    },
  });

  return {
    loading,
    error,
    data: data?.space?.accessTokens ?? [],
  };
};

const GET_TOKENS = gql`
  query AccessTokens($spaceId: ID!) {
    space(id: $spaceId) {
      accessTokens {
        id
        label
        role
      }
    }
  }
`;

const useAddToken = () => {
  return useMutation<
    { token: Token },
    { input: { spaceId: string; label: string; role: 'collaborator' } }
  >(ADD_TOKEN, {
    client: useAdminClient(),
  });
};

const ADD_TOKEN = gql`
  mutation AddToken($input: AddAccessTokenInput!) {
    token: addAccessToken(input: $input) {
      id
      label
      role
    }
  }
`;

const useRemoveToken = () => {
  return useMutation<{ removed: boolean }, { id: string }>(REVOKE_TOKEN, {
    client: useAdminClient(),
  });
};

const REVOKE_TOKEN = gql`
  mutation RemoveAccessToken($id: ID!) {
    removed: removeAccessToken(id: $id)
  }
`;
