# Iron Helm Tokens

Webapp para llevar la cuenta de los tokens de un jugador y de los que quedan en la reserva común de una partida de espada y brujería.

## Funciones

- Consultar en tiempo real cuántos tokens quedan en la reserva y cuántos están en poder del jugador.
- Obtener o gastar tokens normales. Obtenerlos los resta de la reserva; gastarlos los devuelve.
- Robar tokens de Bendición al azar, manteniendo sus reversos ocultos.
- Gastar una Bendición para repetir los dados sin revelar su reverso. La ficha se consume y no vuelve al mazo.
- Activar Presencia Divina para revelar y consumir todas las Bendiciones del jugador, aplicar sus recompensas y mostrar un resumen.
- Reiniciar la cuenta, devolviendo todos los tokens a sus reservas y mezclando de nuevo las Bendiciones.
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

Las recompensas de Salud y Energía están limitadas por la cantidad de tokens que queda en sus respectivas reservas. Un corazón verde elimina todo el Veneno del inventario del jugador. Las Bendiciones consumidas para repetir dados o al resolver Presencia Divina salen del juego y no vuelven al pool.

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
