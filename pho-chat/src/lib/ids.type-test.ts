import type { Id } from "../../convex/_generated/dataModel";
import { toChatSessionId } from "./ids";

// Compile-time assertions for toChatSessionId helper
const raw: string = "session_123";
const csId: Id<"chat_sessions"> = toChatSessionId(raw);

// Ensure return type is assignable to Id<"chat_sessions">
type AssertTrue<T extends true> = T;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _Assignable = AssertTrue<Id<"chat_sessions"> extends typeof csId ? true : false>;

// Ensure not assignable to other Id types
// @ts-expect-error: chat_session Id must not be assignable to users Id
const _shouldErrorUsersId: Id<"users"> = toChatSessionId(raw);

void csId;

