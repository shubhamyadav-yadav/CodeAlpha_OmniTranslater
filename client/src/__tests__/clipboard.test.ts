import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard } from '../utils/clipboard.js';

describe('Clipboard Utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return false if text is empty', async () => {
    const result = await copyToClipboard('');
    expect(result).toBe(false);
  });

  it('should copy text successfully using navigator.clipboard when available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const result = await copyToClipboard('Hello, world!');
    expect(writeTextMock).toHaveBeenCalledWith('Hello, world!');
    expect(result).toBe(true);
  });
});
