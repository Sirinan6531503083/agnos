/**
 * Agnos Healthcare - Real-Time Synchronization Manager
 * 
 * Synchronizes Patient Form and Staff Dashboard via:
 * 1. HTML5 BroadcastChannel (zero-config instant same-browser multi-tab sync)
 * 2. WebSockets (cross-browser / cross-device local sync when WS server is active)
 */

export type PatientStatus = "filling" | "inactive" | "submitted";

export interface SyncMessage {
  type: "presence" | "field_update" | "field_focus" | "request_sync" | "sync_response";
  sessionId: string;
  payload: any;
  timestamp: string;
}

export type MessageHandler = (message: SyncMessage) => void;

class RealtimeSyncManager {
  private socket: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private isConnecting: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initBroadcastChannel();
      this.initWebSocket();
    }
  }

  // 1. Initialize Browser BroadcastChannel for zero-config multi-tab local sync
  private initBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel("agnos-patient-sync");
      this.broadcastChannel.onmessage = (event) => {
        if (event && event.data) {
          this.notifyHandlers(event.data);
        }
      };
    } catch {
      // BroadcastChannel optional fallback
    }
  }

  // 2. Optional WebSocket client connection (graceful optional connection)
  private initWebSocket() {
    if (this.isConnecting || this.socket) return;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:8080`;

    try {
      this.isConnecting = true;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        this.socket = ws;
        this.isConnecting = false;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as SyncMessage;
          this.notifyHandlers(msg);
        } catch {
          // Ignore invalid parse
        }
      };

      ws.onclose = () => {
        this.socket = null;
        this.isConnecting = false;
      };

      ws.onerror = () => {
        // Silent error fallback to BroadcastChannel
        this.socket = null;
        this.isConnecting = false;
      };
    } catch {
      this.isConnecting = false;
    }
  }

  /**
   * Register callback to handle incoming real-time sync messages
   */
  public subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Broadcast message to all connected clients
   */
  public send(type: SyncMessage["type"], sessionId: string, payload: any): void {
    const msg: SyncMessage = {
      type,
      sessionId,
      payload,
      timestamp: new Date().toISOString(),
    };

    // Broadcast via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch {}
    }

    // Broadcast via WebSocket if active
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(msg));
      } catch {}
    }
  }

  /**
   * Returns true if BroadcastChannel or WebSocket is active
   */
  public isConnected(): boolean {
    return this.broadcastChannel !== null || (this.socket !== null && this.socket.readyState === WebSocket.OPEN);
  }

  private notifyHandlers(msg: SyncMessage): void {
    this.handlers.forEach((handler) => {
      try {
        handler(msg);
      } catch (err) {
        console.error("❌ Error in sync message handler:", err);
      }
    });
  }
}

export const realtime = new RealtimeSyncManager();
