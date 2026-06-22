const PREFIX = "[InkFit Cursor]";

/** Enable with NEXT_PUBLIC_DEBUG_CURSOR=true in .env.local */
export function isCursorDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    process.env.NEXT_PUBLIC_DEBUG_CURSOR === "true" ||
    process.env.NODE_ENV === "development"
  );
}

export function cursorLog(message: string, data?: Record<string, unknown>): void {
  if (!isCursorDebugEnabled()) return;
  if (data) {
    console.log(PREFIX, message, data);
  } else {
    console.log(PREFIX, message);
  }
}

export function cursorWarn(message: string, data?: Record<string, unknown>): void {
  if (!isCursorDebugEnabled()) return;
  if (data) {
    console.warn(PREFIX, message, data);
  } else {
    console.warn(PREFIX, message);
  }
}

export function cursorError(message: string, data?: Record<string, unknown>): void {
  console.error(PREFIX, message, data ?? "");
}
