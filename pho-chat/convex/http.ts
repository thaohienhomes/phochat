import { httpRouter } from "convex/server";
import { handleWebhook } from "./functions/handleWebhook";

const http = httpRouter();

http.route({ path: "/api/webhooks", method: "POST" }, handleWebhook);

export default http;

