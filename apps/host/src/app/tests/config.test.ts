import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseOptions, resolveConfig, showConfig } from "../config.ts";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "rag-lab-config-"));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("конфигурация", () => {
  it("применяет defaults < файл < env < CLI и сохраняет источники", () => {
    writeFileSync(join(root, "lab.config.yaml"), "llm.model: file-model\nllm.timeoutMs: 10\n");
    const config = resolveConfig({ "llm.model": "cli-model" }, { LAB_LLM_MODEL: "env-model" }, root);
    expect(config.values["llm.model"]).toBe("cli-model");
    expect(config.sources["llm.model"]).toBe("cli");
    expect(config.values["llm.timeoutMs"]).toBe(10);
    expect(config.sources["llm.timeoutMs"]).toBe("file");
    expect(config.sources["llm.maxOutputTokens"]).toBe("default");
    expect(resolveConfig({}, { LAB_LLM_MODEL: "env-model" }, root).sources["llm.model"]).toBe("env");
  });

  it("применяет приоритет источников для настроек RAG", () => {
    writeFileSync(join(root, "lab.config.yaml"), "rag.inputDir: file-dir\nrag.chunkSizeChars: 20\n");
    const config = resolveConfig(
      { "rag.inputDir": "cli-dir", "rag.chunkSizeChars": "40" },
      { LAB_RAG_INPUT_DIR: "env-dir", LAB_RAG_CHUNK_SIZE_CHARS: "30" },
      root,
    );
    expect(config.values["rag.inputDir"]).toBe("cli-dir");
    expect(config.values["rag.chunkSizeChars"]).toBe(40);
    expect(config.sources["rag.inputDir"]).toBe("cli");
    expect(resolveConfig({}, {}, root).sources["rag.inputDir"]).toBe("file");
    const envOnly = resolveConfig({}, { LAB_RAG_INPUT_DIR: "env-dir", LAB_RAG_CHUNK_SIZE_CHARS: "30" }, root);
    expect(envOnly.values["rag.inputDir"]).toBe("env-dir");
    expect(envOnly.values["rag.chunkSizeChars"]).toBe(30);
    expect(envOnly.sources["rag.chunkSizeChars"]).toBe("env");
  });

  it("не выводит секрет и не принимает его из файла или CLI", () => {
    const config = resolveConfig({}, { LAB_LLM_API_KEY: "sensitive" }, root);
    const rows = showConfig(config);
    expect(rows).toContainEqual({ key: "llm.apiKey", value: "[задано]", source: "env" });
    expect(JSON.stringify(rows)).not.toContain("sensitive");
    expect(showConfig(resolveConfig({}, {}, root))).toContainEqual({
      key: "llm.apiKey",
      value: "[не задано]",
      source: "default",
    });
    expect(() => parseOptions(["--llm-api-key", "sensitive"])).toThrow();
    expect(() => resolveConfig({ "llm.apiKey": "sensitive" }, {}, root)).toThrow();
    writeFileSync(join(root, "lab.config.yaml"), "llm.apiKey: sensitive");
    expect(() => resolveConfig({}, {}, root)).toThrow(/недоступная настройка/);
  });

  it("отклоняет некорректный источник даже при наличии переопределения", () => {
    writeFileSync(join(root, "lab.config.yaml"), "llm.timeoutMs: -1");
    expect(() => resolveConfig({ "llm.timeoutMs": "20" }, {}, root)).toThrow(/источник: file/);
  });

  it("отклоняет пустой путь, нулевой размер чанка и некорректный адрес Ollama", () => {
    expect(() => resolveConfig({ "rag.inputDir": " " }, {}, root)).toThrow(/rag.inputDir/);
    expect(() => resolveConfig({ "rag.chunkSizeChars": "0" }, {}, root)).toThrow(/rag.chunkSizeChars/);
    expect(() => resolveConfig({ "rag.embeddingBaseUrl": "не адрес" }, {}, root)).toThrow(/rag.embeddingBaseUrl/);
    writeFileSync(join(root, "lab.config.yaml"), 'rag.inputDir: " "\n');
    expect(() => resolveConfig({ "rag.inputDir": "valid" }, {}, root)).toThrow(/источник: file/);
  });

  it("допускает нулевое перекрытие", () => {
    expect(resolveConfig({ "rag.overlapChars": "0" }, {}, root).values["rag.overlapChars"]).toBe(0);
  });

  it.each(["llm.model: [x]", "unknown: value", "- list", "llm.model: ["])("отклоняет файл %s", (text) => {
    writeFileSync(join(root, "lab.config.yaml"), text);
    expect(() => resolveConfig({}, {}, root)).toThrow();
  });

  it("различает отсутствующий default-файл и явно указанный путь", () => {
    const config = resolveConfig({}, {}, root);
    expect(config.values["llm.model"]).toBe("deepseek-flash");
    expect(config.values["rag.inputDir"]).toBe(".local/rag/corpus");
    expect(config.values["rag.embeddingModel"]).toBe("bge-m3");
    expect(() => resolveConfig({ "config.file": "missing.yaml" }, {}, root)).toThrow(/прочитать/);
  });

  it("разбирает флаги из реестра и сохраняет текст после --", () => {
    expect(parseOptions(["--llm-model=other", "ask", "--", "--literal"])).toEqual({
      flags: { "llm.model": "other" },
      command: ["ask", "--literal"],
    });
    for (const argv of [["--unknown", "x"], ["--llm-model"], ["--llm-model=x", "--llm-model=y"]]) {
      expect(() => parseOptions(argv)).toThrow();
    }
    expect(parseOptions(["--rag-input-dir", "folder", "--rag-chunk-size-chars=12", "rag", "index"])).toEqual({
      flags: { "rag.inputDir": "folder", "rag.chunkSizeChars": "12" },
      command: ["rag", "index"],
    });
  });
});
