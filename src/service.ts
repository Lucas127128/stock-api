import { StockClient } from "@itick/browser-sdk";
import { status } from "elysia";
import { env } from "cloudflare:workers";

const options = {
  baseURL: "https://api0.itick.org",
  wssURL: "wss://api0.itick.org",
};
const token = env.ITICK_TOKEN;
if (!token) throw new Error("ITICK_TOKEN not set");
const client = new StockClient(token, options);

export async function getCurrentStockPrice(symbol: string, client: StockClient) {
  const response = await client.getQuote({ region: "US", code: symbol });
  if (response.code !== 0) {
    return status(502, { message: response.msg ?? "Unknown external error" });
  }
  return status(200, { price: response.data.ld });
}

export const Service = {
  async getCurrentStockPrice(symbol: string, token?: string) {
    if (!token) {
      return getCurrentStockPrice(symbol, client);
    } else {
      const client = new StockClient(token, options);
      return getCurrentStockPrice(symbol, client);
    }
  },
};
