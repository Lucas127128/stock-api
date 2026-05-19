import { Elysia, t } from "elysia";
import { Service } from "./service";

const app = new Elysia({
  precompile: true,
  aot: true,
})
  // .use(openapi())
  .post(
    "/stockPrice",
    async ({ body }) => {
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
        502: t.Object({
          message: t.Readonly(t.String()),
        }),
      },
    },
  )
  .listen(3000);

console.log(`Server is running on port ${app.server?.port}`);
