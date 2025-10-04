export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const r = await fetch(url);
    const contentType = r.headers.get("content-type") || "";

    if (contentType.includes("text/html")) {
      let text = await r.text();
      // rewrite internal links to go through the proxy
      text = text.replace(/(href|src)=["'](https?:\/\/[^"']+)["']/g,
        (m, attr, u) => `${attr}="/api/proxy?url=${encodeURIComponent(u)}"`);
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(text);
    } else {
      const buffer = await r.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      res.status(200).send(Buffer.from(buffer));
    }
  } catch (e) {
    res.status(500).send("Error fetching URL: " + e.message);
  }
}
