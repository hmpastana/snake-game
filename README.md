# GitHub Snake

GitHub Snake is a reusable, embeddable Snake game styled like GitHub's contribution graph. This project is now structured as a small TypeScript library so it can be packaged for npm and mounted inside other websites with minimal setup.

## Project Structure

```text
src/
  core/
    board.ts
    collision.ts
    config.ts
    food.ts
    game.ts
    snake.ts
  renderers/
    domRenderer.ts
  styles/
    base.css
  index.ts
demo/
  index.html
  main.ts
package.json
tsconfig.json
vite.config.ts
```

## Installation

For local development today:

```bash
npm install
```

Supported tooling runtime:

- Node `16.20+`
- Node `18+`
- Node `20+`

Later, once published:

```bash
npm install github-snake
```

## Usage

```ts
import { createGithubSnake } from "github-snake";
import "github-snake/style.css";

const game = createGithubSnake({
  target: "#snake-container",
  rows: 7,
  cols: 53,
  theme: "github-dark",
  speed: 120,
  showLegend: true,
  showMonthLabels: true,
  showWeekdayLabels: true,
  autoplay: false,
  onScoreChange: (score, bestScore) => {
    console.log({ score, bestScore });
  },
  onGameOver: (score) => {
    console.log("Game over:", score);
  },
});

game.start();
```

## Public API

### `createGithubSnake(options)`

Creates and mounts the game inside the provided target container.

### Returned instance methods

- `start()`
- `pause()`
- `restart()`
- `destroy()`
- `setTheme(theme, customColors?)`
- `setSpeed(speed)`

## Configuration

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `target` | `string \| HTMLElement` | required | Mount point for the game |
| `rows` | `number` | `7` | Playable board rows |
| `cols` | `number` | `53` | Playable board columns |
| `cellSize` | `number` | `14` | Size of each contribution cell |
| `gapSize` | `number` | `3` | Gap between cells |
| `theme` | `"github-dark" \| "github-light"` | `"github-dark"` | Base visual theme |
| `customColors` | `Partial<GithubSnakeColors>` | `undefined` | Override theme colors |
| `speed` | `number` | `170` | Base movement interval in ms |
| `showLegend` | `boolean` | `true` | Show Less -> More legend |
| `showMonthLabels` | `boolean` | `true` | Show month labels |
| `showWeekdayLabels` | `boolean` | `true` | Show weekday labels |
| `showControls` | `boolean` | `true` | Show built-in Start and Restart buttons |
| `autoplay` | `boolean` | `false` | Start immediately after mount |
| `months` | `string[]` | GitHub-like defaults | Replace month labels |
| `weekdays` | `string[]` | `["Mon", "Wed", "Fri"]` | Replace weekday labels |
| `storageKey` | `string` | `"github-snake-best-score"` | Local storage key |
| `difficulty` | `Partial<GithubSnakeDifficultyConfig>` | staged defaults | Configure thresholds, step speed, max speed, and streak bonuses |
| `onScoreChange` | callback | `undefined` | Score update hook |
| `onGameOver` | callback | `undefined` | Game over hook |

## Styling

The library uses namespaced class names such as:

- `gs-container`
- `gs-board`
- `gs-cell`
- `gs-snake`
- `gs-food`

You can:

- import the default CSS with `import "github-snake/style.css"`
- override the generated class styles in your host app
- switch between built-in themes
- pass `customColors` to override the default palette

## Local Development

Start the demo app:

```bash
npm run dev
```

Then open the Vite URL at `/`, for example:

```text
http://127.0.0.1:5173/
```

If you're on Node 16, this setup is intentionally pinned to a Vite version that still supports it.

## Build

Build the library output:

```bash
npm run build
```

This is configured to emit:

- ESM output
- CJS output
- Type declarations

## Packaging Notes

This repo is now set up so the reusable game lives under `src/`, while the local demo consumes the public API from that library surface instead of reaching into internal files directly.

Before publishing to npm, the remaining typical steps are:

1. Run `npm install`
2. Run `npm run build`
3. Review the generated `dist/` files
4. Add repository metadata if needed
5. Publish with `npm publish`
