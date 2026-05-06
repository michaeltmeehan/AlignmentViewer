import { Alignment, SequenceRecord, validateAlignment } from "./alignment";

export function parseAlignedFasta(input: string): Alignment {
  const normalizedInput = input.replace(/^\uFEFF/, "");

  if (normalizedInput.trim().length === 0) {
    throw new Error("FASTA input is empty.");
  }

  const records: SequenceRecord[] = [];
  let currentHeader: string | null = null;
  let currentSequenceLines: string[] = [];

  for (const rawLine of normalizedInput.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.length === 0) {
      continue;
    }

    if (line.startsWith(">")) {
      if (currentHeader !== null) {
        records.push(createSequenceRecord(currentHeader, currentSequenceLines));
      }

      currentHeader = line.slice(1).trim();
      currentSequenceLines = [];
      continue;
    }

    if (currentHeader === null) {
      throw new Error("FASTA sequence content appeared before a header.");
    }

    currentSequenceLines.push(line);
  }

  if (currentHeader !== null) {
    records.push(createSequenceRecord(currentHeader, currentSequenceLines));
  }

  const alignment: Alignment = { sequences: records };
  validateAlignment(alignment);
  return alignment;
}

export function exportAlignedFasta(alignment: Alignment): string {
  validateAlignment(alignment);

  return alignment.sequences
    .map((record) => `>${record.name}\n${record.sequence}`)
    .join("\n");
}

function createSequenceRecord(header: string, sequenceLines: string[]): SequenceRecord {
  const id = header.split(/\s+/, 1)[0] ?? "";

  return {
    id,
    name: header,
    sequence: sequenceLines.join("")
  };
}
