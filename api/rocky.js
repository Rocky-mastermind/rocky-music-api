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

  try {
    // Try tikwm first
    let result = await searchTikwm(keyword);

    // If tikwm fails or returns nothing, try YouTube
    if (!result || result.length === 0) {
      result = await searchYoutube(keyword);
    }

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'No music found', author: 'Rocky' });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('[Rocky API Error]', error.message);
    return res.status(500).json({ error: 'Internal server error', author: 'Rocky' });
  }
};

// ── TikTok search via tikwm ──────────────────────────────
async function searchTikwm(keyword) {
  try {
    const response = await axios.get('https://www.tikwm.com/api/feed/search', {
      params: { keywords: keyword + ' music', count: 20, cursor: 0, HD: 1 },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 8000
    });

    const videos = response.data?.data?.videos;
    if (!videos || videos.length === 0) return null;

    return videos.map(v => ({
      source: 'tiktok',
      musicUrl: v.play,
      hdMusicUrl: v.hdplay,
      title: v.title,
      cover: v.cover,
      author: v.author?.nickname,
      duration: v.duration,
      plays: v.play_count,
      likes: v.digg_count,
      musicTitle: v.music_info?.title || null,
      musicAuthor: v.music_info?.author || null,
      apiAuthor: 'Rocky'
    }));
  } catch (e) {
    return null;
  }
}

// ── YouTube fallback via yt-search style API ─────────────
async function searchYoutube(keyword) {
  try {
    // Use a public YouTube search scraper
    const searchRes = await axios.get(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword + ' music')}&sp=EgIQAQ%3D%3D`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 8000
      }
    );

    // Extract video IDs from YouTube page
    const html = searchRes.data;
    const matches = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
    if (!matches || matches.length === 0) return null;

    // Get unique IDs
    const ids = [...new Set(matches.map(m => m.replace(/"videoId":"/, '').replace('"', '')))].slice(0, 5);

    // Extract titles too
    const titleMatches = html.match(/"title":{"runs":\[{"text":"([^"]+)"/g);
    const titles = titleMatches
      ? titleMatches.map(m => {
          const t = m.match(/"text":"([^"]+)"/);
          return t ? t[1] : 'Unknown';
        })
      : [];

    // Build youtube download links via yt-dlp style public API
    const results = ids.map((id, i) => ({
      source: 'youtube',
      musicUrl: `https://www.youtube.com/watch?v=${id}`,
      hdMusicUrl: `https://www.youtube.com/watch?v=${id}`,
      youtubeId: id,
      title: titles[i] || keyword,
      cover: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      author: 'YouTube',
      duration: null,
      plays: null,
      likes: null,
      apiAuthor: 'Rocky'
    }));

    return results;
  } catch (e) {
    return null;
  }
}
