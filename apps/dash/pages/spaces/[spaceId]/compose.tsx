import { useState } from 'react';
import Editor from '@monaco-editor/react';

import {
  Concept,
  parseConcept,
  parseConcepts,
} from '@creatureco/concept-ml-parser';

import SpaceLayout from '../../../components/SpaceLayout';
import { useTheme } from '../../../lib/theme';
import Button from '../../../components/Button';
import { Horizontal } from '../../../components/Utils';
import MonacoStylesheet from '../../../components/MonacoStylesheet';
import Submenu from '../../../components/Submenu';
import { useAddConcepts } from '../../../lib/queries/addConcepts';
import styles from '../../../styles/ComposePage.module.scss';

export default function ComposePage() {
  const [save, saveResult] = useAddConcepts();
  const [source, setSource] = useState('');
  const [addedConcepts, setAddedConcepts] = useState([] as Concept[]);
  const [tab, setTab] = useState<'current' | 'log'>('current');
  const theme = useTheme();
  let wipConcepts: Concept[] = [];
  let error: Error | null = null;
  const canSave = !saveResult.loading && source.length > 0;

  try {
    wipConcepts = parseConcepts(source);
  } catch (err: any) {
    error = err;
  }

  const handleSave = () => {
    setTab('log');
    save({ variables: { input: { source } } }).then((result) => {
      setAddedConcepts(
        addedConcepts.concat(
          result.data?.concepts.map((c) => parseConcept(c.key)) || [],
        ),
      );
    });
  };

  return (
    <SpaceLayout>
      <div className={styles.ComposePage}>
        <Horizontal className={styles.toolbar}>
          <Button disabled={!canSave} onClick={handleSave}>
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
            onChange={(event) => {
              setSource(event || '');
              setTab('current');
            }}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'off',
              fontFamily: 'source-code-pro, monospace',
              fontSize: 16,
              padding: { top: 15 },
              tabSize: 2,
            }}
          />

          {/* Fixes issue of Monaco Editor's global stylesheet being removed between renders */}
          <MonacoStylesheet />

          <div>
            <Submenu
              style={{
                padding: '0.5rem',
              }}
            >
              <li
                className={[
                  styles.tab,
                  tab === 'current' ? styles.active : '',
                ].join(' ')}
                onClick={() => setTab('current')}
              >
                Current
              </li>
              <li
                className={[
                  styles.tab,
                  tab === 'log' ? styles.active : '',
                ].join(' ')}
                onClick={() => setTab('log')}
              >
                Log
              </li>
            </Submenu>
            {tab === 'current' && (
              <ul className={styles.ParsedConceptsList}>
                {wipConcepts.map((concept) => (
                  <li key={concept.key}>{concept.key}</li>
                ))}
              </ul>
            )}
            {tab === 'log' && (
              <ul className={styles.ParsedConceptsList}>
                {addedConcepts.map((concept) => (
                  <li key={concept.key}>{concept.key}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </SpaceLayout>
  );
}
