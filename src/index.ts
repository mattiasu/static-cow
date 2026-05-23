//import { handleApi } from "../functions/api";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      //return handleApi(request, env);
	return new Repsonse("API coming soon", { status: 404});
    }

    return env.ASSETS.fetch(request);
  },
};
