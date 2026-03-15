const S = {
  "github-dark": {
    pageBackground: "#0D1117",
    chartBackground: "#161B22",
    border: "#30363D",
    text: "#C9D1D9",
    mutedText: "#8B949E",
    buttonBackground: "#21262D",
    buttonHover: "#30363D",
    buttonPrimary: "#238636",
    buttonPrimaryHover: "#2EA043",
    cellEmpty: "#21262D",
    cellLow: "#0E4429",
    cellMedium: "#006D32",
    cellHigh: "#26A641",
    cellHighest: "#39D353",
    snake: "#39D353",
    snakeTail: "#26A641",
    food: "#8CFF85",
    foodCore: "#39D353",
    overlayBackground: "rgba(13, 17, 23, 0.86)"
  },
  "github-light": {
    pageBackground: "#FFFFFF",
    chartBackground: "#F6F8FA",
    border: "#D0D7DE",
    text: "#24292F",
    mutedText: "#57606A",
    buttonBackground: "#F6F8FA",
    buttonHover: "#EAECEF",
    buttonPrimary: "#1F883D",
    buttonPrimaryHover: "#1A7F37",
    cellEmpty: "#EBEDF0",
    cellLow: "#9BE9A8",
    cellMedium: "#40C463",
    cellHigh: "#30A14E",
    cellHighest: "#216E39",
    snake: "#30A14E",
    snakeTail: "#40C463",
    food: "#9BE9A8",
    foodCore: "#216E39",
    overlayBackground: "rgba(255, 255, 255, 0.92)"
  }
};
function T(e) {
  const t = C(e.target), s = e.theme ?? "github-dark", r = c(e.speed, 170, 40), a = {
    ...S[s],
    ...e.customColors
  };
  return {
    target: t,
    rows: c(e.rows, 7, 4),
    cols: c(e.cols, 53, 12),
    cellSize: c(e.cellSize, 14, 8),
    gapSize: c(e.gapSize, 3, 1),
    theme: s,
    colors: a,
    speed: r,
    showLegend: e.showLegend ?? !0,
    showMonthLabels: e.showMonthLabels ?? !0,
    showWeekdayLabels: e.showWeekdayLabels ?? !0,
    showControls: e.showControls ?? !0,
    autoplay: e.autoplay ?? !1,
    months: e.months ?? ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    weekdays: e.weekdays ?? ["Mon", "Wed", "Fri"],
    storageKey: e.storageKey ?? "github-snake-best-score",
    onScoreChange: e.onScoreChange,
    onGameOver: e.onGameOver,
    difficulty: E(r, e.difficulty)
  };
}
function C(e) {
  if (typeof e != "string")
    return e;
  const t = document.querySelector(e);
  if (!t)
    throw new Error(`GitHub Snake could not find target element: ${e}`);
  return t;
}
function w(e, t) {
  return {
    ...S[e],
    ...t
  };
}
function c(e, t, s) {
  return typeof e != "number" || Number.isNaN(e) ? t : Math.max(s, Math.floor(e));
}
function E(e, t) {
  return {
    thresholds: (t == null ? void 0 : t.thresholds) ?? [10, 20, 35, 50],
    speedStep: (t == null ? void 0 : t.speedStep) ?? 16,
    maxSpeed: (t == null ? void 0 : t.maxSpeed) ?? Math.max(80, e - 64),
    streakBonusEnabled: (t == null ? void 0 : t.streakBonusEnabled) ?? !0,
    streakBonusEvery: (t == null ? void 0 : t.streakBonusEvery) ?? 5,
    streakBonusAmount: (t == null ? void 0 : t.streakBonusAmount) ?? 1,
    statusMessageDuration: (t == null ? void 0 : t.statusMessageDuration) ?? 1200
  };
}
function B(e, t) {
  return Array.from({ length: e }, () => Array(t).fill(0));
}
function M(e) {
  return e.map((t) => [...t]);
}
function d(e) {
  return `${e.x},${e.y}`;
}
function L(e, t, s) {
  return e.x >= 0 && e.y >= 0 && e.x < s && e.y < t;
}
function D(e, t, s) {
  return !L(e, t, s);
}
function F(e, t, s) {
  const r = s ? t : t.slice(0, -1), a = d(e);
  return r.some((o) => d(o) === a);
}
function f(e, t, s) {
  const r = new Set(s.map(d)), a = [];
  for (let o = 0; o < e; o += 1)
    for (let n = 0; n < t; n += 1) {
      const h = { x: n, y: o };
      r.has(d(h)) || a.push(h);
    }
  return a.length === 0 ? null : a[Math.floor(Math.random() * a.length)];
}
function A(e, t) {
  const s = Math.floor(t / 2), r = Math.floor(e / 2);
  return [
    { x: s, y: r },
    { x: s - 1, y: r },
    { x: s - 2, y: r }
  ];
}
function g(e) {
  return e.map((t) => ({ ...t }));
}
function P(e, t) {
  return {
    x: e.x + t.x,
    y: e.y + t.y
  };
}
function v(e, t) {
  return e.x === -t.x && e.y === -t.y;
}
class H {
  constructor(t) {
    this.listeners = /* @__PURE__ */ new Set(), this.animationFrameId = 0, this.lastTimestamp = 0, this.accumulatedTime = 0, this.flashes = /* @__PURE__ */ new Map(), this.status = "idle", this.score = 0, this.bestScore = 0, this.totalCommits = 0, this.streak = 0, this.difficultyLevel = 0, this.snake = [], this.previousSnake = [], this.food = null, this.contributions = [], this.direction = { x: 1, y: 0 }, this.queuedDirection = { x: 1, y: 0 }, this.statusMessage = null, this.statusMessageTimeRemaining = 0, this.frame = (s) => {
      this.lastTimestamp || (this.lastTimestamp = s);
      const r = Math.min(32, s - this.lastTimestamp);
      if (this.lastTimestamp = s, this.status === "running") {
        for (this.accumulatedTime += r; this.accumulatedTime >= this.speed; )
          if (this.accumulatedTime -= this.speed, this.step(), this.status !== "running") {
            this.accumulatedTime = 0;
            break;
          }
      }
      this.updateEffects(r), this.emit(), this.animationFrameId = window.requestAnimationFrame(this.frame);
    }, this.rows = t.rows, this.cols = t.cols, this.difficulty = t.difficulty, this.baseSpeed = t.baseSpeed, this.speed = t.baseSpeed, this.bestScore = t.bestScore ?? 0, this.resetState(), this.emit(), this.animationFrameId = window.requestAnimationFrame(this.frame);
  }
  subscribe(t) {
    return this.listeners.add(t), t(this.snapshot()), () => {
      this.listeners.delete(t);
    };
  }
  start() {
    if (this.status === "over") {
      this.restart();
      return;
    }
    this.status = "running", this.emit();
  }
  pause() {
    this.status === "running" && (this.status = "paused", this.emit());
  }
  restart() {
    this.resetState(), this.status = "running", this.emit();
  }
  destroy() {
    window.cancelAnimationFrame(this.animationFrameId), this.listeners.clear();
  }
  setSpeed(t) {
    this.baseSpeed = Math.max(40, Math.floor(t)), this.speed = this.calculateSpeed(), this.emit();
  }
  setDirection(t) {
    this.snake.length > 1 && v(this.direction, t) || (this.queuedDirection = t);
  }
  setBestScore(t) {
    this.bestScore = t, this.emit();
  }
  getSnapshot() {
    return this.snapshot();
  }
  resetState() {
    this.snake = A(this.rows, this.cols), this.previousSnake = g(this.snake), this.direction = { x: 1, y: 0 }, this.queuedDirection = { x: 1, y: 0 }, this.food = f(this.rows, this.cols, this.snake), this.score = 0, this.totalCommits = 0, this.streak = 0, this.difficultyLevel = 0, this.accumulatedTime = 0, this.lastTimestamp = 0, this.speed = this.baseSpeed, this.status = "idle", this.contributions = B(this.rows, this.cols), this.flashes.clear(), this.statusMessage = null, this.statusMessageTimeRemaining = 0;
  }
  step() {
    this.previousSnake = g(this.snake), v(this.direction, this.queuedDirection) || (this.direction = { ...this.queuedDirection });
    const t = P(this.snake[0], this.direction), s = !!this.food && t.x === this.food.x && t.y === this.food.y;
    if (D(t, this.rows, this.cols) || F(t, this.snake, s)) {
      this.status = "over";
      return;
    }
    if (this.snake.unshift(t), s) {
      this.collectFood(t);
      return;
    }
    this.snake.pop(), this.streak = 0;
  }
  collectFood(t) {
    this.score += 1, this.totalCommits += 1, this.streak += 1, this.contributions[t.y][t.x] = Math.min(4, this.contributions[t.y][t.x] + 1), this.flashes.set(d(t), 260), this.bestScore = Math.max(this.bestScore, this.score);
    const s = this.getDifficultyLevel(this.score);
    s > this.difficultyLevel && (this.difficultyLevel = s, this.setStatusMessage(this.difficultyLevel === 1 ? "Velocity increased" : "Level up")), this.difficulty.streakBonusEnabled && this.streak > 0 && this.streak % this.difficulty.streakBonusEvery === 0 && (this.score += this.difficulty.streakBonusAmount, this.bestScore = Math.max(this.bestScore, this.score), this.setStatusMessage("Commit streak bonus")), this.speed = this.calculateSpeed(), this.food = f(this.rows, this.cols, this.snake), this.food || (this.status = "over");
  }
  calculateSpeed() {
    const t = this.getDifficultyLevel(this.score);
    return Math.max(this.difficulty.maxSpeed, this.baseSpeed - t * this.difficulty.speedStep);
  }
  getDifficultyLevel(t) {
    return this.difficulty.thresholds.reduce((s, r) => t >= r ? s + 1 : s, 0);
  }
  setStatusMessage(t) {
    this.statusMessage = t, this.statusMessageTimeRemaining = this.difficulty.statusMessageDuration;
  }
  updateEffects(t) {
    for (const [s, r] of this.flashes.entries()) {
      const a = r - t;
      a <= 0 ? this.flashes.delete(s) : this.flashes.set(s, a);
    }
    this.statusMessageTimeRemaining > 0 && (this.statusMessageTimeRemaining -= t, this.statusMessageTimeRemaining <= 0 && (this.statusMessageTimeRemaining = 0, this.statusMessage = null));
  }
  emit() {
    const t = this.snapshot();
    this.listeners.forEach((s) => {
      s(t);
    });
  }
  snapshot() {
    return {
      rows: this.rows,
      cols: this.cols,
      status: this.status,
      snake: g(this.snake),
      previousSnake: g(this.previousSnake),
      food: this.food ? { ...this.food } : null,
      contributions: M(this.contributions),
      score: this.score,
      bestScore: this.bestScore,
      totalCommits: this.totalCommits,
      flashKeys: new Set(this.flashes.keys()),
      speed: this.speed,
      streak: this.streak,
      difficultyLevel: this.difficultyLevel,
      statusMessage: this.statusMessage
    };
  }
}
class $ {
  constructor(t) {
    this.cells = /* @__PURE__ */ new Map(), this.config = t, this.currentTheme = t.theme, this.root = document.createElement("div"), this.root.className = `gs-container gs-theme-${t.theme}`, this.applyTheme(t.colors), this.root.innerHTML = this.template(), t.target.innerHTML = "", t.target.appendChild(this.root), this.scoreValue = this.requireElement("[data-gs-score]"), this.bestScoreValue = this.requireElement("[data-gs-best-score]"), this.totalCommitsValue = this.requireElement("[data-gs-total-commits]"), this.boardElement = this.requireElement("[data-gs-board]"), this.overlay = this.requireElement("[data-gs-overlay]"), this.overlayTitle = this.requireElement("[data-gs-overlay-title]"), this.overlayText = this.requireElement("[data-gs-overlay-text]"), this.statusBadge = this.requireElement("[data-gs-status]"), this.primaryButton = this.requireElement("[data-gs-start]"), this.restartButton = this.requireElement("[data-gs-restart]"), this.lightThemeButton = this.requireElement("[data-gs-theme-light]"), this.darkThemeButton = this.requireElement("[data-gs-theme-dark]"), this.boardElement.style.setProperty("--gs-cols", String(t.cols)), this.boardElement.style.setProperty("--gs-cell-size", `${t.cellSize}px`), this.boardElement.style.setProperty("--gs-gap-size", `${t.gapSize}px`), this.createCells(), this.updateThemeButtons();
  }
  bindControls(t) {
    this.primaryButton.addEventListener("click", () => {
      if (this.primaryButton.dataset.state === "pause") {
        t.onPause();
        return;
      }
      t.onStart();
    }), this.restartButton.addEventListener("click", t.onRestart), this.lightThemeButton.addEventListener("click", () => t.onThemeChange("github-light")), this.darkThemeButton.addEventListener("click", () => t.onThemeChange("github-dark"));
  }
  render(t) {
    this.scoreValue.textContent = String(t.score), this.bestScoreValue.textContent = String(t.bestScore), this.totalCommitsValue.textContent = String(t.totalCommits), this.statusBadge.textContent = t.statusMessage ?? `Speed Level ${t.difficultyLevel + 1}`, this.statusBadge.classList.toggle("gs-hidden", !t.statusMessage && t.status === "idle");
    const s = new Map(t.snake.map((a, o) => [`${a.x},${a.y}`, o])), r = t.food ? `${t.food.x},${t.food.y}` : "";
    for (let a = 0; a < t.rows; a += 1)
      for (let o = 0; o < t.cols; o += 1) {
        const n = `${o},${a}`, h = this.cells.get(n);
        if (!h)
          continue;
        const l = ["gs-cell", `gs-level-${t.contributions[a][o]}`];
        t.flashKeys.has(n) && l.push("gs-flash"), r === n && l.push("gs-food"), s.has(n) && (l.push("gs-snake"), l.push(s.get(n) === 0 ? "gs-snake-head" : "gs-snake-body")), h.className = l.join(" ");
      }
    this.updateOverlay(t), this.primaryButton.dataset.state = t.status === "running" ? "pause" : "start", this.primaryButton.textContent = t.status === "running" ? "Pause Game" : "Start Game";
  }
  setTheme(t, s) {
    this.root.className = `gs-container gs-theme-${s}`, this.currentTheme = s, this.applyTheme(t), this.updateThemeButtons();
  }
  destroy() {
    this.root.remove();
  }
  setHostAppearance(t) {
    t.fontFamily && this.root.style.setProperty("--gs-font-family", t.fontFamily);
  }
  createCells() {
    const t = document.createDocumentFragment();
    for (let s = 0; s < this.config.rows; s += 1)
      for (let r = 0; r < this.config.cols; r += 1) {
        const a = document.createElement("div"), o = `${r},${s}`;
        a.className = "gs-cell gs-level-0", a.dataset.position = o, this.cells.set(o, a), t.appendChild(a);
      }
    this.boardElement.appendChild(t);
  }
  updateOverlay(t) {
    const s = q(t.status, t.totalCommits);
    this.overlayTitle.textContent = s.title, this.overlayText.textContent = s.text, this.overlay.classList.toggle("is-hidden", t.status === "running");
  }
  applyTheme(t) {
    this.root.style.setProperty("--gs-page-bg", t.pageBackground), this.root.style.setProperty("--gs-chart-bg", t.chartBackground), this.root.style.setProperty("--gs-border", t.border), this.root.style.setProperty("--gs-text", t.text), this.root.style.setProperty("--gs-muted", t.mutedText), this.root.style.setProperty("--gs-button-bg", t.buttonBackground), this.root.style.setProperty("--gs-button-hover", t.buttonHover), this.root.style.setProperty("--gs-button-primary", t.buttonPrimary), this.root.style.setProperty("--gs-button-primary-hover", t.buttonPrimaryHover), this.root.style.setProperty("--gs-cell-0", t.cellEmpty), this.root.style.setProperty("--gs-cell-1", t.cellLow), this.root.style.setProperty("--gs-cell-2", t.cellMedium), this.root.style.setProperty("--gs-cell-3", t.cellHigh), this.root.style.setProperty("--gs-cell-4", t.cellHighest), this.root.style.setProperty("--gs-snake", t.snake), this.root.style.setProperty("--gs-snake-tail", t.snakeTail), this.root.style.setProperty("--gs-food", t.food), this.root.style.setProperty("--gs-food-core", t.foodCore), this.root.style.setProperty("--gs-overlay", t.overlayBackground);
  }
  template() {
    const t = this.config.showMonthLabels ? this.config.months.map((r) => `<span class="gs-month">${r}</span>`).join("") : "", s = this.config.showWeekdayLabels ? this.config.weekdays.map((r) => `<span class="gs-weekday">${r}</span>`).join("") : "";
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
            <div class="gs-months" aria-hidden="${String(!this.config.showMonthLabels)}">${t}</div>
            <div class="gs-weekdays" aria-hidden="${String(!this.config.showWeekdayLabels)}">${s}</div>
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
  requireElement(t) {
    const s = this.root.querySelector(t);
    if (!s)
      throw new Error(`GitHub Snake renderer could not find element: ${t}`);
    return s;
  }
  updateThemeButtons() {
    const t = this.currentTheme === "github-light";
    this.lightThemeButton.setAttribute("aria-pressed", String(t)), this.darkThemeButton.setAttribute("aria-pressed", String(!t)), this.lightThemeButton.classList.toggle("is-active", t), this.darkThemeButton.classList.toggle("is-active", !t);
  }
}
function q(e, t) {
  switch (e) {
    case "running":
      return {
        title: "",
        text: ""
      };
    case "paused":
      return {
        title: "Paused",
        text: "Press Start Game or use your keyboard controls to keep the streak going."
      };
    case "over":
      return {
        title: "Game Over",
        text: "Your branch broke"
      };
    default:
      return {
        title: "Press Start",
        text: "Use arrow keys or WASD to steer through the contribution chart."
      };
  }
}
function V(e) {
  let t = G(e);
  const s = T({
    ...e,
    theme: t
  });
  let r = z(s.storageKey);
  const a = new H({
    rows: s.rows,
    cols: s.cols,
    baseSpeed: s.speed,
    bestScore: r,
    difficulty: s.difficulty
  }), o = new $(s);
  m(o, s.target);
  let n = 0, h = a.getSnapshot().status;
  o.bindControls({
    onStart: () => a.start(),
    onPause: () => a.pause(),
    onRestart: () => a.restart(),
    onThemeChange: (i) => {
      t = i, R(o, i), m(o, s.target), k(s.storageKey, i), y(s.target, i);
    }
  });
  const l = a.subscribe((i) => {
    var u, p;
    o.render(i), i.bestScore !== r && (O(s.storageKey, i.bestScore), r = i.bestScore), i.score !== n && ((u = s.onScoreChange) == null || u.call(s, i.score, i.bestScore, i.totalCommits), n = i.score), h !== "over" && i.status === "over" && ((p = s.onGameOver) == null || p.call(s, i.score, i.totalCommits)), h = i.status;
  }), b = (i) => {
    const u = W(i.key);
    u && (i.preventDefault(), a.setDirection(u), a.getSnapshot().status !== "running" && a.start());
  };
  return document.addEventListener("keydown", b), y(s.target, t), s.autoplay && a.start(), {
    start: () => a.start(),
    pause: () => a.pause(),
    restart: () => a.restart(),
    destroy: () => {
      l(), document.removeEventListener("keydown", b), a.destroy(), o.destroy();
    },
    setTheme: (i, u) => {
      t = i, o.setTheme(w(i, u), i), m(o, s.target), k(s.storageKey, i), y(s.target, i);
    },
    setSpeed: (i) => {
      a.setSpeed(i);
    }
  };
}
function m(e, t) {
  e.setHostAppearance(I(t));
}
function G(e) {
  var r;
  if (e.theme)
    return e.theme;
  const t = K(e.target);
  if (t)
    return t;
  const s = x(e.storageKey);
  try {
    const a = window.localStorage.getItem(s);
    if (a === "github-light" || a === "github-dark")
      return a;
  } catch {
  }
  return (r = window.matchMedia) != null && r.call(window, "(prefers-color-scheme: light)").matches ? "github-light" : "github-dark";
}
function K(e) {
  if (typeof window > "u" || typeof document > "u")
    return null;
  const t = typeof e == "string" ? document.querySelector(e) : e, s = [
    t,
    (t == null ? void 0 : t.closest("[data-theme]")) ?? null,
    document.documentElement,
    document.body
  ];
  for (const a of s) {
    if (!a)
      continue;
    const o = a.getAttribute("data-theme");
    if (o === "light")
      return "github-light";
    if (o === "dark")
      return "github-dark";
    const n = Array.from(a.classList);
    if (n.includes("light"))
      return "github-light";
    if (n.includes("dark"))
      return "github-dark";
  }
  const r = getComputedStyle(document.documentElement).colorScheme;
  return r.includes("light") ? "github-light" : r.includes("dark") ? "github-dark" : null;
}
function x(e) {
  return `${e ?? "github-snake-best-score"}-theme`;
}
function k(e, t) {
  try {
    window.localStorage.setItem(x(e), t);
  } catch {
  }
}
function R(e, t) {
  e.setTheme(w(t), t);
}
function I(e) {
  const s = getComputedStyle(e).fontFamily || getComputedStyle(document.body).fontFamily;
  return {
    fontFamily: N(s) ? s : void 0
  };
}
function N(e) {
  const t = e.trim().toLowerCase();
  return !(!t || t === "serif" || t === "sans-serif" || t === "monospace" || t.includes("times new roman"));
}
function y(e, t) {
  e.dispatchEvent(
    new CustomEvent("github-snake:themechange", {
      detail: { theme: t },
      bubbles: !0
    })
  );
}
function W(e) {
  return {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    W: { x: 0, y: -1 },
    S: { x: 0, y: 1 },
    A: { x: -1, y: 0 },
    D: { x: 1, y: 0 }
  }[e] ?? null;
}
function z(e) {
  try {
    return Number(window.localStorage.getItem(e) || 0);
  } catch {
    return 0;
  }
}
function O(e, t) {
  try {
    window.localStorage.setItem(e, String(t));
  } catch {
  }
}
export {
  V as createGithubSnake
};
