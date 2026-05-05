import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import TranscriptPanel from "../Transcript";

describe("TranscriptPanel", () => {
  it("displays transcript text and language badge on success", () => {
    render(
      <TranscriptPanel
        transcript="Patient has a headache."
        language="en"
        status="done"
        error={null}
      />
    );
    expect(screen.getByTestId("transcript-text")).toHaveTextContent("Patient has a headache.");
    expect(screen.getByTestId("language-badge")).toHaveTextContent("English");
  });

  it("shows loading indicator when status is loading", () => {
    render(
      <TranscriptPanel transcript="" language="" status="loading" error={null} />
    );
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
    expect(screen.queryByTestId("transcript-text")).not.toBeInTheDocument();
  });

  it("shows error card and preserves previous transcript", () => {
    const { rerender } = render(
      <TranscriptPanel transcript="Previous text" language="en" status="done" error={null} />
    );
    rerender(
      <TranscriptPanel transcript="Previous text" language="en" status="error" error="Upload failed" />
    );
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
    expect(screen.getByTestId("transcript-text")).toHaveTextContent("Previous text");
  });

  it("copy button writes transcript to clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <TranscriptPanel
        transcript="Test transcript"
        language="sw"
        status="done"
        error={null}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("Test transcript");
    });
  });
});
