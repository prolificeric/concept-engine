import { useMutation, gql } from '@apollo/client';
import { useSpaceClient } from '../../lib/api';

export const useAddConcepts = () => {
  return useMutation<
    { concepts: { key: string }[] },
    { input: { source: string } }
  >(ADD_CONCEPTS_QUERY, { client: useSpaceClient() });
};

export const ADD_CONCEPTS_QUERY = gql`
  mutation AddConcepts($input: AddConceptsInput!) {
    concepts: addConcepts(input: $input) {
      key
    }
  }
`;
