import styles from '../styles/Utils.module.scss';

export const Horizontal = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >,
) => {
  const className = [props.className, styles.Horizontal]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...props} className={className}>
      {props.children}
    </div>
  );
};
