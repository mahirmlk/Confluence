/**
 * Centralized API and WebSocket configuration.
 *
 * All backend URLs MUST be derived from NEXT_PUBLIC_API_URL.
 * Never hardcode localhost in production code.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Derive WebSocket base URL from API_URL (http → ws, https → wss) */
export const WS_URL = API_URL.replace(/^http/, "ws");
