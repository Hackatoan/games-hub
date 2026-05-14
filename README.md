# games-hub

Static landing page for [games.hackatoa.com](https://games.hackatoa.com) — a hub linking all Hackatoa browser games.

## Games

| Game | URL | Type |
|---|---|---|
| Infinisweeper | https://infinisweeper.hackatoa.com | Solo / infinite minesweeper |
| 1v1 Minesweeper | https://1v1sw.hackatoa.com | Competitive 1v1 multiplayer |
| Tic-Tac-Toe Online | https://ttc.hackatoa.com | Real-time 2-player |

## Deploy

Served with nginx via Docker:

```bash
docker build -t games-hub .
docker run -p 80:80 games-hub
```

Or as part of the games stack:

```bash
docker compose up -d games-hub
```
