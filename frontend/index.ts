// Cloudflare Workers can't do `_redirects` or nginx-style rewrites for static
// assets, so this worker provides a tiny SPA fallback.
//
// Behaviour:
// - /              -> /index.html
// - /blogslop      -> /index.html
// - /blogslop/     -> 308 /blogslop -> /index.html
// - /index.html    -> /index.html
// - /blogs/foo.md  -> /blogs/foo.md
// - /assets/a.png  -> /assets/a.png
//
// Any request whose final path segment contains a '.' is treated as a file and
// passed through unchanged. Everything else serves `/index.html`.

export default {
    fetch(request: Request, env: { ASSETS: Fetcher }) {
        const url = new URL(request.url);

        // Canonicalize trailing slashes so relative asset URLs behave correctly.
        if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
            url.pathname = url.pathname.slice(0, -1);
            return Response.redirect(url, 308);
        }

        // No extension? Treat it as a client-side route.
        if (!url.pathname.split("/").pop()?.includes("."))
            url.pathname = "/index.html";

        return env.ASSETS.fetch(new Request(url, request));
    },
};