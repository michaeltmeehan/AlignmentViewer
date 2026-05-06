import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { Alignment, getVariableColumnIndices } from "./domain/alignment";
import { parseAlignedFasta } from "./domain/fasta";

const exampleFasta = `>seq1 Human sample
AC-GT
>seq2 Mouse sample
A--GT`;

export function App() {
  const [fastaText, setFastaText] = useState(exampleFasta);
  const [alignment, setAlignment] = useState<Alignment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const alignmentLength = useMemo(() => {
    return alignment?.sequences[0]?.sequence.length ?? 0;
  }, [alignment]);

  const variableColumnIndices = useMemo(() => {
    return alignment ? new Set(getVariableColumnIndices(alignment)) : new Set<number>();
  }, [alignment]);

  const baseCellWidth = Math.round(22 * zoom);
  const rowHeight = Math.round(28 * zoom);

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

  function decreaseZoom() {
    setZoom((currentZoom) => Math.max(0.75, Number((currentZoom - 0.25).toFixed(2))));
  }

  function increaseZoom() {
    setZoom((currentZoom) => Math.min(2, Number((currentZoom + 0.25).toFixed(2))));
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
                <div className="viewer-header">
                  <h3>Alignment</h3>
                  <div className="zoom-controls" aria-label="Alignment zoom controls">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={decreaseZoom}
                      disabled={zoom <= 0.75}
                    >
                      -
                    </button>
                    <span>{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={increaseZoom}
                      disabled={zoom >= 2}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div
                  className="alignment-viewer"
                  style={
                    {
                      "--base-cell-width": `${baseCellWidth}px`,
                      "--alignment-row-height": `${rowHeight}px`
                    } as CSSProperties
                  }
                >
                  <div className="label-column" aria-hidden="true">
                    <div className="ruler-spacer" />
                    {alignment.sequences.map((record) => (
                      <div className="sequence-label" key={record.id} title={record.name}>
                        {record.name}
                      </div>
                    ))}
                  </div>
                  <div className="base-grid-scroll" aria-label="Read-only alignment grid">
                    <div
                      className="base-grid"
                      style={{
                        gridTemplateColumns: `repeat(${alignmentLength}, var(--base-cell-width))`
                      }}
                    >
                      {Array.from({ length: alignmentLength }, (_, columnIndex) => (
                        <div className="ruler-cell" key={`ruler-${columnIndex}`}>
                          {columnIndex % 5 === 0 ? columnIndex + 1 : ""}
                        </div>
                      ))}
                      {alignment.sequences.flatMap((record) =>
                        Array.from(record.sequence, (base, columnIndex) => (
                          <div
                            className={
                              variableColumnIndices.has(columnIndex)
                                ? "base-cell variable-column"
                                : "base-cell"
                            }
                            key={`${record.id}-${columnIndex}`}
                            title={`${record.name}, position ${columnIndex + 1}: ${base}`}
                          >
                            {base}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
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
