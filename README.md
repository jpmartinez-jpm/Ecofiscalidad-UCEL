# Observatorio de Ecofiscalidad · UCEL

Sitio del proyecto de investigación **“Instrumentos ecofiscales”** de la Facultad de Ciencias Jurídicas y Sociales de la Universidad del Centro Educativo Latinoamericano (UCEL, Rosario). Cátedra de Finanzas Públicas y Derecho Tributario.

Releva los instrumentos fiscales con fines ambientales de la Nación, las provincias y los municipios argentinos: tributos, beneficios fiscales, gasto, fondos afectados, presupuesto y mercados. Cada ficha cita su norma y su fuente.

**Sitio publicado:** https://jpmartinez-jpm.github.io/Ecofiscalidad-UCEL/

## Qué hay en el sitio

- **Mapa**: provincias sombreadas según la cantidad de instrumentos y municipios relevados con sus fichas.
- **Catálogo**: búsqueda y filtros por jurisdicción, municipio, nivel, tipo y estado, con descarga en CSV o JSON.
- **Novedades**: noticias sobre ecofiscalidad que un proceso automático reúne cada semana.
- **Doctrina**: buscador de artículos y documentos de referencia.

## Archivos de datos

| Archivo | Qué contiene | Quién lo actualiza |
|---|---|---|
| `relevamiento.json` | El relevamiento verificado: normas, estado, verificación y fuente de cada instrumento, y los municipios con sus coordenadas. Es la única fuente de las fichas del sitio. | El equipo del proyecto |
| `data/novedades_mapa.json` | Novedades geolocalizadas para la capa de noticias del mapa. | El robot semanal (`.github/workflows/actualizar_mapa_ecofiscal.yml` con `scripts/update_observatorio.py`) |

Las fichas marcadas como “a verificar” o con “fuente secundaria” deben cotejarse con el texto oficial antes de citarse.

## Cómo se publica

El código se edita en Google AI Studio y se sube a este repositorio con *Export → Push to GitHub*. Cada cambio en `main` dispara el flujo `.github/workflows/publicar_sitio.yml`, que arma el sitio y lo publica en GitHub Pages. También se vuelve a publicar cuando termina el robot semanal de novedades.

**Atención al subir desde AI Studio:** el robot guarda las novedades directamente en GitHub, así que la copia de `data/novedades_mapa.json` que hay en AI Studio queda atrás. Antes de hacer *Push*, revisá la lista de archivos a subir: si aparece `data/novedades_mapa.json`, el Push volvería a la versión anterior de las novedades (se recupera con la siguiente corrida del robot, o volviendo atrás ese archivo en GitHub).

## Para trabajar en una computadora

Requiere [Bun](https://bun.sh).

```bash
bun install
bun run dev      # sitio de prueba en http://localhost:3000
bun run build    # versión final en la carpeta dist/
```

## Contacto

Secretaría de Investigación y Desarrollo de la UCEL: seciyp@ucel.edu.ar
