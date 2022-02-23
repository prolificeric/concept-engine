import { gql, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Button from '../../../../components/Button';
import Editor from '../../../../components/Editor';
import SpaceLayout from '../../../../components/SpaceLayout';
import Submenu from '../../../../components/Submenu';
import { Horizontal } from '../../../../components/Utils';
import { useSpaceClient } from '../../../../lib/api';
import { useSpaceId } from '../../../../lib/routing';

export default function SpaceConceptPage() {
  return (
    <SpaceLayout>
      <Content />
    </SpaceLayout>
  );
}

const Content = () => {
  const spaceId = useSpaceId();
  const { data, loading, error } = useConcept();
  const [updateData, updateResult] = useUpdateConceptData();

  const [state, setState] = useState({
    dataValue: '',
  });

  useEffect(() => {
    if (data?.concept?.data) {
      setState({
        ...state,
        dataValue: data.concept.data,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const savedValue =
    updateResult.data?.concept?.data || data?.concept?.data || '';

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data?.concept) {
    return <p>Concept not found.</p>;
  }

  const { concept } = data;

  return (
    <Horizontal
      style={{
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          flexBasis: '50%',
        }}
      >
        <h2>{concept.key}</h2>

        {concept.parts.length > 0 && (
          <>
            <h3>Parts</h3>
            <ul>
              {concept.parts.map((part) => (
                <li key={part.key}>
                  <Link
                    href={`/spaces/${spaceId}/concepts/${encodeURIComponent(
                      part.key,
                    )}`}
                  >
                    {part.key}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {concept.contexts.length > 0 && (
          <>
            <h3>Contexts</h3>
            <ul>
              {concept.contexts.map((ctx) => (
                <li key={ctx.key}>
                  <Link
                    href={`/spaces/${spaceId}/concepts/${encodeURIComponent(
                      ctx.key,
                    )}`}
                  >
                    {ctx.key}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div
        style={{
          flexBasis: '50%',
        }}
      >
        <Submenu>
          <li>
            <h3
              style={{
                margin: 0,
              }}
            >
              Concept Data
            </h3>
          </li>
          <li>
            <Button
              disabled={savedValue === state.dataValue}
              onClick={() => {
                updateData({
                  variables: {
                    input: {
                      key: concept.key,
                      data: state.dataValue,
                    },
                  },
                });
              }}
            >
              Save
            </Button>
          </li>
        </Submenu>

        <Editor
          height="calc(100vh - 300px)"
          value={state.dataValue}
          onChange={(dataValue = '') => {
            setState({
              ...state,
              dataValue,
            });
          }}
          options={{
            wordWrap: true,
            minimap: { enabled: false },
          }}
        />
      </div>
    </Horizontal>
  );
};

const useConceptKey = () => {
  return useRouter().query.conceptKey as string;
};

const useConcept = () => {
  const key = useConceptKey();

  return useQuery<
    {
      concept: null | {
        key: string;
        data: null | string;
        parts: { key: string }[];
        contexts: { key: string }[];
      };
    },
    { key: string }
  >(GET_CONCEPT, {
    client: useSpaceClient(),
    variables: { key },
  });
};

const GET_CONCEPT = gql`
  query GetConcept($key: ID!) {
    concept(key: $key) {
      key
      data
      parts {
        key
      }
      contexts {
        key
      }
    }
  }
`;

const useUpdateConceptData = () => {
  return useMutation<{
    concept: null | {
      key: string;
      data: null | string;
    };
  }>(SAVE_CONCEPT_DATA, {
    client: useSpaceClient(),
  });
};

const SAVE_CONCEPT_DATA = gql`
  mutation UpdateConceptData($input: UpdateConceptDataInput!) {
    concept: updateConceptData(input: $input) {
      key
      data
    }
  }
`;
