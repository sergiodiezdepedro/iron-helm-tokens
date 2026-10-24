import { useEffect, useState, type FormEvent } from "react";
import {
  Coins,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  Skull,
  Sparkles,
  Sun,
  Moon,
  Wheat,
  X,
  Zap,
} from "lucide-react";
import "./App.css";

const tokenTypes = [
  { id: "gold", name: "Monedas de oro", total: 12, Icon: Coins, color: "gold" },
  {
    id: "health",
    name: "Fichas de salud",
    total: 18,
    Icon: Heart,
    color: "health",
  },
  {
    id: "poison",
    name: "Fichas de veneno",
    total: 10,
    Icon: Skull,
    color: "poison",
  },
  {
    id: "energy",
    name: "Fichas de energía",
    total: 14,
    Icon: Zap,
    color: "energy",
  },
  {
    id: "ration",
    name: "Fichas de ración",
    total: 10,
    Icon: Wheat,
    color: "ration",
  },
] as const;

type TokenId = (typeof tokenTypes)[number]["id"];
type Inventory = Record<TokenId, number>;
const startingTokenTypes = [
  { id: "health", name: "Salud", total: 18, Icon: Heart, color: "health" },
  { id: "gold", name: "Monedas", total: 12, Icon: Coins, color: "gold" },
  { id: "energy", name: "Energía", total: 14, Icon: Zap, color: "energy" },
  { id: "ration", name: "Ración", total: 10, Icon: Wheat, color: "ration" },
] as const;
type StartingTokenId = (typeof startingTokenTypes)[number]["id"];
type StartingAmounts = Record<StartingTokenId, number>;
type BlessingFace = "poison" | "healthOne" | "healthTwo" | "energy";
type BlessingState = { pool: BlessingFace[]; held: BlessingFace[] };
type Theme = "dark" | "light";
type DivineReport = {
  faces: BlessingFace[];
  healthGained: number;
  energyGained: number;
  poisonRemoved: number;
};

const blessingComposition: BlessingFace[] = [
  "poison",
  "poison",
  "healthOne",
  "healthOne",
  "healthOne",
  "healthTwo",
  "healthTwo",
  "healthTwo",
  "energy",
  "energy",
  "energy",
  "energy",
];

const blessingLabels: Record<BlessingFace, string> = {
  poison: "Corazón verde · purifica el veneno",
  healthOne: "Corazón rojo · +1 Salud",
  healthTwo: "Corazón rojo · +2 Salud",
  energy: "Energía morada · +1 Energía",
};

const initialInventory: Inventory = {
  gold: 0,
  health: 0,
  poison: 0,
  energy: 0,
  ration: 0,
};
const initialStartingAmounts: StartingAmounts = {
  health: 0,
  gold: 0,
  energy: 0,
  ration: 0,
};

const storageKey = "iron-helm-token-inventory";
const blessingStorageKey = "iron-helm-blessing-inventory";
const themeStorageKey = "iron-helm-theme";
const gameStartedStorageKey = "iron-helm-game-started";
const startingAmountsStorageKey = "iron-helm-starting-amounts";

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(themeStorageKey);
    return saved === "light" || saved === "dark" ? saved : "dark";
  } catch {
    return "dark";
  }
}

function createBlessingState(): BlessingState {
  const pool = [...blessingComposition];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return { pool, held: [] };
}

function isBlessingFace(value: unknown): value is BlessingFace {
  return (
    value === "poison" ||
    value === "healthOne" ||
    value === "healthTwo" ||
    value === "energy"
  );
}

function loadBlessings(): BlessingState {
  try {
    const saved = localStorage.getItem(blessingStorageKey);
    if (!saved) return createBlessingState();

    const parsed: unknown = JSON.parse(saved);
    if (typeof parsed !== "object" || parsed === null) {
      return createBlessingState();
    }

    const record = parsed as Record<string, unknown>;
    if (!Array.isArray(record.pool) || !Array.isArray(record.held)) {
      return createBlessingState();
    }

    return {
      pool: record.pool.filter(isBlessingFace),
      held: record.held.filter(isBlessingFace),
    };
  } catch {
    return createBlessingState();
  }
}

function loadInventory(): Inventory {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return initialInventory;

    const parsed: unknown = JSON.parse(saved);
    if (typeof parsed !== "object" || parsed === null) return initialInventory;
    const healthLimit = loadStartingAmounts().health;

    return Object.fromEntries(
      tokenTypes.map(({ id, total }) => {
        const amount = (parsed as Record<string, unknown>)[id];
        const limit = id === "health" ? healthLimit : total;
        return [
          id,
          typeof amount === "number"
            ? Math.min(limit, Math.max(0, Math.floor(amount)))
            : 0,
        ];
      }),
    ) as Inventory;
  } catch {
    return initialInventory;
  }
}

function loadStartingAmounts(): StartingAmounts {
  try {
    const saved = localStorage.getItem(startingAmountsStorageKey);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (typeof parsed === "object" && parsed !== null) {
        return Object.fromEntries(
          startingTokenTypes.map(({ id, total }) => {
            const amount = (parsed as Record<string, unknown>)[id];
            return [
              id,
              typeof amount === "number"
                ? Math.min(total, Math.max(0, Math.floor(amount)))
                : 0,
            ];
          }),
        ) as StartingAmounts;
      }
    }

    const savedInventory = localStorage.getItem(storageKey);
    if (savedInventory) {
      const inventory: unknown = JSON.parse(savedInventory);
      if (typeof inventory === "object" && inventory !== null) {
        const health = (inventory as Record<string, unknown>).health;
        return {
          ...initialStartingAmounts,
          health:
            typeof health === "number"
              ? Math.min(18, Math.max(0, Math.floor(health)))
              : 0,
        };
      }
    }

    return initialStartingAmounts;
  } catch {
    return initialStartingAmounts;
  }
}

function loadGameStarted(): boolean {
  try {
    const saved = localStorage.getItem(gameStartedStorageKey);
    if (saved !== null) return saved === "true";
    return localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
}

function App() {
  const [inventory, setInventory] = useState<Inventory>(loadInventory);
  const [blessings, setBlessings] = useState<BlessingState>(loadBlessings);
  const [isGameStarted, setIsGameStarted] = useState(loadGameStarted);
  const [startingAmounts, setStartingAmounts] =
    useState<StartingAmounts>(loadStartingAmounts);
  const [divineReport, setDivineReport] = useState<DivineReport | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const standardTokenTotal = tokenTypes.reduce(
    (sum, token) => sum + token.total,
    0,
  );
  const carriedTokens = Object.values(inventory).reduce(
    (sum, amount) => sum + amount,
    blessings.held.length,
  );
  const reserveTokens =
    standardTokenTotal -
    Object.values(inventory).reduce((sum, amount) => sum + amount, 0) +
    blessings.pool.length;
  const totalTokens = reserveTokens + carriedTokens;
  const isGameOver =
    isGameStarted &&
    inventory.poison > 0 &&
    inventory.poison >= inventory.health;

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(blessingStorageKey, JSON.stringify(blessings));
  }, [blessings]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(gameStartedStorageKey, String(isGameStarted));
  }, [isGameStarted]);

  useEffect(() => {
    localStorage.setItem(
      startingAmountsStorageKey,
      JSON.stringify(startingAmounts),
    );
  }, [startingAmounts]);

  useEffect(() => {
    if (!isResetDialogOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsResetDialogOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isResetDialogOpen]);

  function changeAmount(id: TokenId, change: number) {
    setInventory((current) => ({
      ...current,
      [id]: Math.min(
        id === "health"
          ? startingAmounts.health
          : tokenTypes.find((token) => token.id === id)!.total,
        Math.max(0, current[id] + change),
      ),
    }));
  }

  function resetInventory() {
    setIsResetDialogOpen(true);
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function changeStartingAmount(id: StartingTokenId, value: string) {
    const token = startingTokenTypes.find((item) => item.id === id)!;
    const amount = value === "" ? 0 : Math.floor(Number(value));
    setStartingAmounts((current) => ({
      ...current,
      [id]: Math.min(token.total, Math.max(0, amount)),
    }));
  }

  function startGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInventory({ ...initialInventory, ...startingAmounts });
    setBlessings(createBlessingState());
    setDivineReport(null);
    setIsGameStarted(true);
  }

  function confirmResetInventory() {
    setInventory(initialInventory);
    setBlessings(createBlessingState());
    setDivineReport(null);
    setIsResetDialogOpen(false);
    setStartingAmounts(initialStartingAmounts);
    setIsGameStarted(false);
  }

  function takeBlessing() {
    setBlessings((current) => {
      if (current.pool.length === 0) return current;

      const pool = [...current.pool];
      const faceIndex = Math.floor(Math.random() * pool.length);
      const [face] = pool.splice(faceIndex, 1);
      return { pool, held: [...current.held, face] };
    });
  }

  function spendBlessingForReroll() {
    setBlessings((current) => {
      if (current.held.length === 0) return current;

      const held = [...current.held];
      held.splice(Math.floor(Math.random() * held.length), 1);
      return { ...current, held };
    });
  }

  function resolveDivinePresence() {
    const faces = blessings.held;
    if (faces.length === 0) return;

    const healthReward = faces.reduce(
      (sum, face) =>
        sum + (face === "healthOne" ? 1 : face === "healthTwo" ? 2 : 0),
      0,
    );
    const energyReward = faces.filter((face) => face === "energy").length;
    const healthGained = Math.min(
      Math.max(0, startingAmounts.health - inventory.health),
      healthReward,
    );
    const energyGained = Math.min(14 - inventory.energy, energyReward);
    const poisonRemoved = faces.includes("poison") ? inventory.poison : 0;

    setInventory((current) => ({
      ...current,
      health: Math.min(startingAmounts.health, current.health + healthReward),
      energy: Math.min(14, current.energy + energyReward),
      poison: faces.includes("poison") ? 0 : current.poison,
    }));
    setDivineReport({
      faces: [...faces],
      healthGained,
      energyGained,
      poisonRemoved,
    });
    setBlessings((current) => ({ ...current, held: [] }));
  }

  return (
    <main className="app-shell">
      <header className="topbar" inert={!isGameStarted || isGameOver}>
        <a
          className="wordmark"
          href="https://boardgamegeek.com/boardgame/273264/iron-helm"
          aria-label="Iron Helm BGG">
          <span className="wordmark-mark">
            <Shield size={20} strokeWidth={1.8} />
          </span>
          <span>
            IRON HELM <small>BGG</small>
          </span>
        </a>
        <div className="topbar-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={`Cambiar a tema ${theme === "dark" ? "claro" : "oscuro"}`}
            aria-pressed={theme === "dark"}
            title={`Cambiar a tema ${theme === "dark" ? "claro" : "oscuro"}`}>
            {theme === "dark" ? (
              <Sun size={16} aria-hidden="true" />
            ) : (
              <Moon size={16} aria-hidden="true" />
            )}
            <span>{theme === "dark" ? "Claro" : "Oscuro"}</span>
          </button>
          <button
            className="reset-button"
            type="button"
            onClick={resetInventory}>
            <RotateCcw size={15} aria-hidden="true" />
            <span>Reiniciar cuenta</span>
          </button>
        </div>
      </header>

      <div className="content" id="inicio" inert={!isGameStarted || isGameOver}>
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">REGISTRO DEL AVENTURERO</p>
          <h1 id="page-title">
            Reserva de <em>aventura</em>
          </h1>
          <p className="intro-copy">
            El arcón común y las fichas que llevas contigo.
          </p>
        </section>

        <section className="summary" aria-label="Resumen de fichas">
          <div className="summary-item summary-carried">
            <span className="summary-label">En tu poder</span>
            <strong>
              {carriedTokens}
              <small> {carriedTokens === 1 ? "ficha" : "fichas"}</small>
            </strong>
          </div>
          <div className="summary-item summary-reserve">
            <span className="summary-label">En la reserva</span>
            <strong>
              {reserveTokens}
              <small>/{totalTokens}</small>
            </strong>
          </div>
          <div className="summary-note">
            <span className="summary-seal">
              <Shield size={17} aria-hidden="true" />
            </span>
            <span>
              Inventario
              <br />
              <b>de campaña</b>
            </span>
          </div>
        </section>

        <section className="inventory" aria-labelledby="inventory-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CONTENIDO DEL ARCÓN</p>
              <h2 id="inventory-title">Fichas disponibles</h2>
            </div>
            <span className="item-count">{tokenTypes.length} TIPOS</span>
          </div>

          <div className="token-list">
            {tokenTypes.map(({ id, name, total, Icon, color }) => {
              const carried = inventory[id];
              const available = total - carried;

              return (
                <article className={`token-row ${color}`} key={id}>
                  <div className="token-icon">
                    <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <div className="token-info">
                    <h3>{name}</h3>
                    <p>
                      {id === "health" && isGameStarted
                        ? `Máximo personal: ${startingAmounts.health}`
                        : `Reserva inicial: ${total}`}
                    </p>
                    <div className="progress-track" aria-hidden="true">
                      <span style={{ width: `${(carried / total) * 100}%` }} />
                    </div>
                  </div>
                  <div
                    className="carried-count"
                    aria-label={`${carried} en tu poder`}>
                    <strong>{carried}</strong>
                    <span>TENGO</span>
                  </div>
                  <div
                    className="token-count"
                    aria-label={`${available} en reserva, ${carried} en tu poder`}>
                    <strong>{available}</strong>
                    <span>EN RESERVA</span>
                  </div>
                  <div className="token-actions">
                    <div className="action-buttons">
                      <button
                        className="action-button take-button"
                        type="button"
                        onClick={() => changeAmount(id, 1)}
                        disabled={
                          id === "health"
                            ? carried >= startingAmounts.health
                            : available === 0
                        }
                        aria-label={`Obtener una ficha: ${name}`}>
                        <Plus size={15} aria-hidden="true" />
                        <span>Obtener</span>
                      </button>
                      <button
                        className="action-button spend-button"
                        type="button"
                        onClick={() => changeAmount(id, -1)}
                        disabled={carried === 0}
                        aria-label={`Gastar una ficha: ${name}`}>
                        <Minus size={15} aria-hidden="true" />
                        <span>Gastar</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="blessing-section" aria-labelledby="blessing-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EL FAVOR DE LOS DIOSES</p>
              <h2 id="blessing-title">Fichas de bendición</h2>
            </div>
            <span className="item-count">
              {blessings.pool.length} EN EL ARCÓN
            </span>
          </div>

          <div className="blessing-panel">
            <div className="blessing-intro">
              <span className="blessing-emblem">
                <Sparkles size={19} aria-hidden="true" />
              </span>
              <p>El reverso permanece oculto hasta la Presencia Divina.</p>
            </div>

            <div
              className="blessing-hand"
              aria-label={`${blessings.held.length} bendiciones ocultas en tu poder`}>
              {blessings.held.length > 0 ? (
                blessings.held.map((_, index) => (
                  <span
                    className="blessing-back"
                    key={index}
                    aria-label="Bendición oculta">
                    <Shield size={18} aria-hidden="true" />
                  </span>
                ))
              ) : (
                <span className="empty-hand">Aún no tienes bendiciones</span>
              )}
            </div>

            <div className="blessing-actions">
              <button
                className="action-button blessing-draw"
                type="button"
                onClick={takeBlessing}
                disabled={blessings.pool.length === 0}>
                <Plus size={15} aria-hidden="true" />
                Obtener bendición
              </button>
              <button
                className="action-button"
                type="button"
                onClick={spendBlessingForReroll}
                disabled={blessings.held.length === 0}
                title="Consume una bendición sin revelar su reverso">
                <RotateCcw size={14} aria-hidden="true" />
                Repetir dados
              </button>
              <button
                className="action-button blessing-divine"
                type="button"
                onClick={resolveDivinePresence}
                disabled={blessings.held.length === 0}>
                <Sparkles size={14} aria-hidden="true" />
                Presencia Divina
              </button>
            </div>
            <p className="blessing-footnote">
              Las bendiciones se obtienen a ciegas. Repetir dados consume una
              sin revelarla; Presencia Divina revela y consume todas las que
              llevas.
            </p>
          </div>
        </section>

        <footer className="footer-note">
          <span className="footer-rule" />
          <p>Que la fortuna acompañe tu próxima expedición.</p>
          <span className="footer-rule" />
        </footer>
      </div>

      {!isGameStarted && (
        <div className="report-backdrop">
          <form
            className="divine-report setup-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="setup-title"
            onSubmit={startGame}>
            <span className="report-emblem">
              <Shield size={20} aria-hidden="true" />
            </span>
            <p className="eyebrow">PREPARA TU AVENTURA</p>
            <h2 id="setup-title">Valores iniciales</h2>
            <p className="report-outcome">
              Introduce los tokens iniciales de tu personaje. Se descontarán de
              la reserva común al empezar.
            </p>
            <div className="starting-token-grid">
              {startingTokenTypes.map(({ id, name, total, Icon, color }) => (
                <label
                  className="starting-token-field"
                  key={id}
                  htmlFor={`starting-${id}`}>
                  <span className={`starting-token-name ${color}`}>
                    <Icon size={17} aria-hidden="true" />
                    {name}
                  </span>
                  <span className="starting-token-pool">Pool: {total}</span>
                  <input
                    id={`starting-${id}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={total}
                    step={1}
                    required
                    value={startingAmounts[id]}
                    onChange={(event) =>
                      changeStartingAmount(id, event.currentTarget.value)
                    }
                  />
                </label>
              ))}
            </div>
            <p className="setup-note">Veneno y Bendiciones empiezan en cero.</p>
            <button className="report-done setup-submit" type="submit">
              Iniciar partida
            </button>
          </form>
        </div>
      )}

      {divineReport && !isGameOver && isGameStarted && (
        <div className="report-backdrop">
          <section
            className="divine-report"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title">
            <button
              className="report-close"
              type="button"
              onClick={() => setDivineReport(null)}
              aria-label="Cerrar recompensas">
              <X size={18} aria-hidden="true" />
            </button>
            <span className="report-emblem">
              <Sparkles size={20} aria-hidden="true" />
            </span>
            <p className="eyebrow">LAS FICHAS HAN SIDO REVELADAS</p>
            <h2 id="report-title">Presencia Divina</h2>
            <ul className="revealed-faces">
              {divineReport.faces.map((face, index) => (
                <li key={`${face}-${index}`}>{blessingLabels[face]}</li>
              ))}
            </ul>
            <p className="report-outcome">
              {divineReport.healthGained > 0 &&
                `+${divineReport.healthGained} Salud. `}
              {divineReport.energyGained > 0 &&
                `+${divineReport.energyGained} Energía. `}
              {divineReport.poisonRemoved > 0 &&
                `Se devolvieron ${divineReport.poisonRemoved} fichas de veneno al arcón.`}
              {divineReport.healthGained === 0 &&
                divineReport.energyGained === 0 &&
                divineReport.poisonRemoved === 0 &&
                "No había recompensas aplicables a tu inventario."}
            </p>
            <button
              className="report-done"
              type="button"
              onClick={() => setDivineReport(null)}>
              Continuar
            </button>
          </section>
        </div>
      )}

      {isResetDialogOpen && !isGameOver && isGameStarted && (
        <div
          className="report-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsResetDialogOpen(false);
            }
          }}>
          <section
            className="divine-report reset-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            aria-describedby="reset-description">
            <span className="report-emblem">
              <RotateCcw size={20} aria-hidden="true" />
            </span>
            <p className="eyebrow">NUEVA PARTIDA</p>
            <h2 id="reset-title">Reiniciar cuenta</h2>
            <p className="report-outcome" id="reset-description">
              Se devolverán al arcón todos los tokens y el mazo de Bendiciones
              volverá a su composición inicial. Después tendrás que introducir
              los valores iniciales de la nueva partida.
            </p>
            <div className="reset-actions">
              <button
                className="action-button reset-cancel"
                type="button"
                autoFocus
                onClick={() => setIsResetDialogOpen(false)}>
                Cancelar
              </button>
              <button
                className="report-done reset-confirm"
                type="button"
                onClick={confirmResetInventory}>
                Reiniciar cuenta
              </button>
            </div>
          </section>
        </div>
      )}

      {isGameOver && (
        <div className="report-backdrop">
          <section
            className="divine-report death-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="death-title"
            aria-describedby="death-description">
            <span className="report-emblem death-emblem">
              <Skull size={22} aria-hidden="true" />
            </span>
            <p className="eyebrow">AVENTURA TERMINADA</p>
            <h2 id="death-title">Has caído</h2>
            <p className="report-outcome" id="death-description">
              Tienes {inventory.poison} ficha
              {inventory.poison === 1 ? "" : "s"} de Veneno y {inventory.health}{" "}
              ficha
              {inventory.health === 1 ? "" : "s"} de Salud. El Veneno ha
              igualado o superado tu Salud; la partida ha terminado.
            </p>
            <button
              className="report-done reset-confirm death-reset"
              type="button"
              onClick={confirmResetInventory}>
              <RotateCcw size={15} aria-hidden="true" />
              Reiniciar partida
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
