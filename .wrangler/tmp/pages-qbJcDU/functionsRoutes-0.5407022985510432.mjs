import { onRequestGet as __api_demande_js_onRequestGet } from "/home/claude/sitefirstdiff/functions/api/demande.js"
import { onRequestPost as __api_demande_js_onRequestPost } from "/home/claude/sitefirstdiff/functions/api/demande.js"

export const routes = [
    {
      routePath: "/api/demande",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_demande_js_onRequestGet],
    },
  {
      routePath: "/api/demande",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_demande_js_onRequestPost],
    },
  ]