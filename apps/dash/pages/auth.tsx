import { useRouter } from 'next/router';
import { useRequiredAuth } from '../lib/auth';

export default function Auth() {
  const auth = useRequiredAuth();
  const router = useRouter();

  if (auth.isLoading) {
    return null;
  }

  if (auth.isAuthenticated) {
    router.push('/');
  }

  return null;
}
