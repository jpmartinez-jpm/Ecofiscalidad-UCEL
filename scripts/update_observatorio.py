"""Relevamiento automático de novedades ecofiscales para el mapa del Observatorio UCEL.

Consulta Google News (RSS), clasifica cada novedad por eje temático, la geolocaliza
y la agrega a data/novedades_mapa.json (sin duplicar URLs ni títulos).
"""
import json
import os
import re
import unicodedata
from datetime import datetime, timezone
from urllib.parse import quote_plus

import feedparser

DATA_FILE = "data/novedades_mapa.json"
MAX_POR_CONSULTA = 5
MAX_ITEMS = 500  # tope para que el archivo no crezca sin límite

SEARCH_QUERIES = [
    "ecofiscalidad OR \"tributación ambiental\" OR \"impuestos verdes\"",
    "ecotasa municipal turismo Argentina",
    "\"impuesto al carbono\" Argentina OR Latinoamérica",
    "tasa de residuos \"pago por generación\" municipio",
    "incentivos fiscales energías renovables Argentina",
]

# Las claves más específicas van primero: se usa la primera que aparezca en el texto.
KNOWN_LOCATIONS = [
    ("bariloche", "San Carlos de Bariloche, Río Negro, Argentina", "Argentina", -41.1335, -71.3103),
    ("iguazu", "Puerto Iguazú, Misiones, Argentina", "Argentina", -25.5991, -54.5735),
    ("misiones", "Posadas, Misiones, Argentina", "Argentina", -27.3671, -55.8961),
    ("rosario", "Rosario, Santa Fe, Argentina (sede UCEL)", "Argentina", -32.9468, -60.6393),
    ("santa fe", "Santa Fe, Argentina", "Argentina", -31.6333, -60.7000),
    ("vaca muerta", "Añelo / Vaca Muerta, Neuquén, Argentina", "Argentina", -38.3544, -68.7885),
    ("neuquen", "Neuquén, Argentina", "Argentina", -38.9516, -68.0591),
    ("mendoza", "Mendoza, Argentina", "Argentina", -32.8895, -68.8458),
    ("cordoba", "Córdoba, Argentina", "Argentina", -31.4201, -64.1888),
    ("ushuaia", "Ushuaia, Tierra del Fuego, Argentina", "Argentina", -54.8019, -68.3030),
    ("mar del plata", "Mar del Plata, Buenos Aires, Argentina", "Argentina", -38.0055, -57.5426),
    ("buenos aires", "Buenos Aires, Argentina", "Argentina", -34.6037, -58.3816),
    ("ciudad de mexico", "Ciudad de México, México", "Latinoamérica", 19.4326, -99.1332),
    ("mexico", "Ciudad de México, México", "Latinoamérica", 19.4326, -99.1332),
    ("bogota", "Bogotá, Colombia", "Latinoamérica", 4.7110, -74.0721),
    ("colombia", "Bogotá, Colombia", "Latinoamérica", 4.7110, -74.0721),
    ("chile", "Santiago, Chile", "Latinoamérica", -33.4489, -70.6693),
    ("uruguay", "Montevideo, Uruguay", "Latinoamérica", -34.9011, -56.1645),
    ("peru", "Lima, Perú", "Latinoamérica", -12.0464, -77.0428),
    ("panama", "Ciudad de Panamá, Panamá", "Latinoamérica", 8.9824, -79.5199),
    ("brasil", "Brasilia, Brasil", "Latinoamérica", -15.7975, -47.8919),
    ("barcelona", "Barcelona, España", "España y UE", 41.3874, 2.1686),
    ("badajoz", "Badajoz, España", "España y UE", 38.8794, -6.9707),
    ("tres cantos", "Tres Cantos, Madrid, España", "España y UE", 40.6009, -3.7080),
    ("valladolid", "Valladolid, España", "España y UE", 41.6523, -4.7245),
    ("valencia", "Valencia, España", "España y UE", 39.4699, -0.3763),
    ("baleares", "Palma, Islas Baleares, España", "España y UE", 39.5696, 2.6502),
    ("madrid", "Madrid, España", "España y UE", 40.4168, -3.7038),
    ("espana", "Madrid, España", "España y UE", 40.4168, -3.7038),
    ("union europea", "Bruselas, Bélgica (UE)", "España y UE", 50.8503, 4.3517),
    ("suecia", "Estocolmo, Suecia", "España y UE", 59.3293, 18.0686),
    ("londres", "Londres, Reino Unido", "Internacional", 51.5072, -0.1276),
    ("ocde", "París, Francia (OCDE)", "Internacional", 48.8566, 2.3522),
    ("san francisco", "San Francisco, EE. UU.", "Internacional", 37.7749, -122.4194),
    ("argentina", "Buenos Aires, Argentina (alcance nacional)", "Argentina", -34.6037, -58.3816),
]
DEFAULT_LOCATION = KNOWN_LOCATIONS[-1]

CATEGORY_RULES = [
    ("Ecotasas y Turismo", ["ecotasa", "turismo", "turista", "estancias turisticas"]),
    ("Tasas Municipales y Residuos", ["residuo", "basura", "pago por generacion", "ley 7/2022", "reciclaje"]),
    ("Impuesto al Carbono y Emisiones", ["carbono", "co2", "emisiones", "combustible"]),
    ("Incentivos y Energías Renovables", ["solar", "renovable", "eolica", "incentivo", "generacion distribuida"]),
    ("Vialidad y Movilidad Urbana", ["congestion", "peaje", "vehiculo", "movilidad"]),
]


def normalize(text):
    """Minúsculas y sin tildes, para comparar palabras de forma robusta."""
    text = unicodedata.normalize("NFKD", text.lower())
    return "".join(c for c in text if not unicodedata.combining(c))


def contains(text, keyword):
    return re.search(r"\b" + re.escape(keyword), text) is not None


def classify_category(text):
    for category, keywords in CATEGORY_RULES:
        if any(contains(text, k) for k in keywords):
            return category
    return "Política Fiscal y Presupuesto"


def detect_location(text):
    for key, name, region, lat, lng in KNOWN_LOCATIONS:
        if contains(text, key):
            return name, region, lat, lng
    _, name, region, lat, lng = DEFAULT_LOCATION
    return name, region, lat, lng


def clean_html(raw_html):
    return re.sub(r"<.*?>", "", raw_html or "").replace("&nbsp;", " ").strip()


def load_existing_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def main():
    items = load_existing_data()
    existing_urls = {item["url"] for item in items}
    existing_titles = {normalize(item["title"]) for item in items}
    next_id = max((item.get("id", 0) for item in items), default=0) + 1
    new_count = 0

    for query in SEARCH_QUERIES:
        rss_url = f"https://news.google.com/rss/search?q={quote_plus(query)}&hl=es-419&gl=AR&ceid=AR:es-419"
        feed = feedparser.parse(rss_url)

        for entry in feed.entries[:MAX_POR_CONSULTA]:
            url = entry.get("link")
            title = entry.get("title", "").strip()
            if not url or not title:
                continue
            if url in existing_urls or normalize(title) in existing_titles:
                continue

            summary = clean_html(entry.get("summary", title))
            text = normalize(f"{title} {summary}")
            name, region, lat, lng = detect_location(text)
            category = classify_category(text)

            try:
                pub_date = datetime(*entry.published_parsed[:3]).strftime("%Y-%m-%d")
            except Exception:
                pub_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

            source = entry.get("source", {})
            source_title = source.get("title") if isinstance(source, dict) else None

            items.insert(0, {
                "id": next_id,
                "title": title,
                "date": pub_date,
                "region": region,
                "locationName": name,
                "lat": lat,
                "lng": lng,
                "category": category,
                "type": "Jurisprudencia y Prensa",
                "source": source_title or "Relevamiento automático (Google News)",
                "summary": summary[:280] + ("..." if len(summary) > 280 else ""),
                "tags": ["Automatizado", category, region],
                "url": url,
            })
            existing_urls.add(url)
            existing_titles.add(normalize(title))
            next_id += 1
            new_count += 1

    items.sort(key=lambda i: i.get("date", ""), reverse=True)
    items = items[:MAX_ITEMS]

    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"Relevamiento finalizado. Se agregaron {new_count} novedades al mapa.")


if __name__ == "__main__":
    main()
