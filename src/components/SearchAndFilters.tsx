import React, { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, FileSpreadsheet, Download, ArrowUpDown, MapPin, ExternalLink, CheckCircle } from 'lucide-react';
import { Instrumento, Province, TipoInstrumento } from '../types/ecofiscal';
import {
  ESTADOS,
  ESTADO_STYLE,
  META,
  TIPOS,
  TIPO_COLOR,
  TIPO_LABEL,
  fmtFecha,
  instrumentoLocalityId,
  necesitaCotejo,
  urlSegura,
} from '../data/relevamiento';

interface SearchAndFiltersProps {
  norms: Instrumento[];
  provinces: Province[];
  selectedProvinceId: string;
  selectedLocalityId: string;
  onSelectProvince: (provId: string) => void;
  onSelectLocality: (locId: string, provId: string) => void;
  onOpenNormDetail: (norm: Instrumento) => void;
}

type Nivel = 'all' | 'nacional' | 'provincial' | 'municipal';
type Orden = 'jurisdiccion' | 'titulo' | 'estado';

const PAGINA = 30;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  norms,
  provinces,
  selectedProvinceId,
  selectedLocalityId,
  onSelectProvince,
  onSelectLocality,
  onOpenNormDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipos, setTipos] = useState<TipoInstrumento[]>([]);
  const [estado, setEstado] = useState('all');
  const [nivel, setNivel] = useState<Nivel>('all');
  // 'all', 'nacion' o el id de una provincia (sincronizado con el mapa).
  const [juris, setJuris] = useState<string>(selectedProvinceId || 'all');
  const [localidad, setLocalidad] = useState<string>(selectedLocalityId || 'all');
  const [orden, setOrden] = useState<Orden>('jurisdiccion');
  const [visibles, setVisibles] = useState(PAGINA);

  // Cuando se elige una provincia o municipio en el mapa, el catálogo la sigue.
  useEffect(() => {
    if (selectedProvinceId) setJuris(selectedProvinceId);
  }, [selectedProvinceId]);
  useEffect(() => {
    setLocalidad(selectedLocalityId || 'all');
  }, [selectedLocalityId]);
  useEffect(() => {
    setVisibles(PAGINA);
  }, [searchTerm, tipos, estado, nivel, juris, localidad, orden]);

  const provinciaActiva = provinces.find((p) => p.id === juris) || null;

  const ordenJuris = useMemo(() => {
    const m: Record<string, number> = { Nación: 0 };
    provinces.forEach((p, i) => (m[p.name] = i + 1));
    return m;
  }, [provinces]);

  const filtrados = useMemo(() => {
    const q = norm(searchTerm.trim());
    return norms
      .filter((x) => {
        if (juris === 'nacion' && x.jurisdiccion !== 'Nación') return false;
        if (provinciaActiva && x.jurisdiccion !== provinciaActiva.name) return false;
        if (localidad !== 'all' && instrumentoLocalityId(x) !== localidad) return false;
        if (nivel !== 'all' && x.nivel !== nivel) return false;
        if (tipos.length && !tipos.includes(x.tipo)) return false;
        if (estado !== 'all' && x.estado !== estado) return false;
        if (q) {
          const hay = norm([x.norma, x.titulo, x.descripcion, x.nota, x.municipio, x.jurisdiccion].join(' '));
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (orden === 'titulo') return a.titulo.localeCompare(b.titulo);
        if (orden === 'estado') return a.estado.localeCompare(b.estado) || a.titulo.localeCompare(b.titulo);
        const ja = ordenJuris[a.jurisdiccion] ?? 99;
        const jb = ordenJuris[b.jurisdiccion] ?? 99;
        if (ja !== jb) return ja - jb;
        const na = a.nivel === 'municipal' ? 1 : 0;
        const nb = b.nivel === 'municipal' ? 1 : 0;
        if (na !== nb) return na - nb;
        return (a.municipio || '').localeCompare(b.municipio || '');
      });
  }, [norms, searchTerm, juris, provinciaActiva, localidad, nivel, tipos, estado, orden, ordenJuris]);

  const hayFiltros =
    searchTerm.trim() !== '' || tipos.length > 0 || estado !== 'all' || nivel !== 'all' || juris !== 'all' || localidad !== 'all';

  const limpiar = () => {
    setSearchTerm('');
    setTipos([]);
    setEstado('all');
    setNivel('all');
    setJuris('all');
    setLocalidad('all');
  };

  const cambiarJuris = (v: string) => {
    setJuris(v);
    setLocalidad('all');
    if (v !== 'all' && v !== 'nacion') {
      onSelectProvince(v);
      onSelectLocality('all', v);
    }
  };

  const descargar = (contenido: string, tipo: string, nombre: string) => {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportarJSON = () =>
    descargar(JSON.stringify(filtrados, null, 2), 'application/json', `relevamiento_ecofiscal_${META.actualizado}.json`);

  const exportarCSV = () => {
    const cols: (keyof Instrumento)[] = ['id', 'jurisdiccion', 'nivel', 'municipio', 'norma', 'titulo', 'tipo', 'estado', 'verificacion', 'descripcion', 'nota', 'fuente'];
    const celda = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...filtrados.map((x) => cols.map((c) => celda(x[c])).join(','))].join('\n');
    descargar('﻿' + csv, 'text/csv;charset=utf-8', `relevamiento_ecofiscal_${META.actualizado}.csv`);
  };

  const conteoTipo = (t: TipoInstrumento) => filtrados.filter((x) => x.tipo === t).length;

  return (
    <section id="buscador" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-semibold tracking-wider uppercase text-emerald-800 mb-2">Catálogo del relevamiento</div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            Instrumentos ecofiscales de la Nación, las provincias y los municipios
          </h2>
          <p className="mt-3 text-base md:text-lg text-slate-600 leading-relaxed">
            {META.total} fichas relevadas por el proyecto, cada una con su norma, su estado y su fuente. Relevamiento actualizado al{' '}
            {fmtFecha(META.actualizado)}.
          </p>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed border-l-2 border-amber-300 pl-3">{META.aclaracion}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm mb-8">
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por norma, tema o ciudad: residuos, 27.424, Rosario, ecotasa…"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-10 py-3 text-sm md:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:bg-white transition-all font-medium"
              aria-label="Buscar en el relevamiento"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Tipo de instrumento</span>
                {tipos.length > 0 && (
                  <button type="button" onClick={() => setTipos([])} className="text-xs text-emerald-700 hover:text-emerald-900 font-medium">
                    Quitar selección ({tipos.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {TIPOS.map((t) => {
                  const activo = tipos.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={activo}
                      onClick={() => setTipos((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                        activo ? 'text-white border-transparent' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                      style={activo ? { backgroundColor: TIPO_COLOR[t] } : undefined}
                    >
                      {!activo && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TIPO_COLOR[t] }} />}
                      {TIPO_LABEL[t]}
                      <span className="font-mono opacity-70">{conteoTipo(t)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Jurisdicción
                  <select
                    value={juris}
                    onChange={(e) => cambiarJuris(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 normal-case tracking-normal font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="all">Todas (Nación y 24 jurisdicciones)</option>
                    <option value="nacion">Nación</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.provincialCount + p.municipalCount})
                      </option>
                    ))}
                  </select>
                </label>

                {provinciaActiva && provinciaActiva.localities.length > 0 && (
                  <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Municipio
                    <select
                      value={localidad}
                      onChange={(e) => {
                        setLocalidad(e.target.value);
                        onSelectLocality(e.target.value, provinciaActiva.id);
                      }}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 normal-case tracking-normal font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="all">Todos</option>
                      {provinciaActiva.localities.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.instrumentCount})
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Nivel
                  <select
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value as Nivel)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 normal-case tracking-normal font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="all">Todos</option>
                    <option value="nacional">Nacional</option>
                    <option value="provincial">Provincial</option>
                    <option value="municipal">Municipal</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Estado
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 normal-case tracking-normal font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="all">Todos</option>
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e.charAt(0).toUpperCase() + e.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {hayFiltros && (
                <button type="button" onClick={limpiar} className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-semibold">
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2" aria-live="polite">
            <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">{filtrados.length}</span>
            <span className="text-sm text-slate-600">{filtrados.length === 1 ? 'instrumento' : 'instrumentos'}</span>
            {hayFiltros && <span className="text-xs text-slate-400">· con filtros aplicados</span>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Ordenar:</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="jurisdiccion">Por jurisdicción</option>
                <option value="titulo">Alfabético</option>
                <option value="estado">Por estado</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={exportarCSV}
                title="Descargar la selección en CSV"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                type="button"
                onClick={exportarJSON}
                title="Descargar la selección en JSON"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">JSON</span>
              </button>
            </div>
          </div>
        </div>

        {filtrados.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Ningún instrumento coincide con estos filtros</h3>
              <p className="text-xs text-slate-600 mt-2 mb-5">Probá con otra jurisdicción, otro tipo o una búsqueda más corta.</p>
              <button
                type="button"
                onClick={limpiar}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Restablecer filtros
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtrados.slice(0, visibles).map((x) => {
                const fuente = urlSegura(x.fuente);
                return (
                  <article
                    key={x.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: TIPO_COLOR[x.tipo] || '#64748b' }}
                        >
                          {TIPO_LABEL[x.tipo] || x.tipo}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${ESTADO_STYLE[x.estado] || ESTADO_STYLE['a verificar']}`}>
                          {x.estado}
                        </span>
                      </div>

                      <div className="font-mono text-[11px] text-emerald-800 font-semibold mb-1.5 line-clamp-2">{x.norma}</div>

                      <h3 className="text-base font-semibold text-slate-900 leading-snug group-hover:text-emerald-900 transition-colors">{x.titulo}</h3>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">
                          {x.nivel === 'municipal' && x.municipio ? `${x.municipio}, ${x.jurisdiccion}` : x.jurisdiccion}
                        </span>
                        <span className="text-slate-400">· {x.nivel}</span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed mb-4">{x.descripcion}</p>
                    </div>

                    <div>
                      <div className="pt-3 border-t border-slate-100 mb-3 text-[11px]">
                        {x.verificacion === 'fuente oficial' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Texto oficial consultado
                          </span>
                        ) : necesitaCotejo(x) ? (
                          <span className="text-amber-700 font-medium">Dato a cotejar con el texto oficial</span>
                        ) : (
                          <span className="text-slate-500">Verificación sin indicar</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => onOpenNormDetail(x)}
                          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                        >
                          Ver ficha
                        </button>
                        {fuente && (
                          <a
                            href={fuente}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Abrir la fuente"
                            aria-label={`Abrir la fuente de ${x.titulo}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {filtrados.length > visibles && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisibles((v) => v + PAGINA)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Mostrar más ({filtrados.length - visibles} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
