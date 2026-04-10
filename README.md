# BDSP Pokemon Helper

A lightweight browser helper for Pokemon Brilliant Diamond / Shining Pearl.

## Features

- Search your Pokemon by English, Simplified Chinese, Traditional Chinese, or National Dex number.
- Get in-form Pokemon suggestions while typing if you only remember part of a name.
- Get a recommended nature, move suggestions, and evolution conditions.
- See each Pokemon's total base stats in the detail view.
- View each Pokemon's six base stats as a chart in the detail view.
- See where a Pokemon can be obtained in Brilliant Diamond, translated into Traditional Chinese, tagged by obtain type, with version-difference hints and fallback to the previous evolution when needed.
- See the Pokemon's official artwork directly in the result card.
- Build out a complete 6-Pokemon team that helps cover your core Pokemon's main weaknesses.
- Switch team-building between legendary, non-legendary, story-focused, and competitive-focused modes.
- Team suggestions now prefer final evolved forms whenever possible.
- Team suggestions now default to final evolved forms, with only a tiny exception list for special cases such as Chansey and Scyther.
- Clicking a recommended teammate now jumps that Pokemon into the main search flow so you can inspect its full details immediately.
- Search an opponent Pokemon and see the full 18-type effectiveness chart against it.
- Uses BDSP OU sample sets when available, then falls back to a BDSP learnset/stat heuristic.

## Run

```bash
cd pokemon-bdsp-helper
python3 -m http.server 4173
```

Then open `http://localhost:4173` in your browser.

## Notes

- The app fetches live data from PokeAPI and Smogon sample sets, so an internet connection is required.
- Recommendations are sample-set based when possible; otherwise they are heuristic and meant as a practical starting point for in-game play.
