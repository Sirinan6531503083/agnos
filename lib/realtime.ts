/** ตัวจัดการการซิงค์แบบเรียลไทม์ (โหมด Supabase เท่านั้น)

*
* - ใช้ช่องทางการออกอากาศแบบเรียลไทม์ของ Supabase `agnos-broadcast` เมื่อ
* `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ถูกตั้งค่า
* - หากไม่ได้กำหนดค่า Supabase ตัวจัดการจะยังคงไม่ทำงาน
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
  private handlers: Set<MessageHandler> = new Set();
  private supabaseClient: any = null;
  private supabaseChannel: any = null;
  private sendQueue: SyncMessage[] = [];
  private channelReady: boolean = false;

  constructor() {
    if (typeof window === "undefined") return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.initSupabaseRealtime(supabaseUrl, supabaseKey).catch((err) => {
        console.warn("Realtime: failed to initialize Supabase realtime; realtime disabled.", err);
      });
    } else {
      
      console.warn("Realtime: Supabase not configured; realtime disabled.");
    }
  }

  // เริ่มต้นใช้งาน Supabase Realtime สำหรับการซิงค์ข้อมูลระหว่างอุปกรณ์
  private async initSupabaseRealtime(supabaseUrl: string, supabaseKey: string) {
    try {
      
      const { getSupabaseClient } = await import("./supabase");
      this.supabaseClient = getSupabaseClient();

      this.supabaseChannel = this.supabaseClient.channel("agnos-broadcast");

      this.supabaseChannel.on("broadcast", { event: "agnos" }, (payload: any) => {
        try {
          const msg = payload?.payload ?? payload?.message ?? payload;
          this.notifyHandlers(msg as SyncMessage);
        } catch (e) {
        }
      });

      const { error } = await this.supabaseChannel.subscribe();
      if (error) {
        console.warn("Realtime: supabase channel subscription error:", error);
        return;
      }

      this.channelReady = true;
      console.info("Realtime: supabase channel subscribed");

      
      while (this.sendQueue.length > 0) {
        const msg = this.sendQueue.shift();
        if (msg) {
          try {
            
            await this.supabaseChannel.send({ type: "broadcast", event: "agnos", payload: msg });
          } catch (e) {
            console.warn("Realtime: failed to flush queued message", e);
          }
        }
      }
    } catch (err) {
      console.warn("Realtime: failed to initialize Supabase realtime, realtime disabled.", err);
    }
  }

  public subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  public async send(type: SyncMessage["type"], sessionId: string, payload: any): Promise<void> {
    const msg: SyncMessage = { type, sessionId, payload, timestamp: new Date().toISOString() };

    if (!this.supabaseChannel || !this.channelReady) {
      this.sendQueue.push(msg);
      console.debug("Realtime: queued message until supabase channel ready", msg.type, msg.sessionId);
      return;
    }

    try {
      await this.supabaseChannel.send({ type: "broadcast", event: "agnos", payload: msg });
      console.debug("Realtime: sent message", msg.type, msg.sessionId);
    } catch (e) {
      console.warn("Realtime: failed to send message", e);
      this.sendQueue.push(msg);
    }
  }

  public isConnected(): boolean {
    return this.supabaseChannel !== null;
  }

  private notifyHandlers(msg: SyncMessage): void {
    this.handlers.forEach((handler) => {
      try {
        handler(msg);
      } catch (err) {
        console.error("Error in sync message handler:", err);
      }
    });
  }
}

export const realtime = new RealtimeSyncManager();
