import { useStartBillingSession } from '../lib/billing';
import { intercept } from '../lib/events';
import { useAccount } from '../providers/AccountProvider';
import styles from '../styles/SubscriptionNotice.module.scss';
import Button from './Button';
import Loading from './Loading';

export default function SubscriptionCheck(props: { children: any }) {
  const account = useAccount();

  if (!account) {
    return <Loading />;
  }

  return (account?.trialDaysLeft || 0) > 0 ? (
    props.children
  ) : (
    <SubscriptionNotice />
  );
}

const SubscriptionNotice = () => {
  const [startBillingSession, billingSessionResult] = useStartBillingSession();

  if (billingSessionResult.error) {
    return (
      <div className={styles.SubscriptionNotice}>
        <p>Error: {billingSessionResult.error.message}</p>
      </div>
    );
  }

  if (billingSessionResult.loading) {
    return <Loading />;
  }

  const handleStartBillingSession = () => {
    if (billingSessionResult.loading) {
      return;
    }

    startBillingSession().then(({ data }) => {
      if (data) {
        location.href = data.url;
      }
    });
  };

  return (
    <div className={styles.SubscriptionNotice}>
      <h1>Trial Expired</h1>
      <p>Add your billing details to continue using ConceptEngine.</p>
      <Button size="large" onClick={intercept(handleStartBillingSession)}>
        {billingSessionResult.loading || billingSessionResult.data
          ? 'Loading...'
          : 'Start Subscription'}
      </Button>
    </div>
  );
};
