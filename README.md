# Spelletje voor GitHub Pages

Dit project is een volledig statische browsergame. Je kunt het direct hosten via GitHub Pages zonder server, build-stap of backend.

## Bestanden

- `index.html` bevat de structuur van de pagina.
- `styles.css` bevat de styling.
- `game.js` bevat de game-logica.

## Lokaal openen

Open `index.html` direct in je browser, of start een simpele statische server, bijvoorbeeld:

```bash
python3 -m http.server 8000
```

Ga daarna naar `http://localhost:8000`.

## Publiceren op GitHub Pages

1. Push deze repository naar GitHub.
2. Ga in GitHub naar **Settings → Pages**.
3. Kies **Deploy from a branch**.
4. Selecteer de gewenste branch en `/ (root)` als folder.
5. Sla op; GitHub publiceert daarna de statische site.
