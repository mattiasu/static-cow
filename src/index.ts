import { handleApi } from "../functions/api";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    // Fallback to static assets
    return env.ASSETS.fetch(request);
  },
};