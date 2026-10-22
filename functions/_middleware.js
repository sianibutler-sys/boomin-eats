// Share previews need absolute URLs. Until boomineats.com is live, the site runs on a
// pages.dev address, so rewrite the preview tags to whatever host is serving the page.
// At launch this keeps working unchanged on boomineats.com.
export async function onRequest({ request, next }) {
  const res = await next();
  const type = res.headers.get("content-type") || "";
  if (!type.includes("text/html")) return res;
  const origin = new URL(request.url).origin;
  const fix = (attr) => ({
    element(el) {
      const v = el.getAttribute(attr);
      if (v && v.startsWith("https://boomineats.com")) el.setAttribute(attr, v.replace("https://boomineats.com", origin));
    }
  });
  return new HTMLRewriter()
    .on('meta[property^="og:"]', fix("content"))
    .on('meta[name^="twitter:"]', fix("content"))
    .on('link[rel="canonical"]', fix("href"))
    .transform(res);
}
