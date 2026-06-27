# 🎵 Rocky Music API

**TikTok Music Search API** — by **Rocky**

> GitHub: https://github.com/Rocky-mastermind/rocky-music-api

---

## 🚀 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import from GitHub: `Rocky-mastermind/rocky-music-api`
3. Deploy — done! Your API is live.

---

## 📡 API Usage

### Endpoint
```
GET /api/rocky?keyword=YOUR_SEARCH
```
Shortcut:
```
GET /rocky?keyword=YOUR_SEARCH
```

### Example
```
https://rocky-music-api.vercel.app/rocky?keyword=lofi music
```

### Response
```json
[
  {
    "musicUrl": "https://...",
    "hdMusicUrl": "https://...",
    "title": "lofi chill beats",
    "cover": "https://...",
    "author": "username",
    "duration": 60,
    "plays": 120000,
    "likes": 5000,
    "musicTitle": "Song Name",
    "musicAuthor": "Artist Name",
    "musicCover": "https://...",
    "apiAuthor": "Rocky",
    "apiRepo": "https://github.com/Rocky-mastermind/rocky-music-api"
  }
]
```

---

## 📁 Project Files

| File | Description |
|------|-------------|
| `api/rocky.js` | Main API handler |
| `public/index.html` | Web UI |
| `baseApiUrl.json` | Base URL config (used by bot) |
| `video.js` | Facebook bot command |
| `vercel.json` | Vercel routing config |

---

## 👤 Author

**Rocky** — All rights reserved © 2025  
GitHub: [Rocky-mastermind](https://github.com/Rocky-mastermind)
