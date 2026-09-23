import { Router } from 'express';

const router = Router();

// Cache in-memory for fast repeated lookups
const lookupCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Helper to extract place ID from URL or raw number
function parsePlaceId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // If it's pure numbers
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  
  // If it's a roblox URL like https://www.roblox.com/games/2753915549/Blox-Fruits
  const match = trimmed.match(/\/games\/(\d+)/i) || trimmed.match(/placeId=(\d+)/i) || trimmed.match(/(\d{5,})/);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

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
    let gameName = `Roblox Game #${placeId}`;
    let gameDescription = '';
    let creatorName = 'Roblox Creator';

    try {
      const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (uniRes.ok) {
        const uniJson = await uniRes.json();
        universeId = uniJson?.universeId || null;
      }
    } catch (e) {
      // Continue to thumbnail lookup
    }

    // 2. Fetch Game Info if universeId found
    if (universeId) {
      try {
        const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
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

    // 3. Fetch Official Thumbnail
    let thumbnailUrl = `https://tr.rbxcdn.com/placeholder`;
    try {
      const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (thumbRes.ok) {
        const thumbJson = await thumbRes.json();
        const iconData = thumbJson?.data?.[0];
        if (iconData?.imageUrl) {
          thumbnailUrl = iconData.imageUrl;
        }
      }
    } catch (e) {
      // Fallback
    }

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
