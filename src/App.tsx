import { useEffect, useState } from "react";
import {
  Coins,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  Skull,
  Sparkles,
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
type BlessingFace = "poison" | "healthOne" | "healthTwo" | "energy";
type BlessingState = { pool: BlessingFace[]; held: BlessingFace[] };
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

const storageKey = "iron-helm-token-inventory";
const blessingStorageKey = "iron-helm-blessing-inventory";

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

    return Object.fromEntries(
      tokenTypes.map(({ id, total }) => {
        const amount = (parsed as Record<string, unknown>)[id];
        return [
          id,
          typeof amount === "number"
            ? Math.min(total, Math.max(0, Math.floor(amount)))
            : 0,
        ];
      }),
    ) as Inventory;
  } catch {
    return initialInventory;
  }
}

function App() {
  const [inventory, setInventory] = useState<Inventory>(loadInventory);
  const [blessings, setBlessings] = useState<BlessingState>(loadBlessings);
  const [divineReport, setDivineReport] = useState<DivineReport | null>(null);
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

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(blessingStorageKey, JSON.stringify(blessings));
  }, [blessings]);

  function changeAmount(id: TokenId, change: number) {
    setInventory((current) => ({
      ...current,
      [id]: Math.min(
        tokenTypes.find((token) => token.id === id)!.total,
        Math.max(0, current[id] + change),
      ),
    }));
  }

  function resetInventory() {
    if (window.confirm("¿Quieres devolver todas las fichas a la reserva?")) {
      setInventory(initialInventory);
      setBlessings(createBlessingState());
      setDivineReport(null);
    }
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
      const faceIndex = Math.floor(Math.random() * held.length);
      const [face] = held.splice(faceIndex, 1);
      const pool = [...current.pool];
      pool.splice(Math.floor(Math.random() * (pool.length + 1)), 0, face);
      return { pool, held };
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
    const healthGained = Math.min(18 - inventory.health, healthReward);
    const energyGained = Math.min(14 - inventory.energy, energyReward);
    const poisonRemoved = faces.includes("poison") ? inventory.poison : 0;

    setInventory((current) => ({
      ...current,
      health: Math.min(18, current.health + healthReward),
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
      <header className="topbar">
        <a className="wordmark" href="#inicio" aria-label="Iron Helm, inicio">
          <span className="wordmark-mark">
            <Shield size={20} strokeWidth={1.8} />
          </span>
          <span>
            IRON HELM <small>LIBRO DE CAMPAÑA</small>
          </span>
        </a>
        <button className="reset-button" type="button" onClick={resetInventory}>
          <RotateCcw size={15} aria-hidden="true" />
          <span>Reiniciar cuenta</span>
        </button>
      </header>

      <div className="content" id="inicio">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">
            REGISTRO DEL AVENTURERO <span>·</span> TEMPORADA I
          </p>
          <h1 id="page-title">
            Reserva de <em>aventura</em>
          </h1>
          <p className="intro-copy">
            El arcón común y las fichas que llevas contigo.
          </p>
        </section>

        <section className="summary" aria-label="Resumen de fichas">
          <div className="summary-item">
            <span className="summary-label">En la reserva</span>
            <strong>
              {reserveTokens}
              <small>/{totalTokens}</small>
            </strong>
          </div>
          <div className="summary-item summary-carried">
            <span className="summary-label">En tu poder</span>
            <strong>
              {carriedTokens}
              <small> {carriedTokens === 1 ? "ficha" : "fichas"}</small>
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
                    <p>Reserva inicial: {total}</p>
                    <div className="progress-track" aria-hidden="true">
                      <span style={{ width: `${(carried / total) * 100}%` }} />
                    </div>
                  </div>
                  <div
                    className="token-count"
                    aria-label={`${available} en reserva, ${carried} en tu poder`}>
                    <strong>{available}</strong>
                    <span>EN RESERVA</span>
                  </div>
                  <div className="token-actions">
                    <span className="carried-count">{carried} contigo</span>
                    <div className="action-buttons">
                      <button
                        className="action-button take-button"
                        type="button"
                        onClick={() => changeAmount(id, 1)}
                        disabled={available === 0}
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
                title="Devuelve una bendición oculta al arcón">
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
              Las bendiciones se obtienen a ciegas. Repetir dados devuelve una
              al arcón; Presencia Divina revela y consume todas las que llevas.
            </p>
          </div>
        </section>

        <footer className="footer-note">
          <span className="footer-rule" />
          <p>Que la fortuna acompañe tu próxima expedición.</p>
          <span className="footer-rule" />
        </footer>
      </div>

      {divineReport && (
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
    </main>
  );
}

export default App;
