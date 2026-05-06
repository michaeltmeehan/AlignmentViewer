export interface SequenceRecord {
  id: string;
  name: string;
  sequence: string;
}

export interface Alignment {
  sequences: SequenceRecord[];
}

export interface ColumnSummary {
  index: number;
  counts: Record<string, number>;
  consensus: string;
  isVariable: boolean;
  gapFraction: number;
}

export function validateAlignment(alignment: Alignment): void {
  if (alignment.sequences.length === 0) {
    throw new Error("Alignment must contain at least one sequence.");
  }

  for (const record of alignment.sequences) {
    if (record.id.trim().length === 0) {
      throw new Error("Each sequence must have a non-empty id.");
    }

    if (record.sequence.length === 0) {
      throw new Error("Each sequence must have non-empty sequence content.");
    }
  }

  const expectedLength = alignment.sequences[0].sequence.length;
  const unequalRecord = alignment.sequences.find(
    (record) => record.sequence.length !== expectedLength
  );

  if (unequalRecord) {
    throw new Error("All aligned sequences must have the same length.");
  }
}

export function getColumnSummary(
  alignment: Alignment,
  columnIndex: number
): ColumnSummary {
  validateAlignment(alignment);

  const sequenceCount = alignment.sequences.length;
  const alignmentLength = alignment.sequences[0].sequence.length;

  if (columnIndex < 0 || columnIndex >= alignmentLength) {
    throw new Error("Column index is outside the alignment bounds.");
  }

  const counts: Record<string, number> = {};

  for (const record of alignment.sequences) {
    const symbol = record.sequence[columnIndex];
    counts[symbol] = (counts[symbol] ?? 0) + 1;
  }

  const nonGapCounts = Object.entries(counts).filter(([symbol]) => symbol !== "-");
  const consensus = getConsensusSymbol(nonGapCounts);
  const gapCount = counts["-"] ?? 0;

  return {
    index: columnIndex,
    counts,
    consensus,
    isVariable: nonGapCounts.length > 1,
    gapFraction: gapCount / sequenceCount
  };
}

export function getColumnSummaries(alignment: Alignment): ColumnSummary[] {
  validateAlignment(alignment);

  const alignmentLength = alignment.sequences[0].sequence.length;

  return Array.from({ length: alignmentLength }, (_, index) =>
    getColumnSummary(alignment, index)
  );
}

export function getVariableColumnIndices(alignment: Alignment): number[] {
  return getColumnSummaries(alignment)
    .filter((summary) => summary.isVariable)
    .map((summary) => summary.index);
}

export function getConsensusSequence(alignment: Alignment): string {
  return getColumnSummaries(alignment)
    .map((summary) => summary.consensus)
    .join("");
}

function getConsensusSymbol(nonGapCounts: Array<[string, number]>): string {
  if (nonGapCounts.length === 0) {
    return "-";
  }

  return nonGapCounts.sort(([symbolA, countA], [symbolB, countB]) => {
    if (countA !== countB) {
      return countB - countA;
    }

    return symbolA.localeCompare(symbolB);
  })[0][0];
}
