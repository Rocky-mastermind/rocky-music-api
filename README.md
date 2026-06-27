# 🎵 Rocky Music API

**TikTok Music Search API** — by **Rocky**

## 🚀 Deploy on Vercel

1. Fork/upload this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Deploy — done!

## 📡 API Usage

### Endpoint
```
GET /api/rocky?keyword=YOUR_SEARCH
```
or shortcut:
```
GET /rocky?keyword=YOUR_SEARCH
```

### Example
```
https://your-project.vercel.app/rocky?keyword=lofi music
```

### Response
```json
[
  {
    "musicUrl": "https://...",
    "hdMusicUrl": "https://...",
    "title": "lofi music chill beats",
    "cover": "https://...",
    "author": "username",
    "duration": 60,
    "plays": 120000,
    "likes": 5000,
    "musicTitle": "Song Name",
    "musicAuthor": "Artist Name",
    "musicCover": "https://..."
  }
]
```

## 👤 Author
Made with ❤️ by **Rocky**
