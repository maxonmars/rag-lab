import { InputError } from "../adapters/cli/index.ts";
import { listen, type RunningServer } from "../adapters/http/index.ts";
import type { RagAnswerHandlerOptions } from "./ragAnswer.ts";
import { createRagService } from "./ragService.ts";
import { createSessionStore } from "./ragSessions.ts";

export type RagServeOptions = RagAnswerHandlerOptions & Readonly<{ waitForStop: () => Promise<void> }>;

/** Команда `rag serve`: индекс и модель проверяются до `listen`; сервер работает, пока не завершится `waitForStop`. */
export function createRagServeHandler(options: RagServeOptions): () => Promise<void> {
  return async () => {
    const { view } = options;
    const { values } = options.getConfig();
    const host = values["service.host"];
    const port = values["service.port"];
    const store = createSessionStore({
      maxSessions: values["service.maxSessions"],
      idleMs: values["service.sessionIdleMs"],
      now: Date.now,
    });
    const service = await createRagService({ ...options, store });
    let server: RunningServer;
    try {
      server = await listen({
        host,
        port,
        handle: service.handle,
        errorType: "rag_service_error",
        log: (line) => view.progress(line),
      });
    } catch (error) {
      const code = error instanceof Error && "code" in error ? String(error.code) : "неизвестная ошибка";
      throw new InputError(
        `Не удалось начать слушать ${host}:${port} (${code}). Проверьте service.host и service.port.`,
      );
    }
    view.serving([`Адрес: ${server.url}`, ...service.describe(), "Остановка: Ctrl+C."]);
    await options.waitForStop();
    await server.close();
  };
}
