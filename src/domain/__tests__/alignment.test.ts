import { describe, expect, it } from "vitest";
import {
  Alignment,
  getColumnSummaries,
  getColumnSummary,
  getConsensusSequence,
  getVariableColumnIndices
} from "../alignment";

const alignment: Alignment = {
  sequences: [
    { id: "seq1", name: "seq1", sequence: "A-CAT" },
    { id: "seq2", name: "seq2", sequence: "ATC-T" },
    { id: "seq3", name: "seq3", sequence: "G-CCT" }
  ]
};

describe("alignment column summaries", () => {
  it("counts symbols in a column", () => {
    expect(getColumnSummary(alignment, 1).counts).toEqual({
      "-": 2,
      T: 1
    });
  });

  it("calculates consensus from the most frequent non-gap symbol", () => {
    expect(getColumnSummary(alignment, 2).consensus).toBe("C");
  });

  it("calculates gap fraction", () => {
    expect(getColumnSummary(alignment, 1).gapFraction).toBe(2 / 3);
  });

  it("detects variable columns from non-gap symbols", () => {
    expect(getColumnSummary(alignment, 0).isVariable).toBe(true);
    expect(getColumnSummary(alignment, 1).isVariable).toBe(false);
    expect(getVariableColumnIndices(alignment)).toEqual([0, 3]);
  });

  it("uses '-' as consensus for an all-gap column", () => {
    const allGapAlignment: Alignment = {
      sequences: [
        { id: "seq1", name: "seq1", sequence: "-" },
        { id: "seq2", name: "seq2", sequence: "-" }
      ]
    };

    expect(getColumnSummary(allGapAlignment, 0)).toMatchObject({
      consensus: "-",
      gapFraction: 1,
      isVariable: false
    });
  });

  it("breaks consensus ties alphabetically", () => {
    const tiedAlignment: Alignment = {
      sequences: [
        { id: "seq1", name: "seq1", sequence: "T" },
        { id: "seq2", name: "seq2", sequence: "A" }
      ]
    };

    expect(getColumnSummary(tiedAlignment, 0).consensus).toBe("A");
  });

  it("summarizes every column", () => {
    expect(getColumnSummaries(alignment).map((summary) => summary.index)).toEqual([
      0, 1, 2, 3, 4
    ]);
  });

  it("builds the full consensus sequence", () => {
    expect(getConsensusSequence(alignment)).toBe("ATCAT");
  });
});
