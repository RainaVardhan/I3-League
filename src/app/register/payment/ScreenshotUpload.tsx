"use client";

import { useRef, useState, type DragEvent } from "react";
import styles from "./ScreenshotUpload.module.css";

const ACCEPT = "image/png,image/jpeg,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Custom drag-and-drop dropzone in front of a real <input type="file">, so
// the field still posts as normal FormData on submit — this only replaces
// the look of the control, not how the form actually carries the file.
export function ScreenshotUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function acceptFile(candidate: File | undefined) {
    if (!candidate) return;
    if (candidate.size > MAX_BYTES) {
      setError("That file is over 5MB — please choose a smaller screenshot.");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(candidate.type)) {
      setError("Please choose a PNG, JPEG, or WebP image.");
      return;
    }
    setError(null);
    setFile(candidate);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (!dropped || !inputRef.current) return;

    // Keep the real <input> in sync with the drop so it's what actually
    // gets submitted — a File object alone in React state isn't enough.
    const transfer = new DataTransfer();
    transfer.items.add(dropped);
    inputRef.current.files = transfer.files;
    acceptFile(dropped);
  }

  function handleRemove() {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <span className={styles.label}>Screenshot (optional)</span>
      <div
        className={isDragging ? `${styles.dropzone} ${styles.dropzoneActive}` : styles.dropzone}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          id="screenshot"
          name="screenshot"
          type="file"
          accept={ACCEPT}
          className={styles.hiddenInput}
          onChange={(event) => acceptFile(event.target.files?.[0])}
        />

        {file ? (
          <div className={styles.fileRow}>
            <span className={styles.fileIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <path d="M14 3v6h6" />
              </svg>
            </span>
            <span className={styles.fileText}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatBytes(file.size)}</span>
            </span>
            <button
              type="button"
              className={styles.removeButton}
              onClick={(event) => {
                event.stopPropagation();
                handleRemove();
              }}
              aria-label="Remove screenshot"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className={styles.prompt}>
            <span className={styles.uploadIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 16V4M12 4 7 9M12 4l5 5" />
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
            </span>
            <span className={styles.promptText}>
              <strong>Click to upload</strong> or drag and drop
            </span>
            <span className={styles.promptHint}>PNG, JPEG, or WebP, up to 5MB</span>
          </div>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
