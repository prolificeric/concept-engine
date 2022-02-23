import { intercept } from '../lib/events';
import styles from '../styles/Modal.module.scss';

export default function Modal(props: { children: any; onClose?: () => void }) {
  return (
    <div className={styles.Modal} onMouseDown={props.onClose}>
      <div
        className={styles.inner}
        onMouseDownCapture={(event) => {
          event.stopPropagation();
        }}
      >
        {props.children}
      </div>
    </div>
  );
}
