import AccountProvider from './AccountProvider';
import AuthProvider from './AuthProvider';

export default function Providers(props: { children: any }) {
  return (
    <AuthProvider>
      <AccountProvider>{props.children}</AccountProvider>
    </AuthProvider>
  );
}
