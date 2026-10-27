# QA Scout

[![Português (Brasil)](https://img.shields.io/badge/Portugu%C3%AAs%20%28Brasil%29-296F82?style=for-the-badge)](README.md) [![Português (Portugal)](https://img.shields.io/badge/Portugu%C3%AAs%20%28Portugal%29-296F82?style=for-the-badge)](README.pt-PT.md) [![English](https://img.shields.io/badge/English-296F82?style=for-the-badge)](README.en.md) [![Español](https://img.shields.io/badge/Espa%C3%B1ol-3DF5A7?style=for-the-badge)](README.es.md)

**Explora con una misión. Vuelve con evidencia.**

QA Scout es un compañero para pruebas exploratorias basadas en sesiones (SBTM). Escribes el charter, pones en marcha el cronómetro, anotas lo que encuentras al ritmo de la exploración y, al final, sales con un informe listo para el equipo.

🔗 **Ábrelo:** https://azevedothamirest.github.io/qa-scout/

[![Pruebas](https://github.com/azevedothamirest/qa-scout/actions/workflows/ci.yml/badge.svg?event=pull_request)](https://github.com/azevedothamirest/qa-scout/actions/workflows/ci.yml?query=event%3Apull_request)

> **Beta abierta.** ¿Primera vez? Sigue el [tutorial](docs/tutorial.md) (unos 10 minutos, en portugués). ¿Lo usaste? [Cuéntanos qué tal](https://github.com/azevedothamirest/qa-scout/issues/new/choose): bugs, ideas y críticas son muy bienvenidos.

## Por qué existe

La prueba exploratoria suele ser un trabajo invisible: encuentra los bugs más interesantes, pero deja poco rastro. QA Scout le da estructura sin convertirla en un guion, y transforma la sesión en evidencia que Producto y Desarrollo pueden leer.

## Funcionalidades

- **Charter en el modelo de Elisabeth Hendrickson:** *Explorar ___ con ___ para descubrir ___*, más área, entorno y duración libre, en minutos.
- **Cronómetro con pausa**, barra de progreso y aviso de tiempo extra.
- **Notas por tipo:** bug, duda, idea, riesgo y observación, cada una con el minuto exacto de la sesión.
  - `Alt+1` a `Alt+5` cambian el tipo, `Ctrl+Enter` guarda.
  - Prefijos de comando: `/bug`, `/pregunta`, `/idea`, `/riesgo`, `/obs`.
  - Capturas pegadas con `Ctrl+V` o adjuntas, comprimidas automáticamente.
- **Heurísticas:** 18 cartas con tours inspirados en James Whittaker y casos del día a día (campos con máscara, acentos, moneda, zona horaria).
- **Debriefing:** reparto del tiempo en Test, Bug y Setup (TBS), áreas cubiertas y próximas sesiones.
- **Captura automática** en el navegador de pruebas: clics, campos rellenados y páginas abiertas se convierten en observaciones con captura de pantalla. Confirmas, editas (texto y tipo) o eliminas cada una; solo las revisadas entran en el informe.
- **Errores de consola y de red** se convierten en notas por revisar: errores de JavaScript y fallos de conexión o 5xx llegan como bug; `console.error` y 4xx, como riesgo.
- **Pasos para reproducir** en un clic: al editar una nota, QA Scout arma la lista con los clics, campos y páginas que vinieron antes.
- **`Alt+Shift+M`** en el sistema bajo prueba marca el momento con captura, sin salir de la pantalla. **`Alt+1` a `Alt+5`** hacen lo mismo ya con el tipo (bug, duda, idea, riesgo, observación).
- **Captura activa al iniciar la sesión** en la extensión: la pestaña del sistema bajo prueba ya empieza seguida; otras pestañas entran con **Seguir la pestaña actual**.
- **Informe** en Markdown para pegar en Jira, GitHub, Notion o Slack, **Copiar solo los bugs** para abrir los tickets, y exportación a PDF desde el navegador.
- **Copiar bug** listo para Jira o GitHub: título, entorno, navegador, página, pasos para reproducir, resultado obtenido y esperado, y los errores de consola y red del mismo minuto.
- **Copia de seguridad** de las sesiones en JSON: descarga e importa desde el historial (las sesiones repetidas se ignoran).
- **Tema claro y oscuro**, con botón para alternar.
- **Cuatro idiomas:** portugués de Brasil, portugués de Portugal, inglés y español, en el globo de la cabecera. En la primera visita sigue el idioma del navegador; la elección queda guardada, y la captura automática escribe las notas en el mismo idioma.
- **Historial con búsqueda** por área, charter o contenido de las notas.

## Extensión de Chrome

QA Scout funciona en el panel lateral de Chrome, al lado del sistema bajo prueba:

1. Instálala desde la **[Chrome Web Store](https://chromewebstore.google.com/detail/qa-scout/goffncpkhonlejcokjgiobomlpiefpin)** y haz clic en el icono de QA Scout para abrir el panel.
2. Empieza la sesión y, en la página del sistema bajo prueba, haz clic en **Seguir la pestaña actual**. La primera vez, Chrome pide acceso a los sitios: la captura de la pestaña lo necesita, y nada se pide al instalar. Las pestañas abiertas desde ella entran también.
3. Explora: clics, campos, páginas, errores y fallos de red de esas pestañas se convierten en notas por revisar. Las demás pestañas no se registran.

Por ser una extensión nueva, Chrome con **protección mejorada** puede mostrar "Continúa con precaución" al instalar. Es el aviso estándar para desarrolladores nuevos en la tienda y desaparece con el tiempo; haz clic en **Continuar con la instalación**.

Para probar una versión aún no publicada: ejecuta `npm run pacote`, descomprime el `.zip` de `dist/`, abre `chrome://extensions`, activa el **Modo de desarrollador** y haz clic en **Cargar descomprimida**. El paso a paso de la publicación está en [`docs/chrome-web-store.md`](docs/chrome-web-store.md).

## Navegador de pruebas: un comando y listo

Sin instalar nada en tu Chrome. Con Node instalado:

```bash
npx github:azevedothamirest/qa-scout https://direccion-del-sistema-bajo-prueba
```

O, con el proyecto clonado: `npm install` y después `npm run navegador -- https://direccion-del-sistema-bajo-prueba`.

Abre un navegador de pruebas aparte, con el panel de QA Scout en una ventana a la izquierda y el sistema a la derecha. En él, **todas las pestañas se siguen**: empieza la sesión y explora, los clics se convierten en observaciones con captura (como máximo 1 por segundo, con el punto pulsado marcado). El valor escrito en los campos nunca se lee ni se guarda, y una sesión en pausa no registra nada. Tu Chrome del día a día no se toca. El perfil queda en `~/.qa-scout/perfil` y guarda los inicios de sesión entre una sesión y otra. La primera vez, el comando descarga Chromium solo.

## Explorar con Claude (MCP)

QA Scout tiene un servidor [MCP](https://modelcontextprotocol.io) para que **Claude conduzca la sesión exploratoria contigo**: le das la misión, abre el navegador de pruebas, lee la pantalla, hace clic, rellena, anota lo que encuentra y te devuelve el informe. La captura lo graba todo como lo haría contigo, y la sesión queda en el historial para revisar.

**Se ejecuta en el terminal de tu ordenador**, en Claude Code o Claude Desktop (Node.js 18+). No funciona en claude.ai desde el navegador ni dentro de la extensión, que solo explica el uso en la pestaña **MCP**.

```bash
claude mcp add qa-scout -- npx -y github:azevedothamirest/qa-scout mcp
claude mcp list   # qa-scout conectado
```

Después, pide como en un charter, con dirección y tiempo:

> Usa QA Scout para una sesión exploratoria de 20 minutos en https://staging.mitienda.com: explorar el checkout, con cupones y pago con tarjeta, para descubrir cobros incorrectos. Anota lo que encuentres y muéstrame el informe.

Usa solo entornos y datos de prueba: Claude lee el texto de las páginas que visita, mientras la sesión y las capturas quedan en tu ordenador. Instalación en Claude Desktop, más ejemplos, herramientas, privacidad y solución de problemas: **[guía del MCP](docs/mcp.md)** (en portugués).

## Privacidad

Política completa: [`privacidade.es.html`](privacidade.es.html).

Todo queda guardado en el navegador de quien lo usa: `localStorage` en la versión web y el almacenamiento local de la extensión y del navegador de pruebas. No hay servidor, cuenta ni envío de datos.

## Ejecutar en local

```bash
npm install
npm start          # http://localhost:4173
```

Sin framework y sin build: lo que está en el repositorio es lo que se ejecuta. `npm run pacote` genera el `.zip` para la Chrome Web Store.

## Estructura del proyecto

```
index.html          estructura de la página (sitio, panel de la extensión y navegador de pruebas)
app.css             aspecto: tokens de color, componentes e impresión del informe
app.js              la aplicación, en JavaScript puro
i18n.js, i18n/      idiomas: cambio de idioma y diccionarios (pt-PT, en, es)
_locales/           nombre y descripción de la extensión en cada idioma
privacidade*.html   política de privacidad (GitHub Pages), un archivo por idioma
manifest.json       manifiesto de la extensión de Chrome (Manifest V3)
extensao/           captura automática (service worker, script de contenido, script de la página)
icones/             iconos de la extensión
bin/qa-scout.js     comando que abre el navegador de pruebas
bin/mcp.js          servidor MCP para que Claude conduzca la sesión (qa-scout mcp)
scripts/            utilidades de desarrollo (empaquetar para la tienda)
tests/              pruebas e2e en Playwright y la tienda ficticia que usan
docs/               tutorial, alcance y hoja de ruta, material de la Chrome Web Store
```

¿Quieres contribuir? Consulta la [guía de contribución](CONTRIBUTING.md) (en portugués).

## Pruebas

La suite e2e usa **Playwright** y se ejecuta en cada pull request en GitHub Actions (la regresión), en tres perfiles: escritorio, móvil (Pixel 7) y navegador de pruebas (Chromium real con la captura cargada).

```bash
npx playwright install chromium
npm test
npm run test:report
```

## Próximos pasos

- [ ] Abrir bug en Jira o Azure DevOps directamente desde la nota
- [ ] Resumen de la sesión y sugerencia de escenarios con IA
- [ ] Métricas acumuladas por área
- [ ] Sesiones en pareja

---

Hecho por [Thamires Azevedo](https://azevedothamirest.github.io) · QA Senior · [@qa.thami](https://www.instagram.com/qa.thami/)
