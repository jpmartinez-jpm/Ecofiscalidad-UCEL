import React from 'react';
import { ArrowRight, MapPin, Search, CheckCircle, Database } from 'lucide-react';
import { META, STATS, TIPOS, TIPO_COLOR, TIPO_LABEL, fmtFecha } from '../data/relevamiento';

const maxTipo = Math.max(1, ...TIPOS.map((t) => STATS.porTipo[t] || 0));

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-white pt-10 pb-16 md:pt-16 md:pb-24 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2-Column Split: Value Proposition + High Impact Photographic Asset */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Editorial Proposition & Action */}
          <div className="lg:col-span-7 space-y-6">
            {/* Unboxed Kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span>Proyecto de investigación · UCEL</span>
              <span aria-hidden="true">·</span>
              <span>Cátedra de Finanzas Públicas y Derecho Tributario</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
              Instrumentos ecofiscales en la Argentina: Nación, provincias y municipios.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl text-pretty">
              Relevamos las herramientas del Derecho Financiero con fines ambientales: tributos, beneficios fiscales, gasto,
              fondos afectados, presupuesto y mercados, con especial referencia a la provincia de Santa Fe. Cada ficha cita su norma y su fuente.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href="#mapa-ecofiscal"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-all shadow-xs"
              >
                <MapPin className="w-4 h-4 text-emerald-300" />
                <span>Explorar el mapa</span>
              </a>

              <a
                href="#buscador-ecofiscalidad"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all"
              >
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Doctrina y novedades</span>
              </a>
            </div>

            {/* Trust Markers - Unboxed Inline Metadata */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cada ficha con su fuente</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{STATS.fuenteOficial} fichas cotejadas con el texto oficial</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Datos descargables en CSV y JSON</span>
              </span>
            </div>
          </div>

          {/* Columna derecha: composición del relevamiento (conteos del archivo de datos) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="font-mono text-xs text-emerald-400 font-semibold uppercase tracking-wider">Composición del relevamiento</div>
                  <div className="text-sm font-bold text-white mt-0.5">Instrumentos por tipo</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                  al {fmtFecha(META.actualizado)}
                </span>
              </div>

              <div className="space-y-3">
                {TIPOS.map((t) => {
                  const n = STATS.porTipo[t] || 0;
                  return (
                    <div key={t}>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span className="font-medium">{TIPO_LABEL[t]}</span>
                        <span className="font-mono text-emerald-400 font-semibold">{n}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(100 * n) / maxTipo}%`, backgroundColor: TIPO_COLOR[t] }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{STATS.fuenteOficial} fichas con texto oficial consultado</span>
                </span>
                <a href="#mapa-ecofiscal" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                  <span>Ver en el mapa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores calculados del relevamiento */}
        <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {[
            [STATS.total, 'Instrumentos relevados'],
            [STATS.jurisdicciones + 1, 'Jurisdicciones (Nación, 23 provincias y CABA)'],
            [STATS.municipios, 'Municipios con fichas propias'],
            [STATS.aVerificar, 'Fichas a verificar con el texto oficial'],
          ].map(([n, t]) => (
            <div key={String(t)}>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">{n}</div>
              <div className="text-xs text-slate-500 mt-1">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
