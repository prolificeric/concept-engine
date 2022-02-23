import GraphiQL from 'graphiql';
import SpaceLayout from '../../../components/SpaceLayout';
import { useAccessToken } from '../../../providers/AuthProvider';
import config from '../../../site.config';
import { useSpaceId } from '../../../lib/routing';
import 'graphiql/graphiql.min.css';

export default function GraphQLPage() {
  const spaceId = useSpaceId();
  const endpoint = `${config.coeng.baseUrl}/spaces/${spaceId}/graphql`;
  const token = useAccessToken();

  return (
    <SpaceLayout>
      <div style={{ height: 'calc(100vh - 350px)' }}>
        <GraphiQL
          headerEditorEnabled={false}
          defaultQuery={defaultQuery}
          fetcher={async (params) => {
            const data = await fetch(endpoint, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(params),
              credentials: 'same-origin',
            });

            return data.json().catch(() => data.text());
          }}
        />
      </div>
    </SpaceLayout>
  );
}

const defaultQuery = `{
  concepts(query: {pagination: {limit: 100}}) {
    key
  }
}`;
