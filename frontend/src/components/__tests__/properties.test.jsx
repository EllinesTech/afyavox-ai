/**
 * Property-based tests for AfyaVox AI Phase 1 frontend.
 * Feature: afyavox-ai-phase1
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import MicButton from "../MicButton";
import TranscriptPanel from "../Transcript";

// Feature: afyavox-ai-phase1, Property 4: Recording indicator shown during recording
// Validates: Requirements 1.4
describe("Property 4: Recording indicator shown during recording", () => {
  it("recording-indicator is always visible when state is recording", () => {
    fc.assert(
      fc.property(fc.constant("recording"), (state) => {
        const { unmount } = render(<MicButton state={state} onClick={() => {}} />);
        const indicator = screen.getByTestId("recording-indicator");
        expect(indicator).toBeInTheDocument();
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: afyavox-ai-phase1, Property 6: Loading indicator shown during transcription
// Validates: Requirements 4.3
describe("Property 6: Loading indicator shown during transcription", () => {
  it("loading-indicator is visible and transcript-text is absent when status is loading", () => {
    fc.assert(
      fc.property(fc.constant("loading"), (status) => {
        const { unmount } = render(
          <TranscriptPanel status={status} transcript="" language="" error={null} />
        );
        expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
        expect(screen.queryByTestId("transcript-text")).not.toBeInTheDocument();
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: afyavox-ai-phase1, Property 7: Full transcript display without truncation
// Validates: Requirements 4.5
describe("Property 7: Full transcript display without truncation", () => {
  it("transcript-text always contains the complete transcript string", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 5000 }), (transcript) => {
        const { unmount } = render(
          <TranscriptPanel
            transcript={transcript}
            status="done"
            language="en"
            error={null}
          />
        );
        expect(screen.getByTestId("transcript-text").textContent).toBe(transcript);
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
