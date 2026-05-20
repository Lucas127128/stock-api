import { Elysia, status, t } from "elysia";
import { Service } from "./service";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { env } from "cloudflare:workers";
import { cors } from "@elysiajs/cors";

const app = new Elysia({ adapter: CloudflareAdapter, aot: true })
  .use(cors({ origin: "https://hoppscotch.io", allowedHeaders: ["Content-Type"] }))
  .post(
    "/stockPrice",
    async ({ body }) => {
      const { success } = await env.RATE_LIMITER.limit({ key: "stockPrice" });
      if (!success) {
        return status(429, { message: "Too many requests" });
      }
      const { symbol, token } = body;
      return await Service.getCurrentStockPrice(symbol, token);
    },
    {
      detail: {
        summary: "Get the current stock price by symbol(us only)",
      },
      body: t.Object({
        symbol: t.String(),
        token: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          price: t.Readonly(t.Number()),
        }),
        429: t.Object({
          message: t.Readonly(t.String()),
        }),
        502: t.Object({
          message: t.Readonly(t.String()),
        }),
      },
    },
  )
  .compile();

console.log(`Server is running on port ${app.server?.port}`);

export default app;
