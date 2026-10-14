import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  Globe,
  Search,
  RotateCcw,
  Navigation,
  ExternalLink,
  RefreshCw,
  GitBranch,
  Layers,
  Mountain,
  Map as MapIcon,
  FileText,
  ChevronRight,
  Building2,
  Landmark,
  CheckCircle,
} from 'lucide-react';
import { Province, Locality, Instrumento } from '../types/ecofiscal';
import bundledNovedadesData from '../data/novedades_mapa.json';
import argentinaGeoData from '../data/argentinaProvincias.json';
import {
  ESTADO_STYLE,
  META,
  TIPOS,
  TIPO_COLOR,
  TIPO_LABEL,
  escHtml,
  fmtFecha,
  instrumentoLocalityId,
  necesitaCotejo,
  nombreProvinciaDesdeIgn,
  urlSegura,
} from '../data/relevamiento';

export interface NovedadMapaItem {
  id: number;
  title: string;
  date: string;
  region: string;
  locationName: string;
  lat: number;
  lng: number;
  category: string;
  type: string;
  source: string;
  summary: string;
  tags?: string[];
  url: string;
}

interface UnifiedEcofiscalMapProps {
  provinces: Province[];
  norms: Instrumento[];
  selectedProvinceId: string;
  selectedLocalityId: string;
  onSelectProvince: (provinceId: string) => void;
  onSelectLocality: (localityId: string, provinceId: string) => void;
  onViewNormDetails: (norm: Instrumento) => void;
  onApplyFilterToSearch: (provinceId: string, localityId?: string) => void;
}

type MapTileStyle = 'argenmap' | 'gris' | 'topo';
type LayerMode = 'all' | 'municipios' | 'provincias' | 'novedades';

const GITHUB_REPO_URL = 'https://github.com/jpmartinez-jpm/Ecofiscalidad-UCEL';
const GITHUB_RAW_DATA_URL = 'https://raw.githubusercontent.com/jpmartinez-jpm/Ecofiscalidad-UCEL/main/data/novedades_mapa.json';

const CATEGORIES: Record<string, { hex: string }> = {
  'Ecotasas y Turismo': { hex: '#d97706' },
  'Tasas Municipales y Residuos': { hex: '#059669' },
  'Impuesto al Carbono y Emisiones': { hex: '#0d9488' },
  'Incentivos y Energías Renovables': { hex: '#0284c7' },
  'Vialidad y Movilidad Urbana': { hex: '#4f46e5' },
  'Política Fiscal y Presupuesto': { hex: '#7c3aed' },
};
const DEFAULT_CATEGORY_COLOR = { hex: '#64748b' };

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const fmtDate = (d?: string): string => {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length === 3) {
    const m = parseInt(parts[1], 10);
    if (m >= 1 && m <= 12) return `${parts[2]} ${MONTHS[m - 1]} ${parts[0]}`;
  }
  return d;
};

const normalizeName = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

function spreadCoords(items: NovedadMapaItem[]): [number, number][] {
  const seen: Record<string, number> = {};
  return items.map((it) => {
    const key = `${it.lat.toFixed(4)},${it.lng.toFixed(4)}`;
    const n = (seen[key] = (seen[key] || 0) + 1);
    if (n === 1) return [it.lat, it.lng];
    const angle = n * 2.4;
    const r = 0.15 * Math.sqrt(n);
    return [it.lat + r * Math.sin(angle), it.lng + r * Math.cos(angle)];
  });
}

/** Cantidad de fichas por tipo, en el orden de las familias del proyecto. */
const resumenTipos = (items: Instrumento[]) =>
  TIPOS.map((t) => [t, items.filter((x) => x.tipo === t).length] as const).filter(([, n]) => n > 0);

export const UnifiedEcofiscalMap: React.FC<UnifiedEcofiscalMapProps> = ({
  provinces,
  norms,
  selectedProvinceId,
  selectedLocalityId,
  onSelectProvince,
  onSelectLocality,
  onViewNormDetails,
  onApplyFilterToSearch,
}) => {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const localityPinsGroupRef = useRef<L.LayerGroup | null>(null);
  const markersDictionaryRef = useRef<Record<number, L.CircleMarker>>({});
  const localityMarkersRef = useRef<Record<string, L.Marker>>({});

  const [tileStyle, setTileStyle] = useState<MapTileStyle>('argenmap');
  const [layerMode, setLayerMode] = useState<LayerMode>('all');
  // Con zoom de país los pines se muestran como puntos con el número; los nombres aparecen al acercarse.
  const [zoom, setZoom] = useState(4.5);
  const [activeTab, setActiveTab] = useState<'municipios' | 'novedades' | 'provincias'>('municipios');

  // Novedades: base empaquetada + sincronización con el JSON que actualiza el robot de GitHub.
  const [allData, setAllData] = useState<NovedadMapaItem[]>(bundledNovedadesData as NovedadMapaItem[]);
  const [searchInput, setSearchInput] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string>('Novedades sincronizadas con GitHub');

  const activeProvince = useMemo(
    () => provinces.find((p) => p.id === selectedProvinceId) || provinces.find((p) => p.id === 'santa-fe') || provinces[0],
    [provinces, selectedProvinceId]
  );

  const activeLocality = useMemo(() => {
    if (!selectedLocalityId || selectedLocalityId === 'all') return null;
    return activeProvince.localities.find((l) => l.id === selectedLocalityId) || null;
  }, [activeProvince, selectedLocalityId]);

  const allLocalities = useMemo(() => provinces.flatMap((p) => p.localities), [provinces]);

  const normsByLocality = useMemo(() => {
    const m: Record<string, Instrumento[]> = {};
    norms.forEach((x) => {
      const id = instrumentoLocalityId(x);
      if (id) (m[id] = m[id] || []).push(x);
    });
    return m;
  }, [norms]);

  const provincialNorms = useMemo(
    () => norms.filter((x) => x.jurisdiccion === activeProvince.name && x.nivel !== 'municipal'),
    [norms, activeProvince.name]
  );

  const localityNorms = activeLocality ? normsByLocality[activeLocality.id] || [] : [];

  const maxPorProvincia = useMemo(
    () => Math.max(1, ...provinces.map((p) => p.provincialCount + p.municipalCount)),
    [provinces]
  );

  // Referencias para los botones de los popups (HTML de Leaflet)
  const normsRef = useRef(norms);
  normsRef.current = norms;
  const onViewNormDetailsRef = useRef(onViewNormDetails);
  onViewNormDetailsRef.current = onViewNormDetails;

  const handleExploreMunicipality = (localityId: string, provinceId: string) => {
    onSelectProvince(provinceId);
    onSelectLocality(localityId, provinceId);
    setActiveTab('municipios');
    leafletMapRef.current?.closePopup();
    setTimeout(() => {
      document.getElementById('seccion-monitoreo-municipal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };
  const exploreRef = useRef(handleExploreMunicipality);
  exploreRef.current = handleExploreMunicipality;

  const syncWithGithub = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(GITHUB_RAW_DATA_URL, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          setAllData(json);
          setLastSyncMessage(`Novedades sincronizadas con GitHub (${json.length})`);
          return;
        }
      }
      const localRes = await fetch('./data/novedades_mapa.json');
      if (localRes.ok) {
        const localJson = await localRes.json();
        if (Array.isArray(localJson) && localJson.length > 0) {
          setAllData(localJson);
          setLastSyncMessage(`Novedades del repositorio (${localJson.length})`);
        }
      }
    } catch {
      setLastSyncMessage(`Novedades cargadas (${bundledNovedadesData.length})`);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncWithGithub();
  }, []);

  // Mapas base del Instituto Geográfico Nacional (Argenmap): oficiales, gratuitos y sin clave.
  // Los servidores de OpenStreetMap bloquean parte de las teselas a sitios como este y CARTO pide clave.
  const IGN_TMS = 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/';
  const IGN_ATRIBUCION =
    '<a href="https://www.ign.gob.ar/AreaServicios/Argenmap/Introduccion" target="_blank" rel="noopener noreferrer">Argenmap · Instituto Geográfico Nacional</a> + &copy; OpenStreetMap';

  const getTileUrl = (style: MapTileStyle) => {
    switch (style) {
      case 'topo':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      case 'gris':
        return `${IGN_TMS}mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png`;
      case 'argenmap':
      default:
        return `${IGN_TMS}capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png`;
    }
  };

  const getTileAttribution = (style: MapTileStyle) =>
    style === 'topo' ? 'Relieve &copy; Esri · Límites IGN' : IGN_ATRIBUCION;

  const findMatchingProvince = (ignName: string): Province | undefined => {
    const n = normalizeName(nombreProvinciaDesdeIgn(ignName));
    return provinces.find((p) => normalizeName(p.name) === n);
  };

  // Inicializar el mapa
  useEffect(() => {
    if (!mapElementRef.current || leafletMapRef.current) return;

    const map = L.map(mapElementRef.current, {
      center: [-37.5, -64.0],
      zoom: 4.5,
      minZoom: 2,
      maxZoom: 16,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    const baseTile = L.tileLayer(getTileUrl(tileStyle), {
      attribution: getTileAttribution(tileStyle),
      maxZoom: 18,
    }).addTo(map);

    // Delegación de eventos dentro de los popups
    map.on('popupopen', (e) => {
      const container = e.popup.getElement();
      if (!container) return;
      container.querySelectorAll<HTMLElement>('.js-explore-municipality').forEach((btn) => {
        btn.onclick = (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          const locId = btn.getAttribute('data-locality-id');
          const provId = btn.getAttribute('data-province-id');
          if (locId && provId) exploreRef.current(locId, provId);
        };
      });
      container.querySelectorAll<HTMLElement>('.js-view-norm-detail').forEach((btn) => {
        btn.onclick = (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          const id = btn.getAttribute('data-norm-id');
          const found = id ? normsRef.current.find((n) => n.id === id) : undefined;
          if (found) onViewNormDetailsRef.current(found);
        };
      });
    });

    map.on('zoomend', () => setZoom(map.getZoom()));

    tileLayerRef.current = baseTile;
    markersGroupRef.current = L.layerGroup().addTo(map);
    localityPinsGroupRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!tileLayerRef.current) return;
    const capa = tileLayerRef.current;
    const anterior = capa.getAttribution?.();
    const nueva = getTileAttribution(tileStyle);
    const ctl = leafletMapRef.current?.attributionControl as L.Control.Attribution | undefined;
    if (ctl && anterior !== nueva) {
      if (anterior) ctl.removeAttribution(anterior);
      ctl.addAttribution(nueva);
      capa.options.attribution = nueva;
    }
    capa.setUrl(getTileUrl(tileStyle));
  }, [tileStyle]);

  // Polígonos provinciales del IGN, sombreados según la cantidad de fichas relevadas
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }
    if (layerMode === 'novedades') return;

    const geoJsonLayer = L.geoJSON(argentinaGeoData as any, {
      style: (feature) => {
        const matched = findMatchingProvince(feature?.properties?.nombre || '');
        if (matched && matched.id === activeProvince.id) {
          return { color: '#064e3b', weight: 2.8, opacity: 1, fillColor: '#059669', fillOpacity: 0.38 };
        }
        if (matched) {
          const total = matched.provincialCount + matched.municipalCount;
          return { color: '#047857', weight: 1.2, opacity: 0.8, fillColor: '#0d9488', fillOpacity: 0.06 + 0.3 * (total / maxPorProvincia) };
        }
        return { color: '#64748b', weight: 0.8, opacity: 0.5, fillColor: '#94a3b8', fillOpacity: 0.08 };
      },
      onEachFeature: (feature, layer) => {
        const matched = findMatchingProvince(feature?.properties?.nombre || '');
        if (!matched) return;

        layer.on('click', () => {
          onSelectProvince(matched.id);
          onSelectLocality('all', matched.id);
          if ('getBounds' in layer) {
            map.flyToBounds((layer as L.Polygon).getBounds(), { padding: [30, 30], maxZoom: 7, duration: 1.0 });
          }
        });

        layer.bindTooltip(
          `<div class="text-xs font-sans p-1">
            <div class="font-bold text-slate-900">${escHtml(matched.name)}</div>
            <div class="text-emerald-800 font-semibold">${matched.provincialCount} instrumentos provinciales</div>
            <div class="text-[11px] text-slate-500">${matched.municipalCount} municipales en ${matched.localities.length} municipios relevados</div>
            <div class="text-[10px] text-emerald-800 font-semibold mt-0.5">Click para ver sus normas</div>
          </div>`,
          { sticky: true, opacity: 0.95 }
        );

        layer.on('mouseover', () => {
          if ('setStyle' in layer && matched.id !== activeProvince.id) (layer as L.Polygon).setStyle({ weight: 2 });
        });
        layer.on('mouseout', () => {
          if ('setStyle' in layer && matched.id !== activeProvince.id) (layer as L.Polygon).setStyle({ weight: 1.2 });
        });
      },
    });

    geoJsonLayer.addTo(map);
    geoJsonLayerRef.current = geoJsonLayer;
  }, [provinces, activeProvince.id, layerMode, maxPorProvincia]);

  // Novedades filtradas
  const filteredNovedades = useMemo(() => {
    const q = normalizeName(searchInput);
    return allData
      .filter((item) => {
        const hay = normalizeName([item.title, item.summary, item.source, item.locationName, ...(item.tags || [])].join(' '));
        return (!q || hay.includes(q)) && (filterCategory === 'ALL' || item.category === filterCategory);
      })
      .sort((a, b) => {
        if (sortOrder === 'title') return a.title.localeCompare(b.title);
        if (sortOrder === 'oldest') return a.date.localeCompare(b.date);
        return b.date.localeCompare(a.date);
      });
  }, [allData, searchInput, filterCategory, sortOrder]);

  // Municipios que coinciden con la búsqueda (por nombre, provincia o contenido de sus fichas)
  const filteredMunicipalities = useMemo(() => {
    const q = normalizeName(searchInput);
    if (!q) return [] as Locality[];
    return allLocalities.filter((loc) => {
      const fichas = normsByLocality[loc.id] || [];
      const hay = normalizeName(
        [loc.name, loc.provinceName, ...fichas.map((x) => `${x.norma} ${x.titulo} ${x.descripcion}`)].join(' ')
      );
      return hay.includes(q);
    });
  }, [allLocalities, normsByLocality, searchInput]);

  // Marcadores de novedades
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    if (!leafletMapRef.current || !markersGroup) return;

    markersGroup.clearLayers();
    markersDictionaryRef.current = {};
    if (layerMode === 'provincias' || layerMode === 'municipios') return;

    const dispersed = spreadCoords(filteredNovedades);
    filteredNovedades.forEach((item, index) => {
      const color = (CATEGORIES[item.category] || DEFAULT_CATEGORY_COLOR).hex;
      const url = urlSegura(item.url);
      const marker = L.circleMarker(dispersed[index], {
        radius: 7,
        color: '#ffffff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      }).bindPopup(`
        <div style="max-width: 270px; font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.45;">
          <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">📍 ${escHtml(item.locationName)} · ${fmtDate(item.date)}</div>
          <strong style="display: block; margin: 4px 0 6px; font-size: 13px; color: #0f172a; line-height: 1.3;">${escHtml(item.title)}</strong>
          <div style="font-size: 11px; color: ${color}; font-weight: 700; margin-bottom: 6px;">${escHtml(item.category)}</div>
          <p style="font-size: 11px; color: #475569; margin: 0 0 8px;">${escHtml(item.summary)}</p>
          ${url ? `<a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 700; text-decoration: none; font-size: 11px;">Ver fuente original →</a>` : ''}
        </div>
      `);
      markersGroup.addLayer(marker);
      markersDictionaryRef.current[item.id] = marker;
    });
  }, [filteredNovedades, layerMode]);

  // Pines de los municipios relevados
  useEffect(() => {
    const localityPins = localityPinsGroupRef.current;
    if (!leafletMapRef.current || !localityPins) return;

    localityPins.clearLayers();
    localityMarkersRef.current = {};
    if (layerMode === 'novedades' || layerMode === 'provincias') return;

    allLocalities.forEach((locality) => {
      const isSelected = locality.id === selectedLocalityId;
      const isProvinceActive = locality.provinceId === activeProvince.id;
      const fichas = normsByLocality[locality.id] || [];

      const conNombre = zoom >= 7 || isSelected;
      const fondo = isSelected ? '#064e3b' : isProvinceActive ? '#0f172a' : '#1e293b';
      const pinIcon = conNombre
        ? L.divIcon({
            className: 'custom-loc-pin',
            html: `
          <div style="display:inline-flex;align-items:center;gap:5px;background:${fondo};color:white;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;border:2px solid ${isSelected ? '#34d399' : '#ffffff'};box-shadow:0 3px 8px rgba(0,0,0,0.35);white-space:nowrap;cursor:pointer;transform:translate(-50%,-50%);position:absolute;left:0;top:0;">
            <span style="background:#059669;color:white;padding:1px 6px;border-radius:999px;font-size:9px;font-weight:800;">${fichas.length}</span>
            <span>${escHtml(locality.name)}</span>
          </div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          })
        : L.divIcon({
            className: 'custom-loc-pin',
            html: `<div style="width:20px;height:20px;border-radius:50%;background:${fondo};border:2px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);color:white;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;cursor:pointer;">${fichas.length}</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

      const porTipo = resumenTipos(fichas)
        .map(
          ([t, n]) =>
            `<span style="display:inline-flex;align-items:center;gap:3px;margin:0 6px 3px 0;font-size:10px;color:#334155;"><span style="width:7px;height:7px;border-radius:50%;background:${TIPO_COLOR[t]};display:inline-block;"></span>${escHtml(TIPO_LABEL[t])} ${n}</span>`
        )
        .join('');

      const lista = fichas
        .map((x) => {
          const fuente = urlSegura(x.fuente);
          return `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px;margin-top:6px;">
            <div style="font-family:monospace;font-size:10px;font-weight:700;color:#064e3b;margin-bottom:3px;">${escHtml(x.norma)}</div>
            <div style="font-size:11px;font-weight:700;color:#0f172a;line-height:1.25;margin-bottom:3px;">${escHtml(x.titulo)}</div>
            <div style="font-size:10px;color:#475569;margin-bottom:6px;">${escHtml(TIPO_LABEL[x.tipo] || x.tipo)} · <strong>${escHtml(x.estado)}</strong>${necesitaCotejo(x) ? ' · <span style="color:#b45309;">a cotejar</span>' : ''}</div>
            <div style="display:flex;gap:8px;align-items:center;">
              <button type="button" class="js-view-norm-detail" data-norm-id="${escHtml(x.id)}" style="background:#059669;color:white;border:none;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer;">Ver ficha</button>
              ${fuente ? `<a href="${escHtml(fuente)}" target="_blank" rel="noopener noreferrer" style="font-size:10px;color:#0284c7;font-weight:600;text-decoration:none;">Fuente ↗</a>` : ''}
            </div>
          </div>`;
        })
        .join('');

      const popupHtml = `
        <div style="width:290px;max-width:320px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;color:#1e293b;">
          <div style="border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:8px;">
            <span style="font-size:10px;font-weight:800;text-transform:uppercase;color:#059669;letter-spacing:0.5px;">Municipio relevado</span>
            <h3 style="margin:2px 0 0;font-size:15px;font-weight:800;color:#0f172a;">${escHtml(locality.name)}</h3>
            <div style="font-size:11px;color:#64748b;">${escHtml(locality.provinceName)} · ${fichas.length} ${fichas.length === 1 ? 'instrumento' : 'instrumentos'}</div>
          </div>
          <div style="margin-bottom:6px;">${porTipo}</div>
          <div style="max-height:200px;overflow-y:auto;padding-right:2px;margin-bottom:8px;">${lista}</div>
          <div style="border-top:1px solid #e2e8f0;padding-top:6px;">
            <button type="button" class="js-explore-municipality" data-locality-id="${escHtml(locality.id)}" data-province-id="${escHtml(locality.provinceId)}"
              style="background:#064e3b;color:white;border:none;border-radius:8px;padding:7px 12px;font-size:11px;font-weight:800;cursor:pointer;width:100%;text-align:center;">
              Ver todas las fichas de ${escHtml(locality.name)} →
            </button>
          </div>
        </div>`;

      const marker = L.marker([locality.coordinates.lat, locality.coordinates.lng], {
        icon: pinIcon,
        zIndexOffset: isSelected ? 1000 : 200,
      }).bindPopup(popupHtml, { maxWidth: 340, className: 'custom-municipality-popup' });

      marker.bindTooltip(
        `<div class="text-xs p-1"><strong class="text-slate-900">${escHtml(locality.name)}</strong> (${escHtml(locality.provinceName)})<br/><span class="text-slate-500 text-[10px]">${fichas.length} instrumento(s) municipal(es) relevado(s)</span></div>`,
        { sticky: true }
      );

      marker.on('click', () => {
        onSelectProvince(locality.provinceId);
        onSelectLocality(locality.id, locality.provinceId);
        setActiveTab('municipios');
      });

      localityPins.addLayer(marker);
      localityMarkersRef.current[locality.id] = marker;
    });
  }, [allLocalities, normsByLocality, selectedLocalityId, activeProvince.id, layerMode, zoom >= 7]);

  const focusRegion = (regionCode: 'ARG' | 'LATAM' | 'EU' | 'WORLD') => {
    const map = leafletMapRef.current;
    if (!map) return;
    if (regionCode === 'ARG') map.flyTo([-38.5, -64.0], 4.5, { duration: 1.2 });
    if (regionCode === 'LATAM') map.flyTo([-12.0, -68.0], 3, { duration: 1.2 });
    if (regionCode === 'EU') map.flyTo([43.0, 2.0], 4, { duration: 1.2 });
    if (regionCode === 'WORLD') map.flyTo([15.0, -30.0], 2, { duration: 1.2 });
  };

  const flyToNovedad = (id: number) => {
    const item = allData.find((d) => d.id === id);
    const map = leafletMapRef.current;
    if (!item || !map) return;
    if (layerMode === 'provincias' || layerMode === 'municipios') setLayerMode('all');
    mapElementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    map.flyTo([item.lat, item.lng], 8.5, { duration: 1.2 });
    setTimeout(() => markersDictionaryRef.current[id]?.openPopup(), 1300);
  };

  const flyToMunicipality = (localityId: string, provinceId: string) => {
    const loc = allLocalities.find((l) => l.id === localityId);
    const map = leafletMapRef.current;
    if (!loc || !map) return;
    if (layerMode === 'novedades' || layerMode === 'provincias') setLayerMode('all');
    onSelectProvince(provinceId);
    onSelectLocality(localityId, provinceId);
    mapElementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    map.flyTo([loc.coordinates.lat, loc.coordinates.lng], 10, { duration: 1.2 });
    setTimeout(() => localityMarkersRef.current[localityId]?.openPopup(), 1300);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilterCategory('ALL');
    setSortOrder('newest');
    onSelectProvince('santa-fe');
    onSelectLocality('all', 'santa-fe');
    focusRegion('ARG');
  };

  const latestDate = useMemo(() => allData.map((d) => d.date).filter(Boolean).sort().pop(), [allData]);
  const totalMunicipales = useMemo(() => norms.filter((n) => n.nivel === 'municipal').length, [norms]);

  const tarjetaFicha = (x: Instrumento, oscuro = false) => {
    const fuente = urlSegura(x.fuente);
    return (
      <div
        key={x.id}
        className={
          oscuro
            ? 'bg-slate-800/90 rounded-lg p-2.5 border border-slate-700/80'
            : 'bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition'
        }
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded text-white" style={{ backgroundColor: TIPO_COLOR[x.tipo] || '#64748b' }}>
              {TIPO_LABEL[x.tipo] || x.tipo}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${ESTADO_STYLE[x.estado] || ESTADO_STYLE['a verificar']}`}>
              {x.estado}
            </span>
          </div>
          <div className={`font-mono text-[10px] font-semibold mb-1 ${oscuro ? 'text-emerald-400' : 'text-emerald-800'}`}>{x.norma}</div>
          <h5 className={`${oscuro ? 'text-xs text-slate-100' : 'text-base text-slate-900'} font-bold mb-1.5 leading-snug`}>{x.titulo}</h5>
          {!oscuro && <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-3">{x.descripcion}</p>}
        </div>
        <div className={`pt-2 border-t ${oscuro ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-between text-xs`}>
          <button
            type="button"
            onClick={() => onViewNormDetails(x)}
            className={`inline-flex items-center gap-1 font-bold ${oscuro ? 'text-emerald-400 hover:text-emerald-300' : 'px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg'}`}
          >
            <FileText className="w-3.5 h-3.5" /> Ver ficha
          </button>
          {fuente && (
            <a
              href={fuente}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold inline-flex items-center gap-1 ${oscuro ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-emerald-700'}`}
            >
              Fuente <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    );
  };

  const chipsTipos = (items: Instrumento[]) => (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px]">
      {resumenTipos(items).map(([t, n]) => (
        <span key={t} className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TIPO_COLOR[t] }} />
          {TIPO_LABEL[t]} <strong className="font-mono">{n}</strong>
        </span>
      ))}
    </div>
  );

  const capaBtn = (modo: LayerMode, tab: 'municipios' | 'novedades' | 'provincias', etiqueta: React.ReactNode) => (
    <button
      type="button"
      onClick={() => {
        setLayerMode(modo);
        setActiveTab(tab);
      }}
      className={`px-2.5 py-1 rounded transition font-medium flex items-center gap-1 ${
        layerMode === modo ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {etiqueta}
    </button>
  );

  return (
    <section id="mapa-ecofiscal" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-200 scroll-mt-16">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            <Globe className="w-3.5 h-3.5 text-emerald-700" /> Observatorio de Ecofiscalidad · UCEL
          </span>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full transition shadow-2xs"
            title="Repositorio en GitHub"
          >
            <GitBranch className="w-3 h-3 text-slate-500" />
            <span>Código y datos en GitHub</span>
          </a>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">Mapa del relevamiento ecofiscal</h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed text-pretty">
          Las provincias se sombrean según la cantidad de instrumentos relevados. Cada pin es un municipio con fichas propias; los puntos de color
          son novedades de prensa y doctrina geolocalizadas.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>{lastSyncMessage}</span>
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-emerald-700">
            {allLocalities.length} municipios · {totalMunicipales} instrumentos municipales · relevamiento al {fmtFecha(META.actualizado)}
          </span>
          <button
            type="button"
            onClick={syncWithGithub}
            disabled={isSyncing}
            className="inline-flex items-center gap-1 ml-2 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
            title="Volver a leer las novedades desde GitHub"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Actualizando…' : 'Actualizar novedades'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Capas:
            </span>
            {capaBtn('all', 'municipios', 'Todas')}
            {capaBtn('municipios', 'municipios', <><Landmark className="w-3 h-3 text-emerald-300" /> Municipios ({allLocalities.length})</>)}
            {capaBtn('provincias', 'provincias', 'Provincias')}
            {capaBtn('novedades', 'novedades', `Novedades (${allData.length})`)}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1 hidden md:inline">Enfocar:</span>
            <button type="button" onClick={() => focusRegion('ARG')} className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 transition">Argentina</button>
            <button type="button" onClick={() => focusRegion('LATAM')} className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 transition">Latinoamérica</button>
            <button type="button" onClick={() => focusRegion('EU')} className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 transition">España y UE</button>
            <button type="button" onClick={() => focusRegion('WORLD')} className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 transition">Global</button>
            <div className="ml-2 pl-2 border-l border-slate-700 flex items-center gap-1">
              {(
                [
                  ['argenmap', <Globe key="g" className="w-3.5 h-3.5" />, 'Argenmap (IGN)'],
                  ['topo', <Mountain key="m" className="w-3.5 h-3.5" />, 'Relieve (Esri)'],
                  ['gris', <MapIcon key="l" className="w-3.5 h-3.5" />, 'Mapa gris (IGN)'],
                ] as [MapTileStyle, React.ReactNode, string][]
              ).map(([estilo, icono, titulo]) => (
                <button
                  key={estilo}
                  type="button"
                  onClick={() => setTileStyle(estilo)}
                  className={`p-1.5 rounded transition ${tileStyle === estilo ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  title={titulo}
                  aria-label={titulo}
                >
                  {icono}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div ref={mapElementRef} id="ecofiscalMap" className="w-full relative z-0" style={{ height: '520px' }} />

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-slate-700">Referencias:</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-800">
              <span className="w-4 h-4 rounded-full bg-slate-900 border-2 border-white text-[9px] text-white font-bold inline-flex items-center justify-center">n</span>
              <span>Municipio con n fichas (acercá el mapa para ver los nombres)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-600/40 inline-block border border-emerald-700"></span>
              <span>Provincia: más oscuro, más instrumentos</span>
            </span>
            {Object.entries(CATEGORIES)
              .slice(0, 4)
              .map(([cat, cfg]) => (
                <span key={cat} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cfg.hex }}></span>
                  {cat}
                </span>
              ))}
          </div>
          <span className="text-slate-500 font-medium">
            Selección: <strong className="text-slate-900">{activeProvince.name}</strong>
            {activeLocality ? ` · ${activeLocality.name}` : ''}
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar municipio, norma o tema (ej. Rosario, ecotasa, residuos)…"
              aria-label="Buscar en el mapa"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              value={activeProvince.id}
              aria-label="Provincia"
              onChange={(e) => {
                const pId = e.target.value;
                onSelectProvince(pId);
                onSelectLocality('all', pId);
                const prov = provinces.find((p) => p.id === pId);
                if (prov && leafletMapRef.current) {
                  leafletMapRef.current.flyTo([prov.centerCoordinates.lat, prov.centerCoordinates.lng], 6, { duration: 1.0 });
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl p-2 font-medium"
            >
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name} ({prov.provincialCount + prov.municipalCount})
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={activeLocality ? activeLocality.id : 'all'}
              aria-label="Municipio"
              onChange={(e) => {
                const locId = e.target.value;
                onSelectLocality(locId, activeProvince.id);
                setActiveTab('municipios');
                if (locId !== 'all') flyToMunicipality(locId, activeProvince.id);
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl p-2 font-semibold"
              disabled={activeProvince.localities.length === 0}
            >
              <option value="all">
                {activeProvince.localities.length ? `Todos los municipios (${activeProvince.localities.length})` : 'Sin municipios relevados'}
              </option>
              {activeProvince.localities.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.instrumentCount})
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={filterCategory}
              aria-label="Eje de las novedades"
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-xl p-2"
            >
              <option value="ALL">Novedades: todos los ejes</option>
              {Object.keys(CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <select
              value={sortOrder}
              aria-label="Orden de las novedades"
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'title')}
              className="w-full bg-slate-50 border border-slate-300 text-slate-700 rounded-xl p-2 text-xs"
            >
              <option value="newest">Más nuevas</option>
              <option value="oldest">Más antiguas</option>
              <option value="title">A–Z</option>
            </select>
          </div>

          <div className="lg:col-span-1 flex items-center">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1"
              title="Restablecer filtros y vista"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Municipios que coinciden con la búsqueda */}
      {filteredMunicipalities.length > 0 && (
        <div className="mb-8 p-6 bg-emerald-950 text-white rounded-2xl shadow-md border border-emerald-800">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              {filteredMunicipalities.length} {filteredMunicipalities.length === 1 ? 'municipio coincide' : 'municipios coinciden'} con “{searchInput}”
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMunicipalities.map((loc) => {
              const fichas = normsByLocality[loc.id] || [];
              return (
                <div key={loc.id} className="bg-slate-900 border border-emerald-900/80 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500 transition shadow-xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300">{loc.provinceName}</span>
                      <span className="text-[11px] font-mono text-slate-300">{fichas.length} fichas</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">{loc.name}</h4>
                    <div className="space-y-2">{fichas.slice(0, 3).map((x) => tarjetaFicha(x, true))}</div>
                    {fichas.length > 3 && <div className="text-[11px] text-slate-400 mt-2">y {fichas.length - 3} más</div>}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => flyToMunicipality(loc.id, loc.provinceId)}
                      className="font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Ubicar en el mapa
                    </button>
                    <button type="button" onClick={() => onApplyFilterToSearch(loc.provinceId, loc.id)} className="text-slate-400 hover:text-white font-medium">
                      Ver en el catálogo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pestañas */}
      <div className="flex items-center justify-between border-b border-slate-200 mb-6">
        <div className="flex items-center gap-4 flex-wrap" role="tablist">
          {(
            [
              ['municipios', <Landmark key="i" className="w-4 h-4 text-emerald-600" />, 'Municipios relevados', `${allLocalities.length}`],
              ['provincias', <Building2 key="i" className="w-4 h-4 text-emerald-600" />, `Normas de ${activeProvince.name}`, `${provincialNorms.length}`],
              ['novedades', <Globe key="i" className="w-4 h-4 text-emerald-600" />, 'Novedades', `${filteredNovedades.length}`],
            ] as ['municipios' | 'provincias' | 'novedades', React.ReactNode, string, string][]
          ).map(([tab, icono, texto, n]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === tab ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {icono}
              <span>{texto}</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-semibold">{n}</span>
            </button>
          ))}
        </div>
        {activeTab === 'novedades' && latestDate && (
          <span className="hidden sm:inline font-mono text-xs text-slate-500">
            Última novedad: <strong className="text-slate-700">{fmtDate(latestDate)}</strong>
          </span>
        )}
      </div>

      {/* Municipios */}
      {activeTab === 'municipios' && (
        <div id="seccion-monitoreo-municipal" className="space-y-6 scroll-mt-24">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono text-emerald-400 tracking-wider">
                {activeLocality ? 'Municipio seleccionado' : 'Provincia seleccionada'}
              </span>
              <h3 className="text-2xl font-bold text-white">
                {activeLocality ? activeLocality.name : activeProvince.name}
                {activeLocality && <span className="text-sm font-normal text-slate-400"> ({activeProvince.name})</span>}
              </h3>
              <div className="text-slate-300">{chipsTipos(activeLocality ? localityNorms : norms.filter((x) => x.jurisdiccion === activeProvince.name))}</div>
            </div>
            <div className="flex flex-wrap items-center gap-4 bg-slate-800/90 p-4 rounded-xl border border-slate-700 shrink-0">
              {activeLocality ? (
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{localityNorms.length}</div>
                  <div className="text-[11px] text-slate-400">Instrumentos municipales</div>
                </div>
              ) : (
                <>
                  <div className="text-center pr-4 border-r border-slate-700">
                    <div className="text-2xl font-black text-emerald-400">{activeProvince.provincialCount}</div>
                    <div className="text-[11px] text-slate-400">Provinciales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">{activeProvince.municipalCount}</div>
                    <div className="text-[11px] text-slate-400">Municipales</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {activeLocality && (
            <div className="bg-emerald-50/90 border-2 border-emerald-600 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Fichas de {activeLocality.name}</h3>
                <button
                  type="button"
                  onClick={() => onSelectLocality('all', activeProvince.id)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Ver todos los municipios de {activeProvince.name}
                </button>
              </div>
              {localityNorms.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-slate-500 border border-emerald-200">No hay fichas cargadas para este municipio.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{localityNorms.map((x) => tarjetaFicha(x))}</div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-700" />
                Municipios relevados en {activeProvince.name} ({activeProvince.localities.length})
              </h4>
            </div>
            {activeProvince.localities.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center text-slate-500 border border-slate-200 text-sm">
                Todavía no hay fichas municipales de {activeProvince.name}. Las normas provinciales están en la pestaña “Normas de {activeProvince.name}”.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeProvince.localities.map((loc) => {
                  const fichas = normsByLocality[loc.id] || [];
                  const actual = loc.id === selectedLocalityId;
                  return (
                    <div
                      key={loc.id}
                      className={`bg-white rounded-xl border p-5 shadow-xs transition flex flex-col justify-between ${
                        actual ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h5 className="text-base font-bold text-slate-900">{loc.name}</h5>
                          <span className="text-xs font-mono text-slate-500">{fichas.length} fichas</span>
                        </div>
                        <div className="text-slate-600 mb-3">{chipsTipos(fichas)}</div>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {fichas.slice(0, 4).map((x) => (
                            <li key={x.id}>
                              <button type="button" onClick={() => onViewNormDetails(x)} className="text-left hover:text-emerald-800 inline-flex items-start gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{x.titulo}</span>
                              </button>
                            </li>
                          ))}
                          {fichas.length > 4 && <li className="text-slate-400 pl-5">y {fichas.length - 4} más</li>}
                        </ul>
                      </div>
                      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => flyToMunicipality(loc.id, loc.provinceId)}
                          className="font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Ubicar en el mapa
                        </button>
                        <button type="button" onClick={() => handleExploreMunicipality(loc.id, loc.provinceId)} className="text-emerald-700 hover:text-emerald-900 font-semibold">
                          Ver fichas →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Novedades */}
      {activeTab === 'novedades' &&
        (filteredNovedades.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-500">
            <p className="text-base font-medium text-slate-700 mb-2">No hay novedades que coincidan con los filtros.</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNovedades.map((item) => {
              const cfg = CATEGORIES[item.category] || DEFAULT_CATEGORY_COLOR;
              const url = urlSegura(item.url);
              return (
                <article
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded text-white" style={{ backgroundColor: cfg.hex }}>
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{fmtDate(item.date)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-2 flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-slate-700">📍 {item.locationName}</span>
                      <span className="text-slate-300">·</span>
                      <span className="italic">{item.type}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">{item.summary}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => flyToNovedad(item.id)}
                      className="font-semibold text-slate-700 hover:text-emerald-700 inline-flex items-center gap-1 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Ubicar en el mapa
                    </button>
                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1">
                        Fuente <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ))}

      {/* Normas provinciales */}
      {activeTab === 'provincias' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono text-emerald-400 tracking-wider">Normas provinciales</span>
              <h3 className="text-2xl font-bold text-white">{activeProvince.name}</h3>
              <div className="text-slate-300">{chipsTipos(provincialNorms)}</div>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700 shrink-0">
              <div className="text-center pr-4 border-r border-slate-700">
                <div className="text-2xl font-black text-white">{provincialNorms.length}</div>
                <div className="text-[11px] text-slate-400">Instrumentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-400">{provincialNorms.filter((x) => x.verificacion === 'fuente oficial').length}</div>
                <div className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Con texto oficial
                </div>
              </div>
            </div>
          </div>

          {provincialNorms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
              No hay normas provinciales cargadas para {activeProvince.name}.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{provincialNorms.slice(0, 9).map((x) => tarjetaFicha(x))}</div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onApplyFilterToSearch(activeProvince.id)}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
                >
                  Ver las {provincialNorms.length + activeProvince.municipalCount} fichas de {activeProvince.name} en el catálogo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};
