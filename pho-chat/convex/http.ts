import { httpRouter } from "convex/server";
import { revenuecatWebhook } from "./httpHandlers/revenuecat";

const http = httpRouter();

http.route({
  path: "/revenuecat-webhook",
  method: "POST",
  handler: revenuecatWebhook,
});

export default http;