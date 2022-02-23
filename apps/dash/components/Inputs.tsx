import { useState } from 'react';
import { intercept } from '../lib/events';
import styles from '../styles/Inputs.module.scss';

export interface TextInputProps {
  placeholder?: string;
  onChange: (value: string) => void;
  value?: string;
}

export const TextInput = (props: TextInputProps) => {
  return (
    <input
      className={styles.TextInput}
      type="text"
      value={props.value}
      placeholder={props.placeholder}
      onChange={(event) => {
        props.onChange(event.currentTarget.value);
      }}
    />
  );
};

export const SoloTextInput = (props: { onSubmit: (value: string) => void }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    props.onSubmit(value);
  };

  return (
    <form onSubmit={intercept(handleSubmit)}>
      <TextInput
        placeholder="Search by pattern"
        value={value}
        onChange={setValue}
      />
    </form>
  );
};

export const TextArea = (props: {
  value?: string;
  onChange: (value: string) => void;
}) => {
  return (
    <textarea
      className={styles.TextArea}
      value={props.value}
      onChange={(event) => {
        props.onChange(event.currentTarget.value);
      }}
    />
  );
};
