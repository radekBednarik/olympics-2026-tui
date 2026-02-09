const BSU = "\x1b[?2026h"; // Begin Synchronized Update
const ESU = "\x1b[?2026l"; // End Synchronized Update

/**
 * Wraps process.stdout.write so every write is enclosed in
 * synchronized-update markers. Terminals that support mode 2026
 * (Windows Terminal ≥ 1.18, kitty, foot, etc.) will buffer the
 * output and paint it in one
 *
 * Terminals that don't recognise the sequence silently ignore it.
 */
export function enableSyncOutput(
  stream: NodeJS.WriteStream = process.stdout
): void {
  const originalWrite = stream.write.bind(stream) as typeof stream.write;

  stream.write = function patchedWrite(
    chunk: Uint8Array | string,
    encodingOrCb?: BufferEncoding | ((error?: Error | null) => void),
    cb?: (error?: Error | null) => void
  ): boolean {
    originalWrite(BSU);
    const result = originalWrite(chunk, encodingOrCb as BufferEncoding, cb);
    originalWrite(ESU);
    return result;
  };
}
