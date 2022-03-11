import styles from '../styles/Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.Footer}>
      <p>
        Support email:{' '}
        <a href="mailto:support@creatureco.zendesk.com">
          support@creatureco.zendesk.com
        </a>
      </p>
      <p>Copyright &copy; {new Date().getFullYear()} Creature &amp; Co.</p>
    </footer>
  );
}
