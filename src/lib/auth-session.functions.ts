import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const getSessionDevRole = createServerFn({ method: "GET" }).handler(async (): Promise<string | null> => {
  try {
    const req = getRequest();
    const cookie = req?.headers?.get("cookie") || "";
    const match = cookie.match(/pfa_dev_role=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
});
