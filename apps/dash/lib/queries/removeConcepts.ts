import { useMutation, gql } from '@apollo/client';
import { useSpaceClient } from '../api';

export const useRemoveConcepts = () => {
  return useMutation<{ count: number }, { keys: string[] }>(
    REMOVE_CONCEPTS_MUTATION,
    { client: useSpaceClient() },
  );
};

export const REMOVE_CONCEPTS_MUTATION = gql`
  mutation RemoveConcepts($keys: [String!]!) {
    count: removeConcepts(keys: $keys)
  }
`;
