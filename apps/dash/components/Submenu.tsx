import { CSSProperties } from 'react';
import styles from '../styles/Submenu.module.scss';

export default function Submenu(props: {
  children: any;
  style?: CSSProperties;
}) {
  return (
    <menu style={props.style} className={styles.Submenu}>
      {props.children}
    </menu>
  );
}
