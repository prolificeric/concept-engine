import Link from 'next/link';
import React from 'react';
import styles from '../styles/Button.module.scss';

export type ButtonKind = 'primary' | 'secondary' | 'tertiary' | 'destructive';

export type ButtonSize = 'small' | 'normal' | 'large';

export default function Button(props: {
  children: any;
  href?: string;
  disabled?: boolean;
  kind?: ButtonKind;
  size?: ButtonSize;
  [key: string]: any;
}) {
  const {
    children,
    kind = 'primary',
    size = 'normal',
    className = '',
    ...restAttr
  } = props;

  const classNames = [
    className,
    styles.Button,
    styles[kind],
    styles[size],
  ].filter(Boolean);

  const Component = props.href ? Link : 'button';

  return (
    <Component
      className={classNames.join(' ')}
      href={props.href as any}
      {...restAttr}
    >
      {children}
    </Component>
  );
}

export const SubmitButton = (props: {
  value: string;
  kind?: ButtonKind;
  size?: ButtonSize;
  [key: string]: any;
}) => {
  const {
    value,
    type,
    kind = 'primary',
    size = 'normal',
    className = '',
    ...restAttr
  } = props;

  const classNames = [className, styles.Button, styles[kind], styles[size]];

  return (
    <input
      type="submit"
      value={value}
      className={classNames.join(' ')}
      {...restAttr}
    />
  );
};
