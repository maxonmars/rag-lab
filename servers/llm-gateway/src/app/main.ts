import { createGateway } from "./compose.ts";
import { GatewayConfigError, parseGatewayConfig } from "./config.ts";

function main(): void {
  let config: ReturnType<typeof parseGatewayConfig>;
  try {
    config = parseGatewayConfig(process.env);
  } catch (error) {
    if (!(error instanceof GatewayConfigError)) throw error;
    console.error(`llm-gateway: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const server = createGateway({ config, fetch, now: Date.now, log: (line) => console.log(line) });
  server.on("error", (error) => {
    console.error(`llm-gateway: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(config.port, config.host, () => {
    console.log(
      `llm-gateway: http://${config.host}:${config.port} → ${config.upstreamUrl}, модель ${config.model}, RAG → ${config.ragUrl}; ` +
        `ключей ${config.apiKeys.length}, ${config.rateLimitPerMinute} запросов/мин, ` +
        `параллельно ${config.maxConcurrent}, очередь ${config.maxQueue}, ` +
        `вход ${config.maxInputChars} символов, выход ${config.maxOutputTokens} токенов, ` +
        `таймаут upstream ${config.upstreamTimeoutMs} мс`,
    );
  });
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      server.close();
      server.closeIdleConnections();
    });
  }
}

main();
