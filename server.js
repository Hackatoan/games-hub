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

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Games hub listening on port ${PORT}`));
