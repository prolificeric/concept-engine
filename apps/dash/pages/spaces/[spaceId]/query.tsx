import { gql, useQuery } from '@apollo/client';
import {
  getPatternVariables,
  parseConcept,
  parseConcepts,
} from '@creatureco/concept-ml-parser';
import Editor from '@monaco-editor/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Button from '../../../components/Button';
import { SoloTextInput, TextArea } from '../../../components/Inputs';
import MonacoStylesheet from '../../../components/MonacoStylesheet';
import SpaceLayout from '../../../components/SpaceLayout';
import Submenu from '../../../components/Submenu';
import { useSpaceClient } from '../../../lib/api';
import { intercept } from '../../../lib/events';
import { useTheme } from '../../../lib/theme';

export default function SpaceQueryPage() {
  return (
    <SpaceLayout>
      <Content />
    </SpaceLayout>
  );
}

const Content = () => {
  const router = useRouter();

  const [state, setState] = useState({
    rules: '',
  });

  return (
    <>
      <Submenu>
        <li>
          <Button
            disabled={!state.rules}
            onClick={() => {
              router.push({
                pathname: location.pathname,
                query: {
                  rules: state.rules,
                },
              });
            }}
          >
            Run Query
          </Button>
        </li>
      </Submenu>
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: 'calc(100vh - 300px)',
        }}
      >
        <div
          style={{
            flexBasis: '50%',
          }}
        >
          {/* Fixes issue of Monaco Editor's global stylesheet being removed between renders */}
          <MonacoStylesheet />
          <Editor
            height="100%"
            width="100%"
            theme={useTheme() === 'dark' ? 'vs-dark' : 'light'}
            options={{
              padding: { top: 15 },
              fontSize: 16,
              minimap: { enabled: false },
              lineNumbers: 'off',
            }}
            value={state.rules}
            onChange={(rules = '') =>
              setState({
                ...state,
                rules,
              })
            }
          />
        </div>
        <div
          style={{
            flexBasis: '50%',
            height: '100%',
            overflow: 'auto',
            padding: 15,
          }}
        >
          {router.query.rules && <Results />}
        </div>
      </div>
    </>
  );
};

const Results = () => {
  const [state, setState] = useState({ groupBy: '' });
  const rules = (useRouter().query.rules as string) || '';
  const { loading, error, data } = useMatches(rules);
  const variables = getPatternVariables(parseConcepts(rules));

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const matches = data?.matches.map((match) => {
    return {
      variables: match.variables.map((v) => {
        return {
          ...v,
          match: parseConcept(v.match.key),
        };
      }),
    };
  });

  if (!matches?.length) {
    return <p>No matches found.</p>;
  }

  const groups = new Map<
    string,
    {
      name: string;
      matches: typeof matches;
    }
  >();

  if (state.groupBy) {
    matches.forEach((match) => {
      const groupKey = match.variables.find((v) => v.name === state.groupBy)
        ?.match.key;

      if (groupKey === undefined) {
        return;
      }

      const group = groups.get(groupKey) || {
        name: groupKey,
        matches: [],
      };

      group.matches.push(match);

      groups.set(groupKey, group);
    });
  }

  return (
    <>
      {variables.length > 1 && (
        <label>
          Group by:{' '}
          <select
            onChange={(event) => {
              setState({
                ...state,
                groupBy: event.target.value,
              });
            }}
          >
            <option value="">None</option>
            {variables.map((variable) => (
              <option value={variable.key} key={variable.key}>
                {variable.key}
              </option>
            ))}
          </select>
        </label>
      )}
      {!state.groupBy ? (
        <table>
          <thead>
            <tr
              style={{
                backgroundColor: 'rgba(177, 177, 177, 0.1)',
              }}
            >
              {matches[0].variables.map((variable) => {
                return <th key={variable.name}>{variable.name}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              return (
                <tr key={JSON.stringify(match)}>
                  {match.variables.map((variable) => {
                    return <td key={variable.name}>{variable.match.key}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <table>
          {Array.from(groups.values()).map((group) => {
            return (
              <>
                <thead>
                  <tr
                    key={'group_' + group.name}
                    style={{
                      backgroundColor: 'rgba(177, 177, 177, 0.1)',
                    }}
                  >
                    <th>{group.name}</th>
                    {matches[0].variables.map((variable) => {
                      if (variable.name === state.groupBy) {
                        return null;
                      }
                      return <th key={variable.name}>{variable.name}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {group.matches.map((match) => {
                    return (
                      <tr key={JSON.stringify(match)}>
                        <td></td>
                        {match.variables.map((variable) => {
                          if (variable.name === state.groupBy) {
                            return null;
                          }
                          return (
                            <td key={variable.name}>{variable.match.key}</td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </>
            );
          })}
        </table>
      )}
    </>
  );
};

const useMatches = (rules: string) => {
  return useQuery<
    {
      matches: {
        variables: {
          name: string;
          match: { key: string };
        }[];
      }[];
    },
    {
      query: { rules: string };
    }
  >(GET_MATCHES, {
    client: useSpaceClient(),
    fetchPolicy: 'no-cache',
    variables: {
      query: {
        rules,
      },
    },
  });
};

const GET_MATCHES = gql`
  query GetMatches($query: MatchesQuery!) {
    matches(query: $query) {
      variables {
        name
        match {
          key
        }
      }
    }
  }
`;
