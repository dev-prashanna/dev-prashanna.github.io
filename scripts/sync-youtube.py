#!/usr/bin/env python3
"""Fetch the YouTube uploads feed for the channel and write assets/youtube.json.

The site loads that file same-origin, so no CORS or API key is required.
Run locally with: python3 scripts/sync-youtube.py
"""

import json
import re
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

CHANNEL_ID = "UCVcQya6k-3ZSaH7wSZ9moCA"
HANDLE = "@PrashannaDeveloper"
CHANNEL_URL = f"https://www.youtube.com/{HANDLE}"
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
MAX_VIDEOS = 15
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "youtube.json"

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}

# Hand-written copy for known uploads; new videos fall back to derived text.
OVERRIDES = {
    "Dh8nN_bkk18": {
        "category": "robotics",
        "description": "Depth-only robot vision -- giving a machine eye-sight without a single brain cell.",
        "tags": ["Depth Vision", "Robotics", "Stereo"],
    },
    "OgKXtvlbQ6I": {
        "category": "ai",
        "description": "Cutting AI agent token usage without killing the reasoning quality.",
        "tags": ["AI Agents", "Tokens", "TechTok"],
    },
    "mlO8pzuV0Jc": {
        "category": "security",
        "description": "Why one unpatched network hole is enough to compromise your devices.",
        "tags": ["Network Security", "Vulnerabilities"],
    },
    "VjLoIRxK3KU": {
        "category": "robotics",
        "description": "NATERIDA -- a smart robot built to solve real-world problems on its own.",
        "tags": ["Robotics", "Autonomy", "IoT"],
    },
}

CATEGORY_RULES = [
    ("security", r"\b(security|vulnerabilit\w*|network|hack\w*|attack|exploit|prompt injection|guardrail|cyber\w*|malware)\b"),
    ("robotics", r"\b(robot\w*|naterida|drone|esp32|depth|vision|balanc\w*|imu|lidar)\b"),
    ("ai", r"\b(ai|ml|agent\w*|model\w*|llm|token\w*|neural|deep learning|rag|prompt)\b"),
]


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """Stop after the first hop so 301/303 responses stay visible."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


NO_REDIRECT = urllib.request.build_opener(_NoRedirect)


def get(url, method="GET", timeout=25):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, resp.read()


def fetch_feed():
    last_error = None
    for attempt in range(3):
        try:
            status, body = get(FEED_URL)
            if status == 200:
                return body
            last_error = f"HTTP {status}"
        except (urllib.error.URLError, TimeoutError) as exc:
            last_error = str(exc)
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"could not fetch feed: {last_error}")


def parse_feed(body):
    root = ET.fromstring(body)
    videos = []
    for entry in root.findall("atom:entry", NS):
        video_id = entry.findtext("yt:videoId", default="", namespaces=NS)
        if not video_id:
            continue
        thumb = entry.find("media:group/media:thumbnail", NS)
        videos.append({
            "id": video_id,
            "title": (entry.findtext("atom:title", default="", namespaces=NS) or "").strip(),
            "published": entry.findtext("atom:published", default="", namespaces=NS),
            "channelTitle": (entry.findtext("atom:author/atom:name", default="", namespaces=NS) or "").strip(),
            "thumbnail": thumb.get("url") if thumb is not None else f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        })
    videos.sort(key=lambda v: v.get("published") or "", reverse=True)
    return videos[:MAX_VIDEOS]


def fetch_duration(video_id):
    try:
        status, body = get(f"https://www.youtube.com/watch?v={video_id}")
        if status != 200:
            return None
        match = re.search(rb'"lengthSeconds":"(\d+)"', body)
        return int(match.group(1)) if match else None
    except Exception:
        return None


def is_short(video_id):
    """YouTube answers 200 for /shorts/<id> only when the video is a Short."""
    req = urllib.request.Request(
        f"https://www.youtube.com/shorts/{video_id}",
        method="HEAD",
        headers={"User-Agent": UA},
    )
    try:
        with NO_REDIRECT.open(req, timeout=20) as resp:
            return resp.status == 200
    except urllib.error.HTTPError as exc:
        # 301/303 to /watch?v= means it is a regular upload
        return exc.code == 200
    except Exception:
        return False


def classify(title, tags_hint):
    lowered = title.lower()
    for category, pattern in CATEGORY_RULES:
        if re.search(pattern, lowered, re.I):
            return category
    return "ai"


def build_video(raw):
    video_id = raw["id"]
    override = OVERRIDES.get(video_id, {})
    hashtags = re.findall(r"#(\w+)", raw["title"])
    title = re.sub(r"\s*#\w+", "", raw["title"]).strip().lstrip(": ").strip() or raw["title"]

    duration = fetch_duration(video_id)
    short = is_short(video_id)

    published = raw.get("published") or ""
    published_label = ""
    if published:
        try:
            published_label = datetime.fromisoformat(published).astimezone(timezone.utc).strftime("%Y-%m-%d")
        except ValueError:
            published_label = published[:10]

    return {
        "id": video_id,
        "title": title,
        "description": override.get("description") or f"// uploaded {published_label or 'recently'}",
        "published": published,
        "publishedLabel": published_label,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "shortUrl": f"https://www.youtube.com/shorts/{video_id}",
        "thumbnail": raw["thumbnail"],
        "duration": duration,
        "durationLabel": f"{duration // 60}:{duration % 60:02d}" if duration else "",
        "isShort": short,
        "category": override.get("category") or classify(title, hashtags),
        "tags": override.get("tags") or [tag.title() for tag in hashtags[:3]] or [],
    }


def main():
    args = sys.argv[1:]
    offline = None
    if args[:1] == ["--input"] and len(args) > 1:
        offline = Path(args[1])

    body = offline.read_bytes() if offline else fetch_feed()
    videos = [build_video(raw) for raw in parse_feed(body)]
    payload = {
        "channel": {
            "id": CHANNEL_ID,
            "handle": HANDLE,
            "url": CHANNEL_URL,
        },
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "count": len(videos),
        "videos": videos,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} with {len(videos)} videos")
    for video in videos:
        kind = "short" if video["isShort"] else "video"
        print(f"  [{video['category']}/{kind}] {video['title']} ({video['durationLabel'] or '?'})")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # keep CI from failing the deploy
        print(f"sync failed: {exc}", file=sys.stderr)
        if not OUT.exists():
            sys.exit(1)
