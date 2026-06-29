const axios = require('axios');

/**
 * @author Rocky
 * @repo https://github.com/Rocky-mastermind/rocky-music-api
 * @description Music Search API — do not remove author credit
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('X-Author', 'Rocky');

  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({
      error: 'keyword parameter required',
      example: '/api/rocky?keyword=lofi music',
      author: 'Rocky'
    });
  }

  // Try YouTube search (most reliable)
  const result = await searchYouTube(keyword);

  if (!result || result.length === 0) {
    return res.status(404).json({ error: 'No music found', keyword, author: 'Rocky' });
  }

  return res.status(200).json(result);
};

// ── YouTube Search + Invidious for stream URLs ──────────────
async function searchYouTube(keyword) {
  try {
    // Step 1: Search YouTube
    const searchRes = await axios.get(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword + ' music')}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 12000
      }
    );

    const html = searchRes.data;

    // Step 2: Extract video IDs + titles + thumbnails from ytInitialData
    const videoIds = [];
    let ytData = null;

    try {
      const match = html.match(/var ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s);
      if (match) ytData = JSON.parse(match[1]);
    } catch (_) {}

    if (ytData) {
      const contents = ytData?.contents?.twoColumnSearchResultsRenderer
        ?.primaryContents?.sectionListRenderer?.contents?.[0]
        ?.itemSectionRenderer?.contents || [];

      for (const item of contents) {
        const vr = item?.videoRenderer;
        if (!vr?.videoId) continue;

        const durText = vr.lengthText?.simpleText || '';
        const parts = durText.split(':').map(Number);
        const totalSec = parts.length === 3
          ? parts[0]*3600 + parts[1]*60 + parts[2]
          : parts.length === 2 ? parts[0]*60 + parts[1] : 0;

        // Only 2min+ videos (full songs)
        if (totalSec < 60 && durText) continue;

        videoIds.push({
          id: vr.videoId,
          title: vr.title?.runs?.[0]?.text || keyword,
          cover: `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
          duration: totalSec,
          author: vr.ownerText?.runs?.[0]?.text || 'Unknown',
          views: vr.viewCountText?.simpleText || null
        });

        if (videoIds.length >= 10) break;
      }
    }

    // Fallback regex if ytInitialData failed
    if (videoIds.length === 0) {
      const ids = [...new Set(
        [...html.matchAll(/"videoId":"([\w-]{11})"/g)].map(m => m[1])
      )].slice(0, 8);

      for (const id of ids) {
        videoIds.push({
          id,
          title: keyword,
          cover: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          duration: 0,
          author: 'YouTube',
          views: null
        });
      }
    }

    if (videoIds.length === 0) return null;

    // Step 3: Get stream URLs via Invidious for first 5 results
    const invidInstances = [
      'https://inv.nadeko.net',
      'https://invidious.nerdvpn.de',
      'https://yt.artemislena.eu',
      'https://invidious.privacydev.net'
    ];

    const results = [];

    for (const vid of videoIds.slice(0, 8)) {
      let streamUrl = null;
      let hdStreamUrl = null;

      // Try each invidious instance
      for (const inst of invidInstances) {
        try {
          const invRes = await axios.get(`${inst}/api/v1/videos/${vid.id}`, { timeout: 6000 });
          const formats = invRes.data?.formatStreams || [];

          const hd = formats.find(f => f.container === 'mp4' && f.qualityLabel?.includes('720'))
                  || formats.find(f => f.container === 'mp4' && f.qualityLabel?.includes('480'));
          const sd = formats.find(f => f.container === 'mp4')
                  || formats[0];

          if (sd?.url) {
            streamUrl = sd.url;
            hdStreamUrl = hd?.url || sd.url;
            if (invRes.data?.title) vid.title = invRes.data.title;
            break;
          }
        } catch (_) { continue; }
      }

      // Even if no stream URL, include with YouTube link as fallback
      results.push({
        source: 'youtube',
        youtubeUrl: `https://www.youtube.com/watch?v=${vid.id}`,
        musicUrl: streamUrl || `https://www.youtube.com/watch?v=${vid.id}`,
        hdMusicUrl: hdStreamUrl || streamUrl || `https://www.youtube.com/watch?v=${vid.id}`,
        proxyUrl: streamUrl ? `/api/proxy?url=${encodeURIComponent(streamUrl)}` : null,
        hdProxyUrl: hdStreamUrl ? `/api/proxy?url=${encodeURIComponent(hdStreamUrl)}` : null,
        title: vid.title,
        cover: vid.cover,
        author: vid.author,
        duration: vid.duration,
        plays: vid.views,
        likes: null,
        musicTitle: vid.title,
        musicAuthor: vid.author,
        apiAuthor: 'Rocky',
        apiRepo: 'https://github.com/Rocky-mastermind/rocky-music-api'
      });
    }

    return results.length > 0 ? results : null;

  } catch (e) {
    console.error('[Rocky API] YouTube search error:', e.message);
    return null;
  }
}
