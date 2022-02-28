import { createContext, useContext } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Account } from '../types/models';
import { useAdminClient } from '../lib/api';
import { useAccessToken } from './AuthProvider';
import Loading from '../components/Loading';

export default function AccountProvider(props: { children: any }) {
  const token = useAccessToken();

  const { error, loading, data } = useQuery<{ account: Account }>(
    ACCOUNT_QUERY,
    { client: useAdminClient() },
  );

  return (
    <AccountContext.Provider value={data?.account || null}>
      {loading && <Loading />}
      {error ? <div>Error: {error.message}</div> : props.children}
    </AccountContext.Provider>
  );
}

export const useAccount = () => {
  return useContext(AccountContext);
};

const AccountContext = createContext<null | Account>(null);

const ACCOUNT_QUERY = gql`
  query Account {
    account {
      id
      created
      billingId
      trialDaysLeft
      level
    }
  }
`;
