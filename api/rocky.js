const axios = require('axios');

/**
 * @author Rocky
 * @repo https://github.com/Rocky-mastermind/rocky-music-api
 * @description TikTok Music Search API — do not remove author credit
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('X-Author', 'Rocky');
  res.setHeader('X-Repo', 'https://github.com/Rocky-mastermind/rocky-music-api');

  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({
      error: 'keyword parameter required',
      example: '/api/rocky?keyword=lofi music',
      author: 'Rocky',
      repo: 'https://github.com/Rocky-mastermind/rocky-music-api'
    });
  }

  try {
    const response = await axios.get('https://www.tikwm.com/api/feed/search', {
      params: {
        keywords: keyword + ' music',
        count: 20,
        cursor: 0,
        HD: 1
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const videos = response.data?.data?.videos;

    if (!videos || videos.length === 0) {
      return res.status(404).json({ error: 'No music found', author: 'Rocky' });
    }

    const result = videos.map(video => ({
      musicUrl: video.play,
      hdMusicUrl: video.hdplay,
      title: video.title,
      cover: video.cover,
      author: video.author?.nickname,
      duration: video.duration,
      plays: video.play_count,
      likes: video.digg_count,
      musicTitle: video.music_info?.title || null,
      musicAuthor: video.music_info?.author || null,
      musicCover: video.music_info?.cover || null,
      apiAuthor: 'Rocky',
      apiRepo: 'https://github.com/Rocky-mastermind/rocky-music-api'
    }));

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      author: 'Rocky'
    });
  }
};
