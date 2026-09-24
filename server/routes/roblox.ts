import { Router } from 'express';

const router = Router();

// In-memory caches for fast, zero-latency image responses
interface CachedBuffer {
  buffer: Buffer;
  contentType: string;
  timestamp: number;
}

const bufferCache = new Map<string, CachedBuffer>();
const lookupCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Helper to extract place ID from URL or raw number
function parsePlaceId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  
  const match = trimmed.match(/\/games\/(\d+)/i) || trimmed.match(/placeId=(\d+)/i) || trimmed.match(/(\d{5,})/);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

// Map of popular place IDs to game names for beautiful fallback SVGs
const KNOWN_GAME_NAMES: Record<string, string> = {
  '2753915549': 'Blox Fruits',
  '16732694052': 'Fisch',
  '4924922222': 'Brookhaven RP',
  '13772394625': 'Blade Ball',
  '17625359962': 'RIVALS',
  '8737899170': 'Pet Simulator 99',
  '2788229376': 'Da Hood',
  '10449761463': 'The Strongest Battlegrounds',
  '9391468976': 'The Jujutsu Shenanigans',
  '16146832113': 'Anime Vanguards',
  '17017769292': 'Anime Defenders',
  '13775256536': 'Toilet Tower Defense',
  '142823291': 'Murder Mystery 2',
  '286090443': 'Arsenal',
  '6872265039': 'BedWars',
  '6516141723': 'DOORS',
  '14257134447': 'Dress To Impress',
  '4520749081': 'King Legacy',
  '6403373529': 'Slap Battles',
  '15552355651': "Sol's RNG",
  '14069678431': 'TYPE://SOUL',
  '920587237': 'Adopt Me!',
  '1962086968': 'Tower of Hell',
  '4111023553': 'Deepwoken',
  '9872472334': 'Evade',
  '1537690962': 'Bee Swarm Simulator',
  '4282985734': 'Combat Warriors',
  '301549796': 'Counter Blox',
  '606849621': 'Jailbreak',
  '1730877806': 'Grand Piece Online',
  '4616652839': 'Shindo Life',
  '3956818381': 'Ninja Legends',
  '155615604': 'Prison Life',
  '189707': 'Natural Disaster Survival',
  '4589254888': 'Survive the Killer',
  '893973440': 'Flee the Facility',
  '2414851778': 'Dungeon Quest',
  '185655149': 'Welcome to Bloxburg',
};

// Generate high-resolution, gaming-styled vector banner as ultimate fallback
function generateGameSvg(title: string, placeId?: string): Buffer {
  const cleanTitle = (title || 'Roblox Game').replace(/[<>&"]/g, '').slice(0, 26);
  const sub = placeId && placeId !== '0' ? `ID: ${placeId}` : 'Roblox Script';
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#091428"/>
        <stop offset="50%" stop-color="#101f42"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <linearGradient id="btn" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="28" fill="url(#bg)"/>
    <circle cx="256" cy="200" r="130" fill="url(#glow)"/>
    
    <!-- Game Controller Art -->
    <g transform="translate(156, 120)">
      <rect x="0" y="20" width="200" height="120" rx="30" fill="url(#btn)"/>
      <circle cx="60" cy="80" r="18" fill="#1e293b"/>
      <path d="M60 68v24M48 80h24" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
      <circle cx="140" cy="65" r="8" fill="#38bdf8"/>
      <circle cx="155" cy="80" r="8" fill="#a855f7"/>
      <circle cx="125" cy="80" r="8" fill="#22c55e"/>
      <circle cx="140" cy="95" r="8" fill="#ef4444"/>
    </g>

    <!-- Game Title -->
    <text x="256" y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${cleanTitle}</text>
    
    <!-- Subtitle / ID -->
    <rect x="186" y="395" width="140" height="32" rx="16" fill="#000000" fill-opacity="0.6"/>
    <text x="256" y="416" font-family="monospace" font-size="14" font-weight="700" fill="#93c5fd" text-anchor="middle">${sub}</text>
  </svg>`;

  return Buffer.from(svg, 'utf-8');
}

// Fetch live image buffer from Roblox CDN using placeId or universeId
async function fetchRobloxImageBuffer(placeId: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    // 1. Try Place Icons API
    const thumbUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`;
    const res = await fetch(thumbUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const json = await res.json();
      const imageUrl = json?.data?.[0]?.imageUrl;
      if (imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('placeholder')) {
        const imgRes = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
        });
        if (imgRes.ok) {
          const arrBuf = await imgRes.arrayBuffer();
          const contentType = imgRes.headers.get('content-type') || 'image/png';
          return { buffer: Buffer.from(arrBuf), contentType };
        }
      }
    }

    // 2. Try Universe ID lookup fallback
    const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });

    if (uniRes.ok) {
      const uniJson = await uniRes.json();
      const universeId = uniJson?.universeId;
      if (universeId) {
        // Fetch universe icon or thumbnail
        const uThumbUrl = `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`;
        const uRes = await fetch(uThumbUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });
        if (uRes.ok) {
          const uJson = await uRes.json();
          const uImageUrl = uJson?.data?.[0]?.imageUrl;
          if (uImageUrl && uImageUrl.startsWith('http')) {
            const imgRes = await fetch(uImageUrl);
            if (imgRes.ok) {
              const arrBuf = await imgRes.arrayBuffer();
              const contentType = imgRes.headers.get('content-type') || 'image/png';
              return { buffer: Buffer.from(arrBuf), contentType };
            }
          }
        }
      }
    }
  } catch (err) {
    console.error(`[Roblox API] Error fetching thumbnail for placeId ${placeId}:`, err);
  }

  return null;
}

// Background prewarm to preload all popular game icons into memory
async function prewarmPopularIcons() {
  const placeIds = Object.keys(KNOWN_GAME_NAMES);
  try {
    // Batch query up to 50 place IDs at once for instant loading
    const batchUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeIds.slice(0, 50).join(',')}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`;
    const res = await fetch(batchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        await Promise.all(
          json.data.map(async (item: any) => {
            if (item?.targetId && item?.imageUrl && item.imageUrl.startsWith('http')) {
              const id = String(item.targetId);
              try {
                const imgRes = await fetch(item.imageUrl);
                if (imgRes.ok) {
                  const arr = await imgRes.arrayBuffer();
                  bufferCache.set(id, {
                    buffer: Buffer.from(arr),
                    contentType: imgRes.headers.get('content-type') || 'image/png',
                    timestamp: Date.now(),
                  });
                }
              } catch (e) {
                // ignore
              }
            }
          })
        );
      }
    }
    console.log(`[Roblox Proxy] Prewarmed ${bufferCache.size} game thumbnails.`);
  } catch (err) {
    console.warn('[Roblox Proxy] Prewarm skipped or network busy.');
  }
}

// Trigger initial prewarm asynchronously
setTimeout(() => {
  prewarmPopularIcons().catch(() => {});
}, 1000);

// GET /api/roblox/icon/:placeId -> Serves direct image binary with long-life cache headers
router.get('/icon/:placeId', async (req, res) => {
  const placeId = req.params.placeId;
  const gameName = KNOWN_GAME_NAMES[placeId] || `Jogo #${placeId}`;

  // If place is 0 or invalid, send SVG
  if (!placeId || placeId === '0') {
    const svgBuf = generateGameSvg('Universal Script', 'Universal');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    return res.send(svgBuf);
  }

  // 1. Check in-memory buffer cache
  const cached = bufferCache.get(placeId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    return res.send(cached.buffer);
  }

  // 2. Fetch fresh image from Roblox
  const result = await fetchRobloxImageBuffer(placeId);
  if (result) {
    bufferCache.set(placeId, {
      buffer: result.buffer,
      contentType: result.contentType,
      timestamp: Date.now(),
    });
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    return res.send(result.buffer);
  }

  // 3. Guaranteed beautiful SVG fallback if Roblox servers are offline
  const fallbackSvg = generateGameSvg(gameName, placeId);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(fallbackSvg);
});

// GET /api/roblox/lookup?placeId=... or query=...
router.get('/lookup', async (req, res) => {
  try {
    const rawInput = (req.query.placeId as string) || (req.query.q as string) || '';
    const placeId = parsePlaceId(rawInput);

    if (!placeId) {
      return res.status(400).json({ error: 'Place ID ou URL do Roblox inválido.' });
    }

    // Check cache
    const cached = lookupCache.get(placeId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }

    // 1. Fetch Universe ID
    let universeId: number | null = null;
    let gameName = KNOWN_GAME_NAMES[placeId] || `Roblox Game #${placeId}`;
    let gameDescription = '';
    let creatorName = 'Roblox Creator';

    try {
      const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      });
      if (uniRes.ok) {
        const uniJson = await uniRes.json();
        universeId = uniJson?.universeId || null;
      }
    } catch (e) {
      // Continue
    }

    // 2. Fetch Game Info if universeId found
    if (universeId) {
      try {
        const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        });
        if (gameRes.ok) {
          const gameJson = await gameRes.json();
          const gameData = gameJson?.data?.[0];
          if (gameData) {
            gameName = gameData.name || gameName;
            gameDescription = gameData.description || '';
            creatorName = gameData.creator?.name || creatorName;
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    const thumbnailUrl = `/api/roblox/icon/${placeId}`;

    const result = {
      placeId,
      universeId,
      name: gameName,
      description: gameDescription,
      creator: creatorName,
      thumbnailUrl,
      robloxUrl: `https://www.roblox.com/games/${placeId}`,
    };

    // Store in cache
    lookupCache.set(placeId, { data: result, timestamp: Date.now() });

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erro ao buscar dados do jogo no Roblox.' });
  }
});

export default router;
