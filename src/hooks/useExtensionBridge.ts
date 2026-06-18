"use client";

import { useEffect, useCallback } from "react";
import {
  EXTENSION_MESSAGE_TYPES,
  isExtensionOrigin,
  type ExtensionMessage,
  type ExtensionPingPayload,
} from "@/lib/extension-protocol";

/**
 * Listens for messages from the InkFit browser extension.
 * Wire into dashboard layout when the extension ships.
 */
export function useExtensionBridge(
  onPing?: (payload: ExtensionPingPayload) => void
) {
  const handleMessage = useCallback(
    (event: MessageEvent<ExtensionMessage>) => {
      if (!isExtensionOrigin(event.origin)) return;
      const data = event.data;
      if (!data?.type?.startsWith("INKFIT_")) return;

      if (data.type === EXTENSION_MESSAGE_TYPES.PING && onPing) {
        onPing(data.payload as ExtensionPingPayload);
      }
    },
    [onPing]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);
}
