const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

// Cross-game aggregate leaderboard, or a single game with ?game=<id>.
app.get('/api/leaderboard', async (req, res) => {
    const game = req.query.game;
    if (game) {
        const players = await db.getByGame(String(game), 25);
        res.json({ scope: 'game', game, players });
    } else {
        const players = await db.getAggregate(25);
        res.json({ scope: 'aggregate', players });
    }
});

// List of games that have leaderboard data (for the filter).
app.get('/api/games', async (_req, res) => {
    res.json({ games: await db.getGames() });
});

// Static assets (SVG cards, favicon, og image, robots/sitemap) rarely change
// between deploys — let browsers cache them instead of re-fetching on every
// visit. HTML pages stay no-cache so a new deploy is picked up immediately;
// they still get cheap 304s via express's built-in ETag/Last-Modified.
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    },
}));

app.listen(PORT, () => console.log(`Games hub listening on port ${PORT}`));
