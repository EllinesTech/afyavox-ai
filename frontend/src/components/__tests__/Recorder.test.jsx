import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import RecorderPanel from "../Recorder";

// Mock canvas getContext so WaveformVisualizer doesn't crash in jsdom
const mockCtx = {
  clearRect: vi.fn(),
  strokeStyle: "",
  lineWidth: 0,
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillRect: vi.fn(),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fillStyle: "",
};
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);

// Mock AudioContext so WaveformVisualizer doesn't crash when active=true
const mockAnalyser = {
  fftSize: 256,
  frequencyBinCount: 128,
  getByteFrequencyData: vi.fn(),
};
const mockAudioCtx = {
  createMediaStreamSource: vi.fn(() => ({ connect: vi.fn() })),
  createAnalyser: vi.fn(() => mockAnalyser),
  close: vi.fn(),
};
global.AudioContext = vi.fn(() => mockAudioCtx);
global.webkitAudioContext = vi.fn(() => mockAudioCtx);

describe("RecorderPanel", () => {
  beforeEach(() => {
    // Reset canvas mock calls
    Object.values(mockCtx).forEach((v) => typeof v === "function" && v.mockClear?.());
    // Mock fetch
    global.fetch = vi.fn();
    // Mock getUserMedia
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn(),
    };
    // Mock MediaRecorder
    global.MediaRecorder = vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      ondataavailable: null,
      onstop: null,
    }));
    MediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows permission denied error when getUserMedia rejects", async () => {
    navigator.mediaDevices.getUserMedia.mockRejectedValue(
      Object.assign(new Error("Permission denied"), { name: "NotAllowedError" })
    );
    render(<RecorderPanel onTranscriptReceived={vi.fn()} />);
    const micBtn = screen.getByTestId("mic-button");
    fireEvent.click(micBtn);
    await waitFor(() => {
      expect(screen.getByText(/microphone access denied/i)).toBeInTheDocument();
    });
  });

  it("shows upload indicator during uploading state", async () => {
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
    navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);

    // Mock fetch to hang (never resolve) so we stay in uploading state
    global.fetch = vi.fn(() => new Promise(() => {}));

    const mockRecorder = {
      start: vi.fn(),
      stop: vi.fn(),
      ondataavailable: null,
      onstop: null,
    };
    global.MediaRecorder = vi.fn().mockImplementation(() => mockRecorder);
    MediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true);

    render(<RecorderPanel onTranscriptReceived={vi.fn()} />);
    const micBtn = screen.getByTestId("mic-button");
    fireEvent.click(micBtn);

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });

    // Wait for recorder to be fully set up (onstop assigned by RecorderPanel)
    await waitFor(() => {
      expect(mockRecorder.onstop).not.toBeNull();
    });

    // Trigger onstop to simulate stopping recording
    mockRecorder.onstop();

    await waitFor(() => {
      expect(screen.getByTestId("upload-indicator")).toBeInTheDocument();
    });
  });

  it("shows error message on 413 response", async () => {
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
    navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream);
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 413,
      json: () => Promise.resolve({ detail: "File too large" }),
    });

    const mockRecorder = {
      start: vi.fn(),
      stop: vi.fn(),
      ondataavailable: null,
      onstop: null,
    };
    global.MediaRecorder = vi.fn().mockImplementation(() => mockRecorder);
    MediaRecorder.isTypeSupported = vi.fn().mockReturnValue(true);

    render(<RecorderPanel onTranscriptReceived={vi.fn()} />);
    fireEvent.click(screen.getByTestId("mic-button"));

    await waitFor(() => navigator.mediaDevices.getUserMedia.mock.calls.length > 0);

    // Wait for recorder to be fully set up (onstop assigned by RecorderPanel)
    await waitFor(() => {
      expect(mockRecorder.onstop).not.toBeNull();
    });

    mockRecorder.onstop();

    await waitFor(() => {
      expect(screen.getByText(/too large/i)).toBeInTheDocument();
    });
  });
});
