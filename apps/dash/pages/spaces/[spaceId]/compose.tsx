import { useState } from 'react';
import { Concept, parseConcepts } from '@creatureco/concept-ml-parser';
import Editor from '@monaco-editor/react';
import SpaceLayout from '../../../components/SpaceLayout';
import styles from '../../../styles/ComposePage.module.scss';
import { useTheme } from '../../../lib/theme';
import Button from '../../../components/Button';
import { Horizontal } from '../../../components/Utils';
import { gql, useMutation } from '@apollo/client';
import { useSpaceClient } from '../../../lib/api';
import MonacoStylesheet from '../../../components/MonacoStylesheet';

export default function ComposePage() {
  const [save, saveResult] = useSave();
  const [source, setSource] = useState('');
  const theme = useTheme();
  let concepts: Concept[] = [];
  let error: Error | null = null;
  const canSave = !saveResult.loading && source.length > 0;

  try {
    concepts = parseConcepts(source);
  } catch (err: any) {
    error = err;
  }

  const handleSave = () => {
    setSource('');
    save({ variables: { input: { source } } });
  };

  return (
    <SpaceLayout>
      <div className={styles.ComposePage}>
        <Horizontal className={styles.toolbar}>
          <Button disabled={!canSave} size="small" onClick={handleSave}>
            {saveResult.loading ? 'Saving...' : 'Save'}
          </Button>
          {error && (
            <div className={styles.error}>
              <p>{error.message}</p>
            </div>
          )}
        </Horizontal>
        <div className={styles.Panes}>
          <Editor
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={source}
            height="calc(100vh - 300px)"
            onChange={(event) => setSource(event || '')}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'off',
              fontFamily: 'source-code-pro, monospace',
              fontSize: 16,
              padding: { top: 15 },
            }}
          />

          {/* Fixes issue of Monaco Editor's global stylesheet being removed between renders */}
          <MonacoStylesheet />

          <ul className={styles.ParsedConceptsList}>
            {concepts.map((concept) => (
              <li key={concept.key}>{concept.key}</li>
            ))}
          </ul>
        </div>
      </div>
    </SpaceLayout>
  );
}

const useSave = () => {
  return useMutation<
    { concepts: { key: string }[] },
    { input: { source: string } }
  >(ADD_CONCEPTS, { client: useSpaceClient() });
};

const ADD_CONCEPTS = gql`
  mutation AddConcepts($input: AddConceptsInput!) {
    concepts: addConcepts(input: $input) {
      key
    }
  }
`;
