const axios = require('axios');

/**
 * @author Rocky
 * @description Video proxy — bypasses CORS so browser can blob-download to gallery
 */

module.exports = async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'url param required', author: 'Rocky' });
  }

  let decoded;
  try { decoded = decodeURIComponent(url); } catch { decoded = url; }

  // Only allow video/media URLs — basic security
  const allowed = /^https?:\/\/(.*\.(mp4|webm|m4v|mov)|.*tikwm\.com|.*tiktok\.com|.*ytimg\.com|.*googlevideo\.com|.*cobalt\.tools|.*nadeko\.net|.*nerdvpn\.de|.*artemislena\.eu)/i;
  if (!allowed.test(decoded)) {
    return res.status(403).json({ error: 'URL not allowed', author: 'Rocky' });
  }

  try {
    const upstream = await axios({
      method: 'GET',
      url: decoded,
      responseType: 'stream',
      timeout: 120000,
      maxContentLength: 200 * 1024 * 1024,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://www.tiktok.com/',
        'Range': req.headers['range'] || ''
      }
    });

    // Forward content headers so browser knows it's a video file
    const ct = upstream.headers['content-type'] || 'video/mp4';
    const cl = upstream.headers['content-length'];
    const cr = upstream.headers['content-range'];

    res.setHeader('Content-Type', ct);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    res.setHeader('Cache-Control', 'no-cache');
    if (cl) res.setHeader('Content-Length', cl);
    if (cr) res.setHeader('Content-Range', cr);
    res.setHeader('X-Author', 'Rocky');

    const status = upstream.status === 206 ? 206 : 200;
    res.status(status);
    upstream.data.pipe(res);

  } catch (e) {
    console.error('[Rocky Proxy]', e.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy error', author: 'Rocky' });
    }
  }
};
