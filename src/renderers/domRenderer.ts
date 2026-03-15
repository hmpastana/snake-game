import type { GameSnapshot, GameStatus } from "../core/game";
import type { GithubSnakeColors, GithubSnakeThemeName, ResolvedGithubSnakeConfig } from "../core/config";

interface RendererControls {
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  onThemeChange: (theme: GithubSnakeThemeName) => void;
}

export class DomRenderer {
  private readonly config: ResolvedGithubSnakeConfig;
  private readonly root: HTMLDivElement;
  private readonly scoreValue: HTMLElement;
  private readonly bestScoreValue: HTMLElement;
  private readonly totalCommitsValue: HTMLElement;
  private readonly boardElement: HTMLDivElement;
  private readonly overlay: HTMLDivElement;
  private readonly overlayTitle: HTMLElement;
  private readonly overlayText: HTMLElement;
  private readonly statusBadge: HTMLElement;
  private readonly primaryButton: HTMLButtonElement;
  private readonly restartButton: HTMLButtonElement;
  private readonly lightThemeButton: HTMLButtonElement;
  private readonly darkThemeButton: HTMLButtonElement;
  private readonly cells = new Map<string, HTMLDivElement>();
  private currentTheme: GithubSnakeThemeName;

  constructor(config: ResolvedGithubSnakeConfig) {
    this.config = config;
    this.currentTheme = config.theme;
    this.root = document.createElement("div");
    this.root.className = `gs-container gs-theme-${config.theme}`;
    this.applyTheme(config.colors);
    this.root.innerHTML = this.template();
    config.target.innerHTML = "";
    config.target.appendChild(this.root);

    this.scoreValue = this.requireElement("[data-gs-score]");
    this.bestScoreValue = this.requireElement("[data-gs-best-score]");
    this.totalCommitsValue = this.requireElement("[data-gs-total-commits]");
    this.boardElement = this.requireElement("[data-gs-board]");
    this.overlay = this.requireElement("[data-gs-overlay]");
    this.overlayTitle = this.requireElement("[data-gs-overlay-title]");
    this.overlayText = this.requireElement("[data-gs-overlay-text]");
    this.statusBadge = this.requireElement("[data-gs-status]");
    this.primaryButton = this.requireElement("[data-gs-start]");
    this.restartButton = this.requireElement("[data-gs-restart]");
    this.lightThemeButton = this.requireElement("[data-gs-theme-light]");
    this.darkThemeButton = this.requireElement("[data-gs-theme-dark]");

    this.boardElement.style.setProperty("--gs-cols", String(config.cols));
    this.boardElement.style.setProperty("--gs-cell-size", `${config.cellSize}px`);
    this.boardElement.style.setProperty("--gs-gap-size", `${config.gapSize}px`);

    this.createCells();
    this.updateThemeButtons();
  }

  bindControls(controls: RendererControls): void {
    this.primaryButton.addEventListener("click", () => {
      if (this.primaryButton.dataset.state === "pause") {
        controls.onPause();
        return;
      }

      controls.onStart();
    });

    this.restartButton.addEventListener("click", controls.onRestart);
    this.lightThemeButton.addEventListener("click", () => controls.onThemeChange("github-light"));
    this.darkThemeButton.addEventListener("click", () => controls.onThemeChange("github-dark"));
  }

  render(snapshot: GameSnapshot): void {
    this.scoreValue.textContent = String(snapshot.score);
    this.bestScoreValue.textContent = String(snapshot.bestScore);
    this.totalCommitsValue.textContent = String(snapshot.totalCommits);
    this.statusBadge.textContent = snapshot.statusMessage ?? `Speed Level ${snapshot.difficultyLevel + 1}`;
    this.statusBadge.classList.toggle("gs-hidden", !snapshot.statusMessage && snapshot.status === "idle");

    const snakeMap = new Map(snapshot.snake.map((segment, index) => [`${segment.x},${segment.y}`, index]));
    const foodKey = snapshot.food ? `${snapshot.food.x},${snapshot.food.y}` : "";

    for (let y = 0; y < snapshot.rows; y += 1) {
      for (let x = 0; x < snapshot.cols; x += 1) {
        const key = `${x},${y}`;
        const cell = this.cells.get(key);
        if (!cell) {
          continue;
        }

        const classes = ["gs-cell", `gs-level-${snapshot.contributions[y][x]}`];
        if (snapshot.flashKeys.has(key)) {
          classes.push("gs-flash");
        }

        if (foodKey === key) {
          classes.push("gs-food");
        }

        if (snakeMap.has(key)) {
          classes.push("gs-snake");
          classes.push(snakeMap.get(key) === 0 ? "gs-snake-head" : "gs-snake-body");
        }

        cell.className = classes.join(" ");
      }
    }

    this.updateOverlay(snapshot);
    this.primaryButton.dataset.state = snapshot.status === "running" ? "pause" : "start";
    this.primaryButton.textContent = snapshot.status === "running" ? "Pause Game" : "Start Game";
  }

  setTheme(colors: GithubSnakeColors, themeName: GithubSnakeThemeName): void {
    this.root.className = `gs-container gs-theme-${themeName}`;
    this.currentTheme = themeName;
    this.applyTheme(colors);
    this.updateThemeButtons();
  }

  destroy(): void {
    this.root.remove();
  }

  setHostAppearance(appearance: { fontFamily?: string }): void {
    if (appearance.fontFamily) {
      this.root.style.setProperty("--gs-font-family", appearance.fontFamily);
    }
  }

  private createCells(): void {
    const fragment = document.createDocumentFragment();

    for (let y = 0; y < this.config.rows; y += 1) {
      for (let x = 0; x < this.config.cols; x += 1) {
        const cell = document.createElement("div");
        const key = `${x},${y}`;
        cell.className = "gs-cell gs-level-0";
        cell.dataset.position = key;
        this.cells.set(key, cell);
        fragment.appendChild(cell);
      }
    }

    this.boardElement.appendChild(fragment);
  }

  private updateOverlay(snapshot: GameSnapshot): void {
    const overlayState = getOverlayContent(snapshot.status, snapshot.totalCommits);
    this.overlayTitle.textContent = overlayState.title;
    this.overlayText.textContent = overlayState.text;
    this.overlay.classList.toggle("is-hidden", snapshot.status === "running");
  }

  private applyTheme(colors: GithubSnakeColors): void {
    this.root.style.setProperty("--gs-page-bg", colors.pageBackground);
    this.root.style.setProperty("--gs-chart-bg", colors.chartBackground);
    this.root.style.setProperty("--gs-border", colors.border);
    this.root.style.setProperty("--gs-text", colors.text);
    this.root.style.setProperty("--gs-muted", colors.mutedText);
    this.root.style.setProperty("--gs-button-bg", colors.buttonBackground);
    this.root.style.setProperty("--gs-button-hover", colors.buttonHover);
    this.root.style.setProperty("--gs-button-primary", colors.buttonPrimary);
    this.root.style.setProperty("--gs-button-primary-hover", colors.buttonPrimaryHover);
    this.root.style.setProperty("--gs-cell-0", colors.cellEmpty);
    this.root.style.setProperty("--gs-cell-1", colors.cellLow);
    this.root.style.setProperty("--gs-cell-2", colors.cellMedium);
    this.root.style.setProperty("--gs-cell-3", colors.cellHigh);
    this.root.style.setProperty("--gs-cell-4", colors.cellHighest);
    this.root.style.setProperty("--gs-snake", colors.snake);
    this.root.style.setProperty("--gs-snake-tail", colors.snakeTail);
    this.root.style.setProperty("--gs-food", colors.food);
    this.root.style.setProperty("--gs-food-core", colors.foodCore);
    this.root.style.setProperty("--gs-overlay", colors.overlayBackground);
  }

  private template(): string {
    const monthLabels = this.config.showMonthLabels
      ? this.config.months.map((month) => `<span class="gs-month">${month}</span>`).join("")
      : "";
    const weekdayLabels = this.config.showWeekdayLabels
      ? this.config.weekdays.map((day) => `<span class="gs-weekday">${day}</span>`).join("")
      : "";

    return `
      <section class="gs-shell">
        <header class="gs-header">
          <div>
            <p class="gs-kicker">GitHub Snake</p>
            <h2 class="gs-title">Don't Break the Branch</h2>
            <p class="gs-subtitle">Navigate the contribution graph and collect commits. But don't break the branch.</p>
          </div>
          <div class="gs-theme-toggle" aria-label="Theme toggle">
            <button class="gs-theme-button" type="button" data-gs-theme-light>Light</button>
            <button class="gs-theme-button" type="button" data-gs-theme-dark>Dark</button>
          </div>
          <div class="gs-stats">
            <article class="gs-stat-card">
              <span class="gs-stat-label">Score</span>
              <strong class="gs-stat-value" data-gs-score>0</strong>
            </article>
            <article class="gs-stat-card">
              <span class="gs-stat-label">Best Score</span>
              <strong class="gs-stat-value" data-gs-best-score>0</strong>
            </article>
            <article class="gs-stat-card">
              <span class="gs-stat-label">Total Commits</span>
              <strong class="gs-stat-value" data-gs-total-commits>0</strong>
            </article>
          </div>
        </header>

        <div class="gs-chart-card">
          <div class="gs-chart-heading">
            <div class="gs-chart-heading-top">
              <h3>Contribution Activity</h3>
              <span class="gs-status-badge gs-hidden" data-gs-status></span>
            </div>
            <p>The snake moves across a real GitHub-style activity grid.</p>
          </div>

          <div class="gs-chart-grid">
            <div class="gs-corner" aria-hidden="true"></div>
            <div class="gs-months" aria-hidden="${String(!this.config.showMonthLabels)}">${monthLabels}</div>
            <div class="gs-weekdays" aria-hidden="${String(!this.config.showWeekdayLabels)}">${weekdayLabels}</div>
            <div class="gs-board-shell">
              <div class="gs-board-frame">
                <div class="gs-board" data-gs-board></div>
                <div class="gs-overlay" data-gs-overlay>
                  <div class="gs-overlay-card">
                    <h4 data-gs-overlay-title>Press Start</h4>
                    <p data-gs-overlay-text>Use arrow keys or WASD to steer through the contribution chart.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="gs-footer">
            <p class="gs-footnote">Learn how we count contributions</p>
            <div class="gs-footer-actions">
              <div class="gs-controls ${this.config.showControls ? "" : "gs-hidden"}">
                <button class="gs-button gs-button-primary" type="button" data-gs-start>Start Game</button>
                <button class="gs-button" type="button" data-gs-restart>Restart Run</button>
              </div>
              <div class="gs-legend ${this.config.showLegend ? "" : "gs-hidden"}" aria-label="Contribution legend">
                <span>Less</span>
                <div class="gs-legend-scale">
                  <span class="gs-legend-swatch gs-level-0"></span>
                  <span class="gs-legend-swatch gs-level-1"></span>
                  <span class="gs-legend-swatch gs-level-2"></span>
                  <span class="gs-legend-swatch gs-level-3"></span>
                  <span class="gs-legend-swatch gs-level-4"></span>
                </div>
                <span>More</span>
              </div>
            </div>
          </footer>
        </div>
      </section>
    `;
  }

  private requireElement<T extends HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) {
      throw new Error(`GitHub Snake renderer could not find element: ${selector}`);
    }

    return element;
  }

  private updateThemeButtons(): void {
    const isLight = this.currentTheme === "github-light";
    this.lightThemeButton.setAttribute("aria-pressed", String(isLight));
    this.darkThemeButton.setAttribute("aria-pressed", String(!isLight));
    this.lightThemeButton.classList.toggle("is-active", isLight);
    this.darkThemeButton.classList.toggle("is-active", !isLight);
  }
}

function getOverlayContent(status: GameStatus, totalCommits: number): { title: string; text: string } {
  switch (status) {
    case "running":
      return {
        title: "",
        text: "",
      };
    case "paused":
      return {
        title: "Paused",
        text: "Press Start Game or use your keyboard controls to keep the streak going.",
      };
    case "over":
      return {
        title: "Game Over",
        text: "Your branch broke",
      };
    default:
      return {
        title: "Press Start",
        text: "Use arrow keys or WASD to steer through the contribution chart.",
      };
  }
}
