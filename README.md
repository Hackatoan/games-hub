[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/hackatoa)

# games-hub

Static landing page for [games.hackatoa.com](https://games.hackatoa.com) — a hub linking all Hackatoa browser games.

**Live:** [games.hackatoa.com](https://games.hackatoa.com)

## Games

| Game | URL | Type |
|---|---|---|
| Infinisweeper | [infinisweeper.hackatoa.com](https://infinisweeper.hackatoa.com) | Solo / infinite minesweeper |
| 1v1 Minesweeper | [1v1sw.hackatoa.com](https://1v1sw.hackatoa.com) | Competitive 1v1 multiplayer |
| Tic-Tac-Toe Online | [ttc.hackatoa.com](https://ttc.hackatoa.com) | Real-time 2-player |

## Deploy

```bash
docker build -t games-hub .
docker run -p 80:80 games-hub
```

Or via compose:

```bash
docker compose up -d games-hub
```

---

[hackatoa.com](https://hackatoa.com) · [GitHub](https://github.com/Hackatoan) · [Buy Me A Coffee](https://buymeacoffee.com/hackatoa)
