/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as functions__generated_api from "../functions/_generated/api.js";
import type * as functions__generated_server from "../functions/_generated/server.js";
import type * as functions_createChatSession from "../functions/createChatSession.js";
import type * as functions_getChatSession from "../functions/getChatSession.js";
import type * as functions_handleWebhook from "../functions/handleWebhook.js";
import type * as functions_sendMessage from "../functions/sendMessage.js";
import type * as http from "../http.js";
import type * as index from "../index.js";
import type * as types from "../types.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/_generated/api": typeof functions__generated_api;
  "functions/_generated/server": typeof functions__generated_server;
  "functions/createChatSession": typeof functions_createChatSession;
  "functions/getChatSession": typeof functions_getChatSession;
  "functions/handleWebhook": typeof functions_handleWebhook;
  "functions/sendMessage": typeof functions_sendMessage;
  http: typeof http;
  index: typeof index;
  types: typeof types;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
