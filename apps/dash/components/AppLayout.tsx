import Footer from './Footer';
import Header from './Header';
import styles from '../styles/AppLayout.module.scss';

export default function AppLayout(props: { children: any }) {
  return (
    <div className={styles.AppLayout}>
      <Header />
      <main>{props.children}</main>
      <Footer />
    </div>
  );
}
