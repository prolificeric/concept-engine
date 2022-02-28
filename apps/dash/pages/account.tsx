import { useAuth0 } from '@auth0/auth0-react';
import Button from '../components/Button';
import Loading from '../components/Loading';
import {
  useStartBillingSession,
  useSubscriptionManagementSession,
} from '../lib/billing';
import { useAccount } from '../providers/AccountProvider';

export default function UpgradePage() {
  const account = useAccount();
  const { user } = useAuth0();

  if (!account || !user) {
    return <Loading />;
  }

  return (
    <div>
      <h1>Account</h1>
      <h2>Email</h2>
      <p>{user.email}</p>

      <h2>Subscription</h2>
      {account.level === 'PREMIUM' ? (
        <>
          <p>You are currently subscribed to the Premium plan.</p>
          <ManageButton />
        </>
      ) : (
        <>
          <p>You are currently on the Free Trial plan.</p>
          <SubscribeButton />
        </>
      )}
    </div>
  );
}

const ManageButton = () => {
  const [startSubscriptionManagementSession, sessionResult] =
    useSubscriptionManagementSession();

  return (
    <Button
      disabled={sessionResult.loading}
      onClick={() => {
        startSubscriptionManagementSession().then(({ data }) => {
          if (data) {
            location.href = data.url;
          }
        });
      }}
    >
      {sessionResult.loading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  );
};

const SubscribeButton = () => {
  const [startBillingSession, billingSessionResult] = useStartBillingSession();

  return (
    <Button
      disabled={billingSessionResult.loading}
      onClick={() => {
        startBillingSession().then(({ data }) => {
          if (data) {
            location.href = data.url;
          }
        });
      }}
    >
      {billingSessionResult.loading ? 'Loading...' : 'Start Subscription'}
    </Button>
  );
};
