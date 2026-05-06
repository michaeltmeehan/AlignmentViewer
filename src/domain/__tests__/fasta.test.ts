import { describe, expect, it } from "vitest";
import { exportAlignedFasta, parseAlignedFasta } from "../fasta";

describe("FASTA aligned sequence parsing", () => {
  it("parses valid aligned FASTA", () => {
    const alignment = parseAlignedFasta(">seq1\nAC-GT\n>seq2\nA--GT");

    expect(alignment.sequences).toHaveLength(2);
  });

  it("rejects empty FASTA input", () => {
    expect(() => parseAlignedFasta(" \n\t\n")).toThrow(/empty/i);
  });

  it("rejects unequal sequence lengths", () => {
    expect(() => parseAlignedFasta(">seq1\nACGT\n>seq2\nACG")).toThrow(
      /same length/i
    );
  });

  it("rejects a FASTA record with a header but no sequence", () => {
    expect(() => parseAlignedFasta(">seq1\nACGT\n>seq2\n")).toThrow(
      /non-empty sequence content/i
    );
  });

  it("preserves sequence names and ids", () => {
    const alignment = parseAlignedFasta(
      ">seq1 Human sample\nAC-GT\n>seq2 Mouse sample\nA--GT"
    );

    expect(alignment.sequences[0]).toMatchObject({
      id: "seq1",
      name: "seq1 Human sample"
    });
    expect(alignment.sequences[1]).toMatchObject({
      id: "seq2",
      name: "seq2 Mouse sample"
    });
  });

  it("preserves sequence content", () => {
    const alignment = parseAlignedFasta(">seq1\nAC-GT\n>seq2\nA--GT");

    expect(alignment.sequences.map((record) => record.sequence)).toEqual([
      "AC-GT",
      "A--GT"
    ]);
  });
});

describe("FASTA aligned sequence export", () => {
  it("exports an alignment back to FASTA", () => {
    const alignment = parseAlignedFasta(
      ">seq1 Human sample\nAC-GT\n>seq2 Mouse sample\nA--GT"
    );

    expect(exportAlignedFasta(alignment)).toBe(
      ">seq1 Human sample\nAC-GT\n>seq2 Mouse sample\nA--GT"
    );
  });
});
