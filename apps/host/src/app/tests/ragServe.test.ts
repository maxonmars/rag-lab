import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke, keywordEmbeddings, writeCorpus } from "./harness.ts";

const embeddings = () => keywordEmbeddings(["слово"]);

async function freePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const { port } = probe.address() as AddressInfo;
  await new Promise((resolve) => probe.close(resolve));
  return port;
}

let cwd: string;
beforeEach(async () => {
  cwd = mkdtempSync(join(tmpdir(), "rag-lab-serve-"));
  writeCorpus(join(cwd, ".local/rag/corpus"), { "a.md": `# Один\n\n${"слово ".repeat(500)}` });
  await invoke(["rag", "index"], { cwd, embeddings: embeddings() });
});
afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

describe("rag serve", () => {
  it("печатает адрес и параметры, отвечает на /health до сигнала остановки и освобождает порт после него", async () => {
    const port = await freePort();
    const health = `http://127.0.0.1:${port}/health`;
    const waitForStop = () => vi.waitFor(async () => expect((await fetch(health)).status).toBe(200));
    const result = await invoke(["rag", "serve"], {
      cwd,
      embeddings: embeddings(),
      env: { LAB_SERVICE_PORT: String(port) },
      waitForStop,
    });
    expect(result.code).toBe(0);
    expect(result.output).toContain("── RAG-сервис ──");
    expect(result.output).toContain(`Адрес: http://127.0.0.1:${port}`);
    expect(result.output).toContain("Модель: deepseek · deepseek-flash");
    expect(result.output).not.toContain("test-key");
    await expect(fetch(health)).rejects.toThrow();
  });

  it("без индекса завершается с кодом 1 до запуска сервера", async () => {
    rmSync(join(cwd, ".local/rag/index.json"));
    const waitForStop = vi.fn(async () => {});
    const result = await invoke(["rag", "serve"], { cwd, embeddings: embeddings(), waitForStop });
    expect(result.code).toBe(1);
    expect(result.error).toContain("Индекс не найден");
    expect(waitForStop).not.toHaveBeenCalled();
  });

  it("занятый порт — код 1 и текст про адрес", async () => {
    const holder = createServer();
    await new Promise<void>((resolve) => holder.listen(0, "127.0.0.1", resolve));
    const { port } = holder.address() as AddressInfo;
    try {
      const waitForStop = vi.fn(async () => {});
      const result = await invoke(["rag", "serve"], {
        cwd,
        embeddings: embeddings(),
        env: { LAB_SERVICE_PORT: String(port) },
        waitForStop,
      });
      expect(result.code).toBe(1);
      expect(result.error).toContain(`Не удалось начать слушать 127.0.0.1:${port} (EADDRINUSE)`);
      expect(waitForStop).not.toHaveBeenCalled();
    } finally {
      await new Promise((resolve) => holder.close(resolve));
    }
  });

  it("без ключа DeepSeek завершается с кодом 1 до запуска сервера", async () => {
    const result = await invoke(["rag", "serve"], {
      cwd,
      embeddings: embeddings(),
      authenticated: false,
      waitForStop: async () => {},
    });
    expect(result.code).toBe(1);
    expect(result.error).toContain("LAB_LLM_API_KEY");
  });
});
