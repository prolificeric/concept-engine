import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { gql, useLazyQuery } from '@apollo/client';
import { Account } from '../types/models';
import { useAdminClient } from '../lib/api';
import { useAccessToken } from './AuthProvider';

export default function AccountProvider(props: { children: any }) {
  const token = useAccessToken();
  const [account, setAccount] = useState<Account | null>(null);

  return (
    <AccountContext.Provider value={account}>
      {token && <AccountLoader onLoad={setAccount} />}
      {props.children}
    </AccountContext.Provider>
  );
}

export const useAccount = () => {
  return useContext(AccountContext);
};

const AccountLoader = (props: { onLoad: (account: Account) => void }) => {
  const [getAccount, result] = useLazyQuery<{ account: Account }>(
    ACCOUNT_QUERY,
    {
      client: useAdminClient(),
    },
  );

  useEffect(() => {
    if (result.loading || result.data?.account) {
      return;
    }

    getAccount().then((result) => {
      if (result.data) {
        props.onLoad(result.data.account);
      }
    });
  }, [result, getAccount, props]);

  return null;
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
