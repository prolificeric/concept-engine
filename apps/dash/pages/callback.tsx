import { useAuth0 } from '@auth0/auth0-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Callback() {
  const auth = useAuth0();
  const router = useRouter();

  if (auth.isLoading) {
    return null;
  }

  if (auth.isAuthenticated) {
    router.push('/');
    return null;
  }

  return (
    <p>
      Error logging in. <Link href="/">Go to home</Link>
    </p>
  );
}
