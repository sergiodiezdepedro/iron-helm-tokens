# Iron Helm Tokens

Webapp para llevar la cuenta de los tokens de un jugador y de los que quedan en la reserva común de una partida de espada y brujería.

## Funciones

- Consultar en tiempo real cuántos tokens quedan en la reserva y cuántos están en poder del jugador.
- Iniciar una partida introduciendo los valores iniciales de Salud, Monedas, Energía y Ración. Se descuentan de sus pools; el personaje empieza con 0 Veneno y 0 Bendiciones.
- Obtener o gastar tokens normales. Obtenerlos los resta de la reserva; gastarlos los devuelve.
- Robar tokens de Bendición al azar, manteniendo sus reversos ocultos.
- Gastar una Bendición para repetir los dados sin revelar su reverso. La ficha se consume y no vuelve al mazo.
- Activar Presencia Divina para revelar y consumir todas las Bendiciones del jugador, aplicar sus recompensas y mostrar un resumen.
- Terminar la partida si el jugador tiene Veneno y su cantidad iguala o supera sus fichas de Salud; el modal de derrota bloquea el inventario hasta reiniciar.
- Reiniciar la partida, devolviendo todos los tokens a sus reservas, mezclando de nuevo las Bendiciones y volviendo al formulario inicial.
- Cambiar entre los temas Dark y Light desde el encabezado. Dark es el tema inicial.
- Conservar la partida en el almacenamiento local del navegador al recargar la página.
- Recordar la preferencia de tema en el navegador.

## Composición de la reserva

La reserva empieza con 64 tokens normales:

| Tipo           | Cantidad |
| -------------- | -------: |
| Monedas de oro |       12 |
| Salud          |       18 |
| Veneno         |       10 |
| Energía        |       14 |
| Ración         |       10 |

También hay 12 tokens de Bendición. Cada vez que se reinicia la cuenta, se mezcla un mazo con esta composición:

| Reverso                    | Cantidad | Recompensa en Presencia Divina                       |
| -------------------------- | -------: | ---------------------------------------------------- |
| Corazón verde              |        2 | Devuelve al pool todo el Veneno que tenga el jugador |
| Corazón rojo con valor 1   |        3 | Obtiene 1 token de Salud                             |
| Corazón rojo con valor 2   |        3 | Obtiene 2 tokens de Salud                            |
| Energía morada con valor 1 |        4 | Obtiene 1 token de Energía                           |

Las recompensas de Salud están limitadas por el valor inicial de Salud del personaje y por los tokens que quedan en el pool. El personaje nunca puede superar su Salud inicial, aunque haya fichas disponibles. Las recompensas de Energía están limitadas por la cantidad de tokens que queda en su reserva. Un corazón verde elimina todo el Veneno del inventario del jugador. Las Bendiciones consumidas para repetir dados o al resolver Presencia Divina salen del juego y no vuelven al pool.

## Requisitos

- Node.js 20.19 o superior, o Node.js 22.12 o superior.
- npm.

## Desarrollo

Desde la carpeta del proyecto, instala las dependencias y arranca el servidor:

```bash
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173/`. Para acceder desde otro dispositivo de la misma red:

```bash
npm run dev -- --host 0.0.0.0
```

## Comandos

| Comando           | Descripción                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `npm run dev`     | Inicia el servidor de desarrollo con recarga en caliente                       |
| `npm run build`   | Comprueba los tipos de TypeScript y genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión ya compilada                                       |
| `npm run lint`    | Ejecuta Oxlint                                                                 |

Para revisar una compilación de producción:

```bash
npm run build
npm run preview
```

## Cómo está construida

- **React 19** y **TypeScript** para la interfaz y el estado del inventario.
- **Vite 6** para el servidor de desarrollo y la compilación.
- **CSS** propio para el diseño adaptable a escritorio y móvil.
- **Lucide React** para los iconos.
- **`localStorage`** para guardar el inventario, el mazo de Bendición y el tema seleccionado en el navegador actual.

La aplicación no necesita una cuenta, un backend ni una base de datos. El progreso no se sincroniza entre navegadores o dispositivos; borrar los datos del sitio también borra la partida guardada. La lógica y la interfaz principal están en `src/App.tsx`, y sus estilos en `src/App.css` e `src/index.css`.

## English

Iron Helm Tokens is a web app for tracking a player's tokens and the tokens remaining in the shared pool during a sword-and-sorcery game.

### Features

- See how many tokens remain in the pool and how many the player currently has.
- Start a game by entering the character's initial Health, Coins, Energy, and Rations. These tokens are deducted from their pools; the character starts with 0 Poison tokens and 0 Blessing tokens in their inventory.
- Gain or spend regular tokens. Gaining tokens deducts them from the pool; spending them returns them to it.
- Draw random Blessing tokens while keeping their reverse sides hidden.
- Spend a Blessing to reroll the dice without revealing its reverse side. The token is consumed and does not return to the deck.
- Activate Divine Presence to reveal and consume all of the player's Blessings, apply their rewards, and show a summary.
- End the game if the player has at least one Poison token and their Poison count equals or exceeds their Health. The defeat modal blocks the inventory until the game is restarted.
- Restart the game to return all tokens to their pools, reshuffle the Blessing deck, and return to the starting values form.
- Switch between Dark and Light themes from the header. Dark is the default theme.
- Keep the game state and theme preference in the current browser's local storage across page reloads.

### Pool composition

The shared pool starts with 64 regular tokens:

| Token      | Quantity |
| ---------- | -------: |
| Gold coins |       12 |
| Health     |       18 |
| Poison     |       10 |
| Energy     |       14 |
| Rations    |       10 |

There are also 12 Blessing tokens. The deck is shuffled whenever the game is reset:

| Reverse side                  | Quantity | Divine Presence reward                               |
| ----------------------------- | -------: | ---------------------------------------------------- |
| Green heart                   |        2 | Return all of the player's Poison tokens to the pool |
| Red heart, value 1            |        3 | Gain 1 Health token                                  |
| Red heart, value 2            |        3 | Gain 2 Health tokens                                 |
| Purple energy symbol, value 1 |        4 | Gain 1 Energy token                                  |

Health rewards are capped by the character's starting Health and by the tokens remaining in the pool. The character can never exceed their starting Health, even when more Health tokens are available. Energy rewards are capped by the tokens remaining in their pool. A green heart removes all Poison from the player's inventory. Blessings spent to reroll the dice or used during Divine Presence are removed from the game and never return to the pool.

### Requirements

- Node.js 20.19 or later, or Node.js 22.12 or later.
- npm.

### Development

From the project directory, install dependencies and start the development server:

```bash
npm install
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173/`. To access the app from another device on the same network, run:

```bash
npm run dev -- --host 0.0.0.0
```

### Commands

| Command           | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `npm run dev`     | Start the development server with hot reload                      |
| `npm run build`   | Check TypeScript types and create the production build in `dist/` |
| `npm run preview` | Serve the production build locally                                |
| `npm run lint`    | Run Oxlint                                                        |

To preview a production build:

```bash
npm run build
npm run preview
```

### Built with

- **React 19** and **TypeScript** for the interface and inventory state.
- **Vite 6** for the development server and production build.
- **Custom CSS** for responsive desktop and mobile layouts.
- **Lucide React** for icons.
- **`localStorage`** for the inventory, Blessing deck, and selected theme in the current browser.

The app does not require an account, backend, or database. Progress is not synchronized between browsers or devices; clearing site data also deletes the saved game. The main logic and interface are in `src/App.tsx`, with styles in `src/App.css` and `src/index.css`.
