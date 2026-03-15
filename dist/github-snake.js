const p = {
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
    chartBackground: "#FFFFFF",
    border: "#D0D7DE",
    text: "#1F2328",
    mutedText: "#656D76",
    buttonBackground: "#F6F8FA",
    buttonHover: "#EAEFF2",
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
function v(e) {
  const t = f(e.target), s = e.theme ?? "github-dark", a = u(e.speed, 170, 40), r = {
    ...p[s],
    ...e.customColors
  };
  return {
    target: t,
    rows: u(e.rows, 7, 4),
    cols: u(e.cols, 53, 12),
    cellSize: u(e.cellSize, 14, 8),
    gapSize: u(e.gapSize, 3, 1),
    theme: s,
    colors: r,
    speed: a,
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
    difficulty: k(a, e.difficulty)
  };
}
function f(e) {
  if (typeof e != "string")
    return e;
  const t = document.querySelector(e);
  if (!t)
    throw new Error(`GitHub Snake could not find target element: ${e}`);
  return t;
}
function S(e, t) {
  return {
    ...p[e],
    ...t
  };
}
function u(e, t, s) {
  return typeof e != "number" || Number.isNaN(e) ? t : Math.max(s, Math.floor(e));
}
function k(e, t) {
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
function w(e, t) {
  return Array.from({ length: e }, () => Array(t).fill(0));
}
function x(e) {
  return e.map((t) => [...t]);
}
function d(e) {
  return `${e.x},${e.y}`;
}
function E(e, t, s) {
  return e.x >= 0 && e.y >= 0 && e.x < s && e.y < t;
}
function M(e, t, s) {
  return !E(e, t, s);
}
function C(e, t, s) {
  const a = s ? t : t.slice(0, -1), r = d(e);
  return a.some((o) => d(o) === r);
}
function y(e, t, s) {
  const a = new Set(s.map(d)), r = [];
  for (let o = 0; o < e; o += 1)
    for (let n = 0; n < t; n += 1) {
      const h = { x: n, y: o };
      a.has(d(h)) || r.push(h);
    }
  return r.length === 0 ? null : r[Math.floor(Math.random() * r.length)];
}
function B(e, t) {
  const s = Math.floor(t / 2), a = Math.floor(e / 2);
  return [
    { x: s, y: a },
    { x: s - 1, y: a },
    { x: s - 2, y: a }
  ];
}
function g(e) {
  return e.map((t) => ({ ...t }));
}
function D(e, t) {
  return {
    x: e.x + t.x,
    y: e.y + t.y
  };
}
function b(e, t) {
  return e.x === -t.x && e.y === -t.y;
}
class T {
  constructor(t) {
    this.listeners = /* @__PURE__ */ new Set(), this.animationFrameId = 0, this.lastTimestamp = 0, this.accumulatedTime = 0, this.flashes = /* @__PURE__ */ new Map(), this.status = "idle", this.score = 0, this.bestScore = 0, this.totalCommits = 0, this.streak = 0, this.difficultyLevel = 0, this.snake = [], this.previousSnake = [], this.food = null, this.contributions = [], this.direction = { x: 1, y: 0 }, this.queuedDirection = { x: 1, y: 0 }, this.statusMessage = null, this.statusMessageTimeRemaining = 0, this.frame = (s) => {
      this.lastTimestamp || (this.lastTimestamp = s);
      const a = Math.min(32, s - this.lastTimestamp);
      if (this.lastTimestamp = s, this.status === "running") {
        for (this.accumulatedTime += a; this.accumulatedTime >= this.speed; )
          if (this.accumulatedTime -= this.speed, this.step(), this.status !== "running") {
            this.accumulatedTime = 0;
            break;
          }
      }
      this.updateEffects(a), this.emit(), this.animationFrameId = window.requestAnimationFrame(this.frame);
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
    this.snake.length > 1 && b(this.direction, t) || (this.queuedDirection = t);
  }
  setBestScore(t) {
    this.bestScore = t, this.emit();
  }
  getSnapshot() {
    return this.snapshot();
  }
  resetState() {
    this.snake = B(this.rows, this.cols), this.previousSnake = g(this.snake), this.direction = { x: 1, y: 0 }, this.queuedDirection = { x: 1, y: 0 }, this.food = y(this.rows, this.cols, this.snake), this.score = 0, this.totalCommits = 0, this.streak = 0, this.difficultyLevel = 0, this.accumulatedTime = 0, this.lastTimestamp = 0, this.speed = this.baseSpeed, this.status = "idle", this.contributions = w(this.rows, this.cols), this.flashes.clear(), this.statusMessage = null, this.statusMessageTimeRemaining = 0;
  }
  step() {
    this.previousSnake = g(this.snake), b(this.direction, this.queuedDirection) || (this.direction = { ...this.queuedDirection });
    const t = D(this.snake[0], this.direction), s = !!this.food && t.x === this.food.x && t.y === this.food.y;
    if (M(t, this.rows, this.cols) || C(t, this.snake, s)) {
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
    s > this.difficultyLevel && (this.difficultyLevel = s, this.setStatusMessage(this.difficultyLevel === 1 ? "Velocity increased" : "Level up")), this.difficulty.streakBonusEnabled && this.streak > 0 && this.streak % this.difficulty.streakBonusEvery === 0 && (this.score += this.difficulty.streakBonusAmount, this.bestScore = Math.max(this.bestScore, this.score), this.setStatusMessage("Commit streak bonus")), this.speed = this.calculateSpeed(), this.food = y(this.rows, this.cols, this.snake), this.food || (this.status = "over");
  }
  calculateSpeed() {
    const t = this.getDifficultyLevel(this.score);
    return Math.max(this.difficulty.maxSpeed, this.baseSpeed - t * this.difficulty.speedStep);
  }
  getDifficultyLevel(t) {
    return this.difficulty.thresholds.reduce((s, a) => t >= a ? s + 1 : s, 0);
  }
  setStatusMessage(t) {
    this.statusMessage = t, this.statusMessageTimeRemaining = this.difficulty.statusMessageDuration;
  }
  updateEffects(t) {
    for (const [s, a] of this.flashes.entries()) {
      const r = a - t;
      r <= 0 ? this.flashes.delete(s) : this.flashes.set(s, r);
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
      contributions: x(this.contributions),
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
class L {
  constructor(t) {
    this.cells = /* @__PURE__ */ new Map(), this.config = t, this.root = document.createElement("div"), this.root.className = `gs-container gs-theme-${t.theme}`, this.applyTheme(t.colors), this.root.innerHTML = this.template(), t.target.innerHTML = "", t.target.appendChild(this.root), this.scoreValue = this.requireElement("[data-gs-score]"), this.bestScoreValue = this.requireElement("[data-gs-best-score]"), this.totalCommitsValue = this.requireElement("[data-gs-total-commits]"), this.boardElement = this.requireElement("[data-gs-board]"), this.overlay = this.requireElement("[data-gs-overlay]"), this.overlayTitle = this.requireElement("[data-gs-overlay-title]"), this.overlayText = this.requireElement("[data-gs-overlay-text]"), this.statusBadge = this.requireElement("[data-gs-status]"), this.primaryButton = this.requireElement("[data-gs-start]"), this.restartButton = this.requireElement("[data-gs-restart]"), this.boardElement.style.setProperty("--gs-cols", String(t.cols)), this.boardElement.style.setProperty("--gs-cell-size", `${t.cellSize}px`), this.boardElement.style.setProperty("--gs-gap-size", `${t.gapSize}px`), this.createCells();
  }
  bindControls(t) {
    this.primaryButton.addEventListener("click", () => {
      if (this.primaryButton.dataset.state === "pause") {
        t.onPause();
        return;
      }
      t.onStart();
    }), this.restartButton.addEventListener("click", t.onRestart);
  }
  render(t) {
    this.scoreValue.textContent = String(t.score), this.bestScoreValue.textContent = String(t.bestScore), this.totalCommitsValue.textContent = String(t.totalCommits), this.statusBadge.textContent = t.statusMessage ?? `Velocity ${t.difficultyLevel + 1}`, this.statusBadge.classList.toggle("gs-hidden", !t.statusMessage && t.status === "idle");
    const s = new Map(t.snake.map((r, o) => [`${r.x},${r.y}`, o])), a = t.food ? `${t.food.x},${t.food.y}` : "";
    for (let r = 0; r < t.rows; r += 1)
      for (let o = 0; o < t.cols; o += 1) {
        const n = `${o},${r}`, h = this.cells.get(n);
        if (!h)
          continue;
        const l = ["gs-cell", `gs-level-${t.contributions[r][o]}`];
        t.flashKeys.has(n) && l.push("gs-flash"), a === n && l.push("gs-food"), s.has(n) && (l.push("gs-snake"), l.push(s.get(n) === 0 ? "gs-snake-head" : "gs-snake-body")), h.className = l.join(" ");
      }
    this.updateOverlay(t), this.primaryButton.dataset.state = t.status === "running" ? "pause" : "start", this.primaryButton.textContent = t.status === "running" ? "Pause" : "Start";
  }
  setTheme(t, s) {
    this.root.className = `gs-container gs-theme-${s}`, this.applyTheme(t);
  }
  destroy() {
    this.root.remove();
  }
  createCells() {
    const t = document.createDocumentFragment();
    for (let s = 0; s < this.config.rows; s += 1)
      for (let a = 0; a < this.config.cols; a += 1) {
        const r = document.createElement("div"), o = `${a},${s}`;
        r.className = "gs-cell gs-level-0", r.dataset.position = o, this.cells.set(o, r), t.appendChild(r);
      }
    this.boardElement.appendChild(t);
  }
  updateOverlay(t) {
    const s = F(t.status, t.totalCommits);
    this.overlayTitle.textContent = s.title, this.overlayText.textContent = s.text, this.overlay.classList.toggle("is-hidden", t.status === "running");
  }
  applyTheme(t) {
    this.root.style.setProperty("--gs-page-bg", t.pageBackground), this.root.style.setProperty("--gs-chart-bg", t.chartBackground), this.root.style.setProperty("--gs-border", t.border), this.root.style.setProperty("--gs-text", t.text), this.root.style.setProperty("--gs-muted", t.mutedText), this.root.style.setProperty("--gs-button-bg", t.buttonBackground), this.root.style.setProperty("--gs-button-hover", t.buttonHover), this.root.style.setProperty("--gs-button-primary", t.buttonPrimary), this.root.style.setProperty("--gs-button-primary-hover", t.buttonPrimaryHover), this.root.style.setProperty("--gs-cell-0", t.cellEmpty), this.root.style.setProperty("--gs-cell-1", t.cellLow), this.root.style.setProperty("--gs-cell-2", t.cellMedium), this.root.style.setProperty("--gs-cell-3", t.cellHigh), this.root.style.setProperty("--gs-cell-4", t.cellHighest), this.root.style.setProperty("--gs-snake", t.snake), this.root.style.setProperty("--gs-snake-tail", t.snakeTail), this.root.style.setProperty("--gs-food", t.food), this.root.style.setProperty("--gs-food-core", t.foodCore), this.root.style.setProperty("--gs-overlay", t.overlayBackground);
  }
  template() {
    const t = this.config.showMonthLabels ? this.config.months.map((a) => `<span class="gs-month">${a}</span>`).join("") : "", s = this.config.showWeekdayLabels ? this.config.weekdays.map((a) => `<span class="gs-weekday">${a}</span>`).join("") : "";
    return `
      <section class="gs-shell">
        <header class="gs-header">
          <div>
            <p class="gs-kicker">GitHub Snake</p>
            <h2 class="gs-title">Playable contribution graph</h2>
            <p class="gs-subtitle">Embeddable GitHub-style Snake for websites and future npm packaging.</p>
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
              <h3>Contribution activity</h3>
              <span class="gs-status-badge gs-hidden" data-gs-status></span>
            </div>
            <p>Snake moves inside a real ${this.config.rows} x ${this.config.cols} contribution chart.</p>
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
                <button class="gs-button gs-button-primary" type="button" data-gs-start>Start</button>
                <button class="gs-button" type="button" data-gs-restart>Restart</button>
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
}
function F(e, t) {
  switch (e) {
    case "running":
      return {
        title: "",
        text: ""
      };
    case "paused":
      return {
        title: "Paused",
        text: "Press Start or your keyboard controls to keep the streak going."
      };
    case "over":
      return {
        title: "Game Over",
        text: `You collected ${t} commit${t === 1 ? "" : "s"} before the branch broke.`
      };
    default:
      return {
        title: "Press Start",
        text: "Use arrow keys or WASD to steer through the contribution chart."
      };
  }
}
function H(e) {
  const t = v(e);
  let s = $(t.storageKey);
  const a = new T({
    rows: t.rows,
    cols: t.cols,
    baseSpeed: t.speed,
    bestScore: s,
    difficulty: t.difficulty
  }), r = new L(t);
  let o = 0, n = a.getSnapshot().status;
  r.bindControls({
    onStart: () => a.start(),
    onPause: () => a.pause(),
    onRestart: () => a.restart()
  });
  const h = a.subscribe((i) => {
    var c, m;
    r.render(i), i.bestScore !== s && (A(t.storageKey, i.bestScore), s = i.bestScore), i.score !== o && ((c = t.onScoreChange) == null || c.call(t, i.score, i.bestScore, i.totalCommits), o = i.score), n !== "over" && i.status === "over" && ((m = t.onGameOver) == null || m.call(t, i.score, i.totalCommits)), n = i.status;
  }), l = (i) => {
    const c = P(i.key);
    c && (i.preventDefault(), a.setDirection(c), a.getSnapshot().status !== "running" && a.start());
  };
  return document.addEventListener("keydown", l), t.autoplay && a.start(), {
    start: () => a.start(),
    pause: () => a.pause(),
    restart: () => a.restart(),
    destroy: () => {
      h(), document.removeEventListener("keydown", l), a.destroy(), r.destroy();
    },
    setTheme: (i, c) => {
      r.setTheme(S(i, c), i);
    },
    setSpeed: (i) => {
      a.setSpeed(i);
    }
  };
}
function P(e) {
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
function $(e) {
  try {
    return Number(window.localStorage.getItem(e) || 0);
  } catch {
    return 0;
  }
}
function A(e, t) {
  try {
    window.localStorage.setItem(e, String(t));
  } catch {
  }
}
export {
  H as createGithubSnake
};
