import styles from '../styles/Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.Footer}>
      <p>Copyright &copy; {new Date().getFullYear()} Creature &amp; Co.</p>
    </footer>
  );
}
