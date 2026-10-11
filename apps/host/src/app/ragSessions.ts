import { randomUUID } from "node:crypto";
import { HttpError } from "../adapters/http/index.ts";
import { type Dialog, EMPTY_DIALOG } from "../features/rag/index.ts";

export type SessionStoreOptions = Readonly<{ maxSessions: number; idleMs: number; now: () => number }>;

export type SessionTurn = Readonly<{ id: string; dialog: Dialog }>;

type Session = { dialog: Dialog; lastUsed: number; busy: boolean; committed: boolean };

/**
 * Диалоги `rag serve` в памяти процесса. Сессия занята с `begin` до `release`; новая без `commit`
 * удаляется в `release`, поэтому неудачный первый ход её не создаёт.
 */
export function createSessionStore(options: SessionStoreOptions) {
  const sessions = new Map<string, Session>();

  const expire = () => {
    const now = options.now();
    for (const [id, session] of sessions) {
      if (!session.busy && now - session.lastUsed > options.idleMs) sessions.delete(id);
    }
  };

  const evictOldest = (): boolean => {
    let oldest: [string, Session] | undefined;
    for (const entry of sessions) {
      if (!entry[1].busy && (!oldest || entry[1].lastUsed < oldest[1].lastUsed)) oldest = entry;
    }
    if (oldest) sessions.delete(oldest[0]);
    return oldest !== undefined;
  };

  return {
    /** Занимает сессию на ход; без `id` или с неизвестным `id` создаёт новую. */
    begin(id?: string): SessionTurn {
      expire();
      const existing = id === undefined ? undefined : sessions.get(id);
      if (id !== undefined && existing) {
        if (existing.busy) throw new HttpError(409, "session_busy", "По этой сессии уже идёт ход.");
        existing.busy = true;
        return { id, dialog: existing.dialog };
      }
      if (sessions.size >= options.maxSessions && !evictOldest()) {
        throw new HttpError(503, "too_many_sessions", `Открыто ${options.maxSessions} сессий, все заняты ходом.`);
      }
      const created = id ?? randomUUID();
      sessions.set(created, { dialog: EMPTY_DIALOG, lastUsed: options.now(), busy: true, committed: false });
      return { id: created, dialog: EMPTY_DIALOG };
    },

    commit(id: string, dialog: Dialog): void {
      const session = sessions.get(id);
      if (!session) return;
      Object.assign(session, { dialog, lastUsed: options.now(), committed: true });
    },

    /** Снимает занятость; сессия без успешного хода удаляется. */
    release(id: string): void {
      const session = sessions.get(id);
      if (!session) return;
      if (session.committed) session.busy = false;
      else sessions.delete(id);
    },

    delete(id: string): boolean {
      expire();
      const session = sessions.get(id);
      if (!session?.committed) return false;
      sessions.delete(id);
      return true;
    },
  };
}

export type SessionStore = ReturnType<typeof createSessionStore>;
