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

// Cross-game aggregate: total wins/losses/draws per player, plus how many
// distinct games they've appeared in.
async function getAggregate(limit = 25) {
    if (!pool) return [];
    try {
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
    } catch (err) {
        console.error('[db] getAggregate failed:', err.message);
        return [];
    }
}

// Per-game board.
async function getByGame(game, limit = 25) {
    if (!pool) return [];
    try {
        const { rows } = await pool.query(
            `SELECT player, wins, losses, draws, games_played
               FROM leaderboards
              WHERE game = $1
              ORDER BY wins DESC, games_played ASC, updated_at ASC
              LIMIT $2`,
            [game, limit]
        );
        return rows;
    } catch (err) {
        console.error('[db] getByGame failed:', err.message);
        return [];
    }
}

// Distinct game ids present, for the filter dropdown.
async function getGames() {
    if (!pool) return [];
    try {
        const { rows } = await pool.query('SELECT DISTINCT game FROM leaderboards ORDER BY game');
        return rows.map((r) => r.game);
    } catch (err) {
        console.error('[db] getGames failed:', err.message);
        return [];
    }
}

module.exports = { getAggregate, getByGame, getGames };
