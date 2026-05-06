export interface SequenceRecord {
  id: string;
  name: string;
  sequence: string;
}

export interface Alignment {
  sequences: SequenceRecord[];
}

export function validateAlignment(alignment: Alignment): void {
  if (alignment.sequences.length === 0) {
    throw new Error("Alignment must contain at least one sequence.");
  }

  for (const record of alignment.sequences) {
    if (record.id.trim().length === 0) {
      throw new Error("Each sequence must have a non-empty id.");
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
