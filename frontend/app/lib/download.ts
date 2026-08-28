/**
 * Saves a blob to disk through the browser's own download UI.
 *
 * Deliberately the ONLY way the app hands a file to the user: an earlier
 * version also previewed the devis in a tab opened before the fetch, so
 * generating one popped up two windows at once. No `window.open`, no
 * `target="_blank"` — the download shelf is the single entry point.
 *
 * Wrapping the blob in a File keeps the intended name in "Save As" dialogs,
 * where the `download` attribute alone is ignored.
 */
export function downloadBlob(blob: Blob, fileName: string, type: string) {
  const objectUrl = URL.createObjectURL(new File([blob], fileName, { type }));
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke once the download has had time to start, to avoid leaking the blob.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
