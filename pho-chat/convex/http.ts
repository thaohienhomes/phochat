import { httpRouter } from "convex/server";
import { handleRevenueCatWebhook } from "./revenuecat";

const http = httpRouter();

http.route({
  path: "/revenuecat-webhook",
  method: "POST",
  handler: handleRevenueCatWebhook,
});

export default http;