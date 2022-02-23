import styles from '../styles/Submenu.module.scss';

export default function Submenu(props: { children: any }) {
  return <menu className={styles.Submenu}>{props.children}</menu>;
}
