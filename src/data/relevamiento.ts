/**
 * Fuente única de datos de normas del Observatorio: el relevamiento verificado del proyecto UCEL
 * (/relevamiento.json, en la raíz del repositorio). Este módulo solo lo lee y arma índices;
 * no agrega normas, números, porcentajes ni montos que no estén en el archivo.
 */
import raw from '../../relevamiento.json';
import geo from './argentinaProvincias.json';
import type { Instrumento, Locality, MunicipioRelevado, Province, RelevamientoMeta, TipoInstrumento } from '../types/ecofiscal';

interface RelevamientoFile {
  meta: RelevamientoMeta;
  municipios: MunicipioRelevado[];
  instrumentos: Instrumento[];
}

const data = raw as unknown as RelevamientoFile;

export const RELEVAMIENTO_COMPLETO = data;
export const META: RelevamientoMeta = data.meta;
export const INSTRUMENTOS: Instrumento[] = data.instrumentos;
export const MUNICIPIOS: MunicipioRelevado[] = data.municipios;

export const TIPOS: TipoInstrumento[] = ['presupuestario', 'tributario', 'beneficio', 'gasto', 'fondo', 'mercado', 'marco'];

export const TIPO_LABEL: Record<string, string> = META.tipos;

export const TIPO_DESC: Record<TipoInstrumento, string> = {
  presupuestario: 'Etiquetado, cupos y control del gasto con fines ambientales.',
  tributario: 'Impuestos, tasas, cánones y cargos con finalidad ambiental.',
  beneficio: 'Exenciones, reducciones, diferimientos y estabilidad fiscal.',
  gasto: 'Subsidios, créditos bonificados, pagos por servicios ambientales y compras públicas.',
  fondo: 'Fondos y cuentas especiales con destino ambiental.',
  mercado: 'Bonos verdes, créditos de carbono y deuda con destino ambiental.',
  marco: 'Leyes que habilitan instrumentos fiscales todavía no puestos en práctica.',
};

export const TIPO_COLOR: Record<string, string> = {
  presupuestario: '#46609C',
  tributario: '#A0432F',
  beneficio: '#2E7A52',
  gasto: '#7656A0',
  fondo: '#5F6E12',
  mercado: '#A84D73',
  marco: '#66726C',
};

export const ESTADOS: string[] = META.estados;

export const ESTADO_STYLE: Record<string, string> = {
  vigente: 'bg-green-50 text-green-800 border-green-200',
  'parcialmente vigente': 'bg-amber-50 text-amber-800 border-amber-200',
  'sin reglamentar': 'bg-amber-50 text-amber-800 border-amber-200',
  suspendido: 'bg-rose-50 text-rose-800 border-rose-200',
  derogado: 'bg-slate-100 text-slate-500 border-slate-200',
  cancelado: 'bg-slate-100 text-slate-500 border-slate-200',
  'a verificar': 'bg-sky-50 text-sky-800 border-sky-200',
};

/** Una ficha necesita cotejo si no se confirmó o si solo tiene fuente secundaria. */
export const necesitaCotejo = (x: Instrumento): boolean =>
  x.estado === 'a verificar' || x.verificacion === 'fuente secundaria';

export const slug = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Nombres del IGN que difieren de los usados en el relevamiento. */
const IGN_A_RELEVAMIENTO: Record<string, string> = {
  'Ciudad Autónoma de Buenos Aires': 'CABA',
  'Tierra del Fuego, Antártida e Islas del Atlántico Sur': 'Tierra del Fuego',
};

export const nombreProvinciaDesdeIgn = (ign: string): string => IGN_A_RELEVAMIENTO[ign] || ign;

const REGION: Record<string, Province['region']> = {
  'Buenos Aires': 'Centro', CABA: 'Centro', 'Córdoba': 'Centro', 'Entre Ríos': 'Centro', 'Santa Fe': 'Centro', 'La Pampa': 'Centro',
  Mendoza: 'Cuyo', 'San Juan': 'Cuyo', 'San Luis': 'Cuyo',
  Jujuy: 'NOA', Salta: 'NOA', 'Tucumán': 'NOA', Catamarca: 'NOA', 'Santiago del Estero': 'NOA', 'La Rioja': 'NOA',
  Misiones: 'NEA', Chaco: 'NEA', Corrientes: 'NEA', Formosa: 'NEA',
  'Neuquén': 'Patagonia', 'Río Negro': 'Patagonia', Chubut: 'Patagonia', 'Santa Cruz': 'Patagonia', 'Tierra del Fuego': 'Patagonia',
};

const localityId = (m: MunicipioRelevado) => `${slug(m.jurisdiccion)}--${slug(m.municipio)}`;

export const instrumentoLocalityId = (x: Instrumento): string | null =>
  x.nivel === 'municipal' && x.municipio ? `${slug(x.jurisdiccion)}--${slug(x.municipio)}` : null;

interface GeoFeature {
  properties: { nombre: string; centroide?: { lat: number; lon: number } };
}

/** Las 24 jurisdicciones, con el centroide oficial del IGN y los municipios relevados en cada una. */
export const PROVINCES: Province[] = (geo as unknown as { features: GeoFeature[] }).features
  .map((f) => {
    const name = nombreProvinciaDesdeIgn(f.properties.nombre);
    const id = slug(name);
    const localities: Locality[] = MUNICIPIOS.filter((m) => m.jurisdiccion === name)
      .map((m) => ({
        id: localityId(m),
        name: m.municipio,
        provinceId: id,
        provinceName: name,
        coordinates: { lat: m.lat, lng: m.lng },
        instrumentCount: INSTRUMENTOS.filter((x) => x.nivel === 'municipal' && x.jurisdiccion === name && x.municipio === m.municipio).length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return {
      id,
      name,
      region: REGION[name] || 'Centro',
      centerCoordinates: { lat: f.properties.centroide?.lat ?? -38, lng: f.properties.centroide?.lon ?? -64 },
      localities,
      provincialCount: INSTRUMENTOS.filter((x) => x.jurisdiccion === name && x.nivel !== 'municipal').length,
      municipalCount: INSTRUMENTOS.filter((x) => x.jurisdiccion === name && x.nivel === 'municipal').length,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const provinceIdOf = (jurisdiccion: string): string => slug(jurisdiccion);

export const ALL_LOCALITIES: Locality[] = PROVINCES.flatMap((p) => p.localities);

export const contarPor = <K extends string>(items: Instrumento[], key: (x: Instrumento) => K): Record<K, number> =>
  items.reduce((acc, x) => {
    const k = key(x);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<K, number>);

export const STATS = {
  total: INSTRUMENTOS.length,
  nacionales: INSTRUMENTOS.filter((x) => x.nivel === 'nacional').length,
  provinciales: INSTRUMENTOS.filter((x) => x.nivel === 'provincial').length,
  municipales: INSTRUMENTOS.filter((x) => x.nivel === 'municipal').length,
  jurisdicciones: new Set(INSTRUMENTOS.filter((x) => x.jurisdiccion !== 'Nación').map((x) => x.jurisdiccion)).size,
  municipios: MUNICIPIOS.length,
  fuenteOficial: INSTRUMENTOS.filter((x) => x.verificacion === 'fuente oficial').length,
  aVerificar: INSTRUMENTOS.filter((x) => x.estado === 'a verificar').length,
  porTipo: contarPor(INSTRUMENTOS, (x) => x.tipo),
  porEstado: contarPor(INSTRUMENTOS, (x) => x.estado),
};

export const fmtFecha = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
};

/** Escapa texto para insertarlo en el HTML de los popups de Leaflet. */
export const escHtml = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export const urlSegura = (u?: string): string => (u && /^https?:\/\/\S+$/i.test(u) ? u : '');
