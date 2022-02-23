import MonacoEditor, { EditorProps } from '@monaco-editor/react';
import { useTheme } from '../lib/theme';
import MonacoStylesheet from './MonacoStylesheet';

export default function Editor({ options, ...props }: EditorProps) {
  return (
    <>
      <MonacoStylesheet />
      <MonacoEditor
        theme={useTheme() === 'dark' ? 'vs-dark' : 'light'}
        {...props}
        options={{
          padding: { top: 15 },
          ...options,
        }}
      />
    </>
  );
}
