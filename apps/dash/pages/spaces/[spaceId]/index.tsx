import { gql, useQuery } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSpaceClient } from '../../../lib/api';
import styles from '../../../styles/SpaceBrowsePage.module.scss';
import SpaceLayout from '../../../components/SpaceLayout';
import { useSpaceId } from '../../../lib/routing';
import Link from 'next/link';
import Button from '../../../components/Button';
import Submenu from '../../../components/Submenu';
import { useState } from 'react';
import { Concept, parseConcept } from '@creatureco/concept-ml-parser';

const defaultLimit = 50;
const minPagination = 10;
const maxPagination = 100;
const paginationSteps = [minPagination, 20, 50, maxPagination];

const SpacePage: NextPage = () => {
  return (
    <SpaceLayout>
      <Content />
    </SpaceLayout>
  );
};

const Content = () => {
  const spaceId = useSpaceId();

  const {
    loading,
    error,
    concepts,
    prefix,
    from,
    setPrefix,
    limit,
    setLimit,
    prev,
    next,
    canPaginateBack,
    canPaginateForward,
  } = usePaginatedConcepts();

  if (concepts && concepts.length === 0) {
    return (
      <div>
        <p>
          This space contains no data.{' '}
          <Link href={`/spaces/${spaceId}/compose`}>Add Concepts</Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <Submenu>
        <li>
          Filter: <PrefixSelector value={prefix} onChange={setPrefix} />
        </li>

        <li>
          <label>
            Per page: <LimitSelector value={limit} onChange={setLimit} />
          </label>
        </li>

        <li>
          <Button disabled={!canPaginateBack} size="small" onClick={prev}>
            &laquo; Prev
          </Button>
          <Button disabled={!canPaginateForward} size="small" onClick={next}>
            Next &raquo;
          </Button>
        </li>
      </Submenu>
      {!from && loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {concepts && <ConceptList concepts={concepts.slice(0, limit)} />}
    </>
  );
};

const ConceptList = (props: { concepts: Concept[] }) => {
  const spaceId = useSpaceId();

  return (
    <ul className={styles.ConceptsList}>
      {props.concepts.map((concept) => {
        return (
          <li key={concept.key}>
            <Link
              href={`/spaces/${spaceId}/concepts/${encodeURIComponent(
                concept.key,
              )}`}
            >
              {concept.key}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
const numbers = '0123456789'.split('');
const symbols = '$@'.split('').concat('<<');
const allPrefixes = [...symbols, ...letters, ...numbers];

const PrefixSelector = (props: {
  value: string;
  onChange: (prefix: string) => void;
}) => {
  return (
    <select
      value={props.value}
      onChange={(event) => {
        props.onChange(event.target.value);
      }}
    >
      <option key="all" value="">
        All
      </option>
      {allPrefixes.map((prefix) => {
        return (
          <option key={prefix} value={prefix}>
            {prefix.toLocaleUpperCase()}
          </option>
        );
      })}
    </select>
  );
};

const LimitSelector = (props: {
  value: number;
  onChange: (limit: number) => void;
}) => {
  return (
    <select
      value={props.value}
      onChange={(event) => {
        props.onChange(parseInt(event.target.value, 10));
      }}
    >
      {paginationSteps.map((step) => {
        return (
          <option key={step} value={step}>
            {step}
          </option>
        );
      })}
    </select>
  );
};

const usePaginatedConcepts = () => {
  const [state, setState] = useState({
    stack: [] as string[],
    prefix: '',
    from: '',
    limit: defaultLimit,
  });

  const { stack, prefix, from, limit } = state;

  const startKey = from || prefix || undefined;

  const endKey = prefix
    ? prefix.replace(/\[\]/g, '') + 'z'.repeat(5)
    : undefined;

  const { loading, error, data } = useConcepts({
    pagination: {
      startKey,
      endKey,
      limit: limit + 1,
    },
  });

  const concepts = data?.concepts.map((c) => parseConcept(c.key));

  const setLimit = (limit: number) => {
    setState({
      ...state,
      limit,
    });
  };

  const setPrefix = (prefix: string = '') => {
    setState((state) => ({
      ...state,
      prefix,
      from: '',
      stack: [],
    }));
  };

  const canPaginateBack = Boolean(stack.length > 0);

  const canPaginateForward = Boolean(concepts && concepts.length > limit);

  const prev = () => {
    const from = stack.pop() || '';

    setState({
      ...state,
      stack,
      from,
    });
  };

  const next = () => {
    if (!canPaginateForward || !concepts) {
      return;
    }

    setState({
      ...state,
      stack: [...state.stack, from || prefix],
      from: concepts[limit].key,
    });
  };

  return {
    loading,
    concepts,
    error,
    limit,
    prefix,
    from,
    setLimit,
    setPrefix,
    canPaginateBack,
    canPaginateForward,
    prev,
    next,
  };
};

const useConcepts = (query: {
  pagination?: {
    startKey?: string;
    endKey?: string;
    limit?: number;
  };
}) => {
  return useQuery<{
    concepts: { key: string }[];
  }>(GET_CONCEPTS, {
    client: useSpaceClient(),
    variables: { query },
    fetchPolicy: 'no-cache',
  });
};

const GET_CONCEPTS = gql`
  query Concepts($query: ConceptsQuery!) {
    concepts(query: $query) {
      key
    }
  }
`;

export default SpacePage;
