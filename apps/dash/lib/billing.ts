import { gql, useMutation } from '@apollo/client';
import { ApolloError, GraphQLErrors } from '@apollo/client/errors';
import { useAdminClient } from './api';

export interface BillingSession {
  id: string;
  url: string;
}

export interface SubscriptionManagementSession {
  id: string;
  url: string;
}

export const useStartBillingSession = (): [
  () => Promise<{
    errors?: GraphQLErrors;
    data?: BillingSession;
  }>,
  {
    loading: boolean;
    error?: ApolloError;
    data?: BillingSession;
  },
] => {
  const [createBillingSession, { loading, error, data }] =
    useCreateBillingSession();

  const startBillingSession = async () => {
    const result = await createBillingSession({
      variables: {
        input: {
          successUrl: location.href,
          cancelUrl: location.href,
        },
      },
    });

    return {
      errors: result.errors,
      data: result.data?.session,
    };
  };

  return [startBillingSession, { loading, error, data: data?.session }];
};

export const useSubscriptionManagementSession = (): [
  () => Promise<{
    errors?: GraphQLErrors;
    data?: SubscriptionManagementSession;
  }>,
  {
    loading: boolean;
    error?: ApolloError;
    data?: SubscriptionManagementSession;
  },
] => {
  const [createSubscriptionManagementSession, { loading, error, data }] =
    useCreateSubscriptionManagementSession();

  const startBillingSession = async () => {
    const result = await createSubscriptionManagementSession({
      variables: {
        input: { returnUrl: location.href },
      },
    });

    return {
      errors: result.errors,
      data: result.data?.session,
    };
  };

  return [startBillingSession, { loading, error, data: data?.session }];
};

const useCreateBillingSession = () => {
  return useMutation<
    { session: BillingSession },
    { input: { successUrl: string; cancelUrl: string } }
  >(CREATE_BILLING_SESSION, {
    client: useAdminClient(),
  });
};

const useCreateSubscriptionManagementSession = () => {
  return useMutation<
    { session: SubscriptionManagementSession },
    { input: { returnUrl: string } }
  >(CREATE_SUBSCRIPTION_MANAGEMENT_SESSION, {
    client: useAdminClient(),
  });
};

const CREATE_BILLING_SESSION = gql`
  mutation BillingSession($input: CreateBillingSessionInput!) {
    session: createBillingSession(input: $input) {
      id
      url
    }
  }
`;

const CREATE_SUBSCRIPTION_MANAGEMENT_SESSION = gql`
  mutation SubscriptionManagementSession(
    $input: CreateSubscriptionManagementSessionInput!
  ) {
    session: createSubscriptionManagementSession(input: $input) {
      id
      url
    }
  }
`;
