// Leaderboard queries for the games hub. Reads the shared games-db
// `leaderboards` table. Fails soft: if the DB is unset/unreachable, the
// endpoints return empty arrays and the static hub still works.

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
let pool = null;
if (connectionString) {
    pool = new Pool({ connectionString, max: 4 });
    pool.on('error', (err) => console.error('[db] pool error:', err.message));
} else {
    console.warn('[db] DATABASE_URL not set — leaderboards disabled');
}

// Every hub page (7 locales) independently calls /api/games and
// /api/leaderboard on load, so a handful of visitors can fan out into a
// lot of identical queries in a short window. Cache each query's result
// in memory for a short TTL to cut that down without serving noticeably
// stale data.
const CACHE_TTL_MS = {
    games: 5 * 60 * 1000,   // game list changes rarely
    board: 15 * 1000,       // leaderboard rows can change often
};
const cache = new Map(); // key -> { value, expires }

async function cached(key, ttlMs, fn) {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value;
    const value = await fn();
    cache.set(key, { value, expires: Date.now() + ttlMs });
    return value;
}

// Cross-game aggregate: total wins/losses/draws per player, plus how many
// distinct games they've appeared in.
async function getAggregate(limit = 25) {
    if (!pool) return [];
    try {
        return await cached(`aggregate:${limit}`, CACHE_TTL_MS.board, async () => {
            const { rows } = await pool.query(
                `SELECT player,
                        SUM(wins)::int         AS wins,
                        SUM(losses)::int       AS losses,
                        SUM(draws)::int        AS draws,
                        SUM(games_played)::int AS games_played,
                        COUNT(DISTINCT game)::int AS games
                   FROM leaderboards
                  GROUP BY player
                  ORDER BY SUM(wins) DESC, SUM(games_played) ASC, player ASC
                  LIMIT $1`,
                [limit]
            );
            return rows;
        });
    } catch (err) {
        console.error('[db] getAggregate failed:', err.message);
        return [];
    }
}

// Per-game board.
async function getByGame(game, limit = 25) {
    if (!pool) return [];
    try {
        return await cached(`byGame:${game}:${limit}`, CACHE_TTL_MS.board, async () => {
            const { rows } = await pool.query(
                `SELECT player, wins, losses, draws, games_played
                   FROM leaderboards
                  WHERE game = $1
                  ORDER BY wins DESC, games_played ASC, updated_at ASC
                  LIMIT $2`,
                [game, limit]
            );
            return rows;
        });
    } catch (err) {
        console.error('[db] getByGame failed:', err.message);
        return [];
    }
}

// Distinct game ids present, for the filter dropdown.
async function getGames() {
    if (!pool) return [];
    try {
        return await cached('games', CACHE_TTL_MS.games, async () => {
            const { rows } = await pool.query('SELECT DISTINCT game FROM leaderboards ORDER BY game');
            return rows.map((r) => r.game);
        });
    } catch (err) {
        console.error('[db] getGames failed:', err.message);
        return [];
    }
}

module.exports = { getAggregate, getByGame, getGames };
