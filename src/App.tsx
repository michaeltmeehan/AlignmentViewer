import { useMemo, useState } from "react";
import { Alignment } from "./domain/alignment";
import { parseAlignedFasta } from "./domain/fasta";

const exampleFasta = `>seq1 Human sample
AC-GT
>seq2 Mouse sample
A--GT`;

export function App() {
  const [fastaText, setFastaText] = useState(exampleFasta);
  const [alignment, setAlignment] = useState<Alignment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const alignmentLength = useMemo(() => {
    return alignment?.sequences[0]?.sequence.length ?? 0;
  }, [alignment]);

  function handleParse() {
    try {
      const parsedAlignment = parseAlignedFasta(fastaText);
      setAlignment(parsedAlignment);
      setError(null);
    } catch (caughtError) {
      setAlignment(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to parse FASTA input."
      );
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="page-header">
          <h1>Alignment Viewer</h1>
          <p>Paste aligned FASTA, then parse it to inspect basic alignment metadata.</p>
        </header>

        <div className="editor-layout">
          <section className="input-panel" aria-labelledby="fasta-input-heading">
            <div className="panel-header">
              <h2 id="fasta-input-heading">Aligned FASTA</h2>
              <button type="button" onClick={handleParse}>
                Parse
              </button>
            </div>
            <textarea
              aria-label="Aligned FASTA input"
              spellCheck={false}
              value={fastaText}
              onChange={(event) => setFastaText(event.target.value)}
            />
          </section>

          <section className="summary-panel" aria-live="polite">
            <h2>Summary</h2>
            {error ? (
              <div className="error-message" role="alert">
                {error}
              </div>
            ) : alignment ? (
              <div className="summary-content">
                <dl className="stats">
                  <div>
                    <dt>Sequences</dt>
                    <dd>{alignment.sequences.length}</dd>
                  </div>
                  <div>
                    <dt>Alignment length</dt>
                    <dd>{alignmentLength}</dd>
                  </div>
                </dl>
                <div>
                  <h3>Sequence names</h3>
                  <ul className="sequence-list">
                    {alignment.sequences.map((record) => (
                      <li key={record.id}>{record.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="empty-state">No parsed alignment yet.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
