import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  Download,
  Calendar,
  Globe2,
  ExternalLink,
  Zap,
  Leaf,
  SearchX,
  X,
} from 'lucide-react';

export interface EcofiscalNewsItem {
  id: number;
  title: string;
  date: string;
  region: string;
  category: string;
  type: string;
  source: string;
  summary: string;
  tags: string[];
  url: string;
}

export const ECOFISCAL_UCEL_DATABASE: EcofiscalNewsItem[] = [
  {
    id: 1,
    title: 'Nuevo impuesto al turismo en Argentina: expansión municipal de la Ecotasa pese al fallo de la Corte Suprema',
    date: '2026-10-14',
    region: 'Argentina',
    category: 'Ecotasas y Turismo',
    type: 'Jurisprudencia y Prensa',
    source: 'iProfesional / CSJN / Justicia de Río Negro',
    summary:
      'Análisis sobre la proliferación de ecotasas turísticas en municipios argentinos (incluyendo nuevos cobros en Misiones) en contraste con el fallo de la Corte Suprema de Justicia de la Nación y del tribunal provincial que declaró inconstitucional la ecotasa cobrada a turistas en Bariloche.',
    tags: ['Ecotasa', 'Turismo', 'Bariloche', 'Misiones', 'Corte Suprema', 'Municipios'],
    url: 'https://www.iprofesional.com/impuestos/446306-nuevo-impuesto-turismo-epidemia-argentina-contra-fallo-corte-suprema',
  },
  {
    id: 2,
    title: 'La tributación medioambiental en Latinoamérica: Avances, Desafíos y Perspectivas',
    date: '2026-01-31',
    region: 'Latinoamérica',
    category: 'Política Fiscal y Presupuesto',
    type: 'Paper Académico',
    source: 'Revista Colombiana de Contabilidad (ASFACOP) - Nohemi Fany Choque',
    summary:
      'Revisión de la evolución e implementación de impuestos, tasas y contribuciones ecológicas en México, Chile, Colombia y Brasil basados en datos de OCDE y CEPAL. Evalúa los desafíos asociados a la desigualdad económica, el control limitado y la necesidad de armonización regional.',
    tags: ['Tributación verde', 'Latinoamérica', 'OCDE', 'CEPAL', 'Políticas públicas'],
    url: 'https://doi.org/10.56241/asf.v14n26.359',
  },
  {
    id: 3,
    title: 'Environmental Taxes and Emissions: The Moderating Role of the Shadow Economy, AI, and ICT in OECD Countries',
    date: '2026-02-15',
    region: 'Internacional',
    category: 'Impuesto al Carbono y Emisiones',
    type: 'Paper Académico',
    source: 'Journal of Tax Reform (Saleem & Xu)',
    summary:
      'Estudio empírico sobre cómo los impuestos ambientales (ETA) interactúan con la inteligencia artificial (robots industriales), las tecnologías de la información (TIC) y la economía informal en la reducción de emisiones de CO2 basadas en el consumo en países de la OCDE.',
    tags: ['IA', 'OCDE', 'Carbono', 'Economía informal', 'TIC', 'Emisiones'],
    url: 'https://taxreform.ru/fileadmin/user_upload/site_15907/2026/02-Saleem_Xu-266-287.pdf',
  },
  {
    id: 4,
    title: 'Urban road pricing reframed: a critical review of imperativeness and relevance for the 21st century cities',
    date: '2026-03-10',
    region: 'Internacional',
    category: 'Vialidad y Movilidad Urbana',
    type: 'Paper Académico',
    source: 'Taylor & Francis / NSF PAR',
    summary:
      'Revisión crítica de los cargos por congestión urbana (congestion pricing) y peajes ambientales en grandes metrópolis, evaluando también impactos de equidad distributiva como en el esquema de cargos por congestión de Londres.',
    tags: ['Movilidad', 'Cargos por congestión', 'Ciudades', 'Peajes urbanos', 'Equidad'],
    url: 'https://www.tandfonline.com/doi/full/10.1080/29941849.2026.2678064',
  },
  {
    id: 5,
    title: 'Desafíos y soluciones en la implementación de la nueva tasa de residuos municipales en España (Ley 7/2022)',
    date: '2025-04-01',
    region: 'España y UE',
    category: 'Tasas Municipales y Residuos',
    type: 'Paper Académico',
    source: 'Revista de Estudios de la Administración Local y Autonómica (INAP)',
    summary:
      'Análisis crítico de la adaptación municipal a la Ley 7/2022 en España (casos de Barcelona, Badajoz, Tres Cantos, Valladolid) frente a modelos exitosos de Pago por Generación (PxG) y tarifas diferenciadas en Flandes (Bélgica) y San Francisco (EE. UU.).',
    tags: ['Pago por generación', 'Residuos', 'Ley 7/2022', 'Municipios', 'Economía circular', 'Contenedores inteligentes'],
    url: 'https://doi.org/10.24965/reala.11494',
  },
  {
    id: 6,
    title: 'Caso de Estudio: Impuesto al Carbono en Argentina y Etiquetado de Eficiencia Energética',
    date: '2025-10-15',
    region: 'Argentina',
    category: 'Impuesto al Carbono y Emisiones',
    type: 'Informe Técnico',
    source: 'FLACSO / Foro sobre Cambio Climático (Ambiente y Comercio)',
    summary:
      'Evaluación de los criterios de efectividad, barreras económicas y resultados distributivos del impuesto sobre los combustibles líquidos y al dióxido de carbono en Argentina, junto con novedades regulatorias de eficiencia energética vehicular.',
    tags: ['Carbono', 'Combustibles', 'Argentina', 'FLACSO', 'Eficiencia energética'],
    url: 'https://ambienteycomercio.org/wp-content/uploads/2025/10/14.-Impuesto-al-Carbono-en-Argentina-1.pdf',
  },
  {
    id: 7,
    title: 'Informe Ambiental 2025: Presupuesto ambiental, Fondo de Bosques (Ley 26.331) e impacto del RIGI',
    date: '2025-05-10',
    region: 'Argentina',
    category: 'Política Fiscal y Presupuesto',
    type: 'Informe Técnico',
    source: 'Fundación Ambiente y Recursos Naturales (FARN)',
    summary:
      'Análisis del ajuste presupuestario en el área ambiental, la subejecución y debates en COFEMA sobre el Fondo Nacional de Bosques Nativos, los efectos regulatorios del Régimen de Incentivo para Grandes Inversiones (RIGI - Ley 27.742) y la demanda energética de la IA.',
    tags: ['RIGI', 'Presupuesto', 'Fondo de Bosques', 'FARN', 'IA', 'Ley 27.742'],
    url: 'https://farn.org.ar/wp-content/uploads/2025/05/IAF_2025_WEB.pdf',
  },
  {
    id: 8,
    title: 'Impuestos Verdes: Herramientas Fiscales para la Mitigación del Cambio Climático y Desarrollo Sustentable',
    date: '2024-09-01',
    region: 'Latinoamérica',
    category: 'Impuesto al Carbono y Emisiones',
    type: 'Informe Técnico',
    source: 'Comisión de Hacienda del Congreso de la Ciudad de México',
    summary:
      'Documento técnico-legislativo para modernizar los impuestos ecológicos en entornos urbanos densificados, alineando la recaudación con la Taxonomía Sostenible de México, el gasto público verde y los impuestos estatales al carbono.',
    tags: ['Impuestos verdes', 'México', 'Taxonomía sostenible', 'Carbono', 'Municipios'],
    url: 'https://www.congresocdmx.gob.mx/archivo-46fb1ff1836e45623f9ebe41245b729306ca7c3e.pdf',
  },
  {
    id: 9,
    title: 'Una propuesta de política pública ambiental con efectos distributivos respecto a los impuestos a los combustibles en México',
    date: '2024-07-15',
    region: 'Latinoamérica',
    category: 'Impuesto al Carbono y Emisiones',
    type: 'Paper Académico',
    source: 'Universidad Autónoma del Estado de Hidalgo (UAEH)',
    summary:
      'Estudio sobre la articulación entre políticas ambientales, regulatorias y fiscales en México, analizando los impuestos a los combustibles fósiles, licencias de emisión y subsidios a la innovación tecnológica limpia.',
    tags: ['Combustibles', 'México', 'Efectos distributivos', 'Subsidios', 'Innovación'],
    url: 'https://repository.uaeh.edu.mx/books/199/pp.pdf',
  },
  {
    id: 10,
    title: 'II Jornadas sobre la Reforma Ambiental de las Haciendas Locales: Marco europeo, estatal y autonómico',
    date: '2023-03-20',
    region: 'España y UE',
    category: 'Tasas Municipales y Residuos',
    type: 'Informe Técnico',
    source: 'Instituto de Estudios Fiscales (IEF) - Coord. Belén García Carretero',
    summary:
      'Obra colectiva exhaustiva que analiza el impuesto sobre emisiones de CO2 de vehículos en Cataluña y Valencia, comunidades energéticas en el País Vasco, bonificaciones ambientales en IBI e ICIO por energía solar, e impuestos a los plásticos no reciclados.',
    tags: ['Haciendas Locales', 'Municipios', 'IBI', 'ICIO', 'Plásticos', 'Vehículos', 'Renovables'],
    url: 'https://www.ief.es/docs/destacados/publicaciones/documentos_trabajo/2023_03.pdf',
  },
  {
    id: 11,
    title: 'Tributación Ecológica Municipal: Análisis de los incentivos fiscales del Impuesto sobre Servicios (ISS) en Brasil',
    date: '2023-06-10',
    region: 'Latinoamérica',
    category: 'Incentivos y Energías Renovables',
    type: 'Paper Académico',
    source: 'SciELO Brasil',
    summary:
      'Investigación sobre cómo los municipios brasileños de más de 500.000 habitantes aplican incentivos fiscales en el Impuesto sobre Servicios de Cualquier Naturaleza (ISSQN / ISS ecológico) en relación con los ODS de la Agenda 2030.',
    tags: ['ISS', 'Brasil', 'Municipios', 'Incentivos fiscales', 'ODS'],
    url: 'https://www.scielo.br/j/vd/a/qV4Jfw5TGjQj6hzmRpQ4Zvz/?lang=es&format=pdf',
  },
  {
    id: 12,
    title: 'Energía Solar en Argentina: Aspectos Impositivos y Legales (Ley 27.424 y Decretos reglamentarios)',
    date: '2023-12-28',
    region: 'Argentina',
    category: 'Incentivos y Energías Renovables',
    type: 'Paper Académico',
    source: 'Biblioteca Digital UNCUYO - Facultad de Ciencias Económicas',
    summary:
      'Evaluación de las implicancias legales e impositivas para el desarrollo de la energía solar y generación distribuida en Argentina, incluyendo el análisis de la Ley 27.424 y las modificaciones de los Decretos N° 1.007/2019 y N° 70/2023.',
    tags: ['Energía solar', 'Renovables', 'Argentina', 'Incentivos fiscales', 'Ley 27.424'],
    url: 'https://bdigital.uncu.edu.ar/objetos_digitales/21164/energa-solar-en-argentina-aspectos-impositivos-y-legales.pdf',
  },
  {
    id: 13,
    title: 'Oportunidades para una recuperación pospandemia más sostenible y con bajas emisiones en Argentina: política fiscal ambiental',
    date: '2022-02-09',
    region: 'Argentina',
    category: 'Política Fiscal y Presupuesto',
    type: 'Informe Técnico',
    source: 'CEPAL - Naciones Unidas',
    summary:
      'Documento de proyecto de la CEPAL centrado en el diseño de instrumentos de política fiscal ambiental en Argentina para reducir la huella de carbono e impulsar un desarrollo sostenible.',
    tags: ['CEPAL', 'Argentina', 'Huella de carbono', 'Política fiscal'],
    url: 'https://www.cepal.org/es/publicaciones/47736-oportunidades-recuperacion-pospandemia-mas-sostenible-bajas-emisiones-carbono-la',
  },
  {
    id: 14,
    title: 'Aproximación teórica de instrumentos y mecanismos económico-financieros para la gestión ambiental de bahías',
    date: '2022-04-01',
    region: 'Latinoamérica',
    category: 'Política Fiscal y Presupuesto',
    type: 'Paper Académico',
    source: 'Revista COODES (Cooperativismo y Desarrollo) - Monzón Aldama et al.',
    summary:
      'Análisis de fondos ambientales, cánones y royalties mineros, bonificaciones arancelarias a tecnologías limpias, créditos blandos y contabilidad ambiental para financiar la conservación de ecosistemas costeros.',
    tags: ['Mecanismos financieros', 'Fondos ambientales', 'Contabilidad ambiental', 'Ecosistemas'],
    url: 'https://coodes.upr.edu.cu/index.php/coodes/article/view/490',
  },
];

export const BuscadorEcofiscalidad: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Format date helper
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mIdx = parseInt(month, 10) - 1;
    return `${day} ${months[mIdx] || ''} ${year}`;
  };

  // Badge category class helper
  const getCategoryBadgeClass = (category: string) => {
    const map: Record<string, string> = {
      'Impuesto al Carbono y Emisiones': 'bg-teal-50 text-teal-700 border-teal-200',
      'Tasas Municipales y Residuos': 'bg-ucel-50 text-ucel-700 border-ucel-200',
      'Ecotasas y Turismo': 'bg-amber-50 text-amber-700 border-amber-200',
      'Incentivos y Energías Renovables': 'bg-sky-50 text-sky-700 border-sky-200',
      'Vialidad y Movilidad Urbana': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Política Fiscal y Presupuesto': 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return map[category] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Filtered & sorted items
  const filteredData = useMemo(() => {
    const query = searchInput.trim().toLowerCase();

    const filtered = ECOFISCAL_UCEL_DATABASE.filter((item) => {
      const matchesQuery =
        query === '' ||
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query));

      const matchesCat = filterCategory === 'ALL' || item.category === filterCategory;
      const matchesReg = filterRegion === 'ALL' || item.region === filterRegion;
      const matchesTyp = filterType === 'ALL' || item.type === filterType;

      return matchesQuery && matchesCat && matchesReg && matchesTyp;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOrder === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [searchInput, filterCategory, filterRegion, filterType, sortOrder]);

  // Reset filters
  const resetAllFilters = () => {
    setSearchInput('');
    setFilterCategory('ALL');
    setFilterRegion('ALL');
    setFilterType('ALL');
    setSortOrder('newest');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ['ID', 'Fecha', 'Titulo', 'Region', 'Categoria', 'Tipo', 'Fuente', 'URL'];
    const rows = filteredData.map((item) => [
      item.id,
      item.date,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.region}"`,
      `"${item.category}"`,
      `"${item.type}"`,
      `"${item.source.replace(/"/g, '""')}"`,
      item.url,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      headers.join(',') +
      '\n' +
      rows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'observatorio_ecofiscalidad_ucel.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="buscador-ecofiscalidad" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-slate-200">
      {/* Encabezado Institucional */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div aria-hidden="true" className="h-[3px] w-[92px] bg-verde-ucel mx-auto mb-4" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-fcjs-50 text-fcjs-700 mb-3">
          <Leaf className="w-3.5 h-3.5 text-fcjs-700" /> Observatorio de Ecofiscalidad • UCEL
        </span>
        <h2 className="text-3xl sm:text-4xl font-medium text-ucel-800 tracking-tight text-balance">
          Motor de Búsqueda y Novedades Ecofiscales
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed text-pretty">
          Explora legislación, jurisprudencia, artículos científicos y noticias sobre tributación ambiental, mercados de carbono, tasas locales y sostenibilidad fiscal en Argentina, Latinoamérica y el mundo.
        </p>
      </div>

      {/* Panel de Control y Filtros */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 mb-8">
        {/* Barra de búsqueda principal */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por palabra clave (ej. ecotasa, carbono, pago por generación, RIGI, residuos, ISS, Bariloche)..."
            className="w-full pl-12 pr-24 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ucel-600 focus:border-transparent transition text-sm sm:text-base"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute inset-y-2 right-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-200/70 hover:bg-slate-200 rounded-lg transition"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Selectores de Filtros Avanzados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Filtro 1: Instrumento / Eje Temático */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Eje Temático / Instrumento
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-ucel-600 focus:border-ucel-600 block p-2.5"
            >
              <option value="ALL">Todos los instrumentos</option>
              <option value="Impuesto al Carbono y Emisiones">Impuesto al Carbono y Emisiones</option>
              <option value="Tasas Municipales y Residuos">Tasas Municipales y Residuos (PxG)</option>
              <option value="Ecotasas y Turismo">Ecotasas y Turismo</option>
              <option value="Incentivos y Energías Renovables">Incentivos y Energías Renovables</option>
              <option value="Vialidad y Movilidad Urbana">Vialidad y Movilidad Sostenible</option>
              <option value="Política Fiscal y Presupuesto">Política Fiscal, RIGI y Presupuesto</option>
            </select>
          </div>

          {/* Filtro 2: Jurisdicción / Región */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Región / Jurisdicción
            </label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-ucel-600 focus:border-ucel-600 block p-2.5"
            >
              <option value="ALL">Todas las jurisdicciones</option>
              <option value="Argentina">Argentina (Nacional / Municipal)</option>
              <option value="Latinoamérica">Latinoamérica (Brasil, México, Chile, Colombia)</option>
              <option value="España y UE">España y Unión Europea</option>
              <option value="Internacional">Internacional / Comparado</option>
            </select>
          </div>

          {/* Filtro 3: Tipo de Fuente */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Tipo de Contenido
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-ucel-600 focus:border-ucel-600 block p-2.5"
            >
              <option value="ALL">Todos los formatos</option>
              <option value="Jurisprudencia y Prensa">Jurisprudencia y Novedad Periodística</option>
              <option value="Paper Académico">Paper Académico / Doctrina</option>
              <option value="Informe Técnico">Informe Técnico / Institucional</option>
              <option value="Legislación y Normativa">Legislación y Normativa</option>
            </select>
          </div>

          {/* Filtro 4: Ordenamiento */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Ordenar por
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-ucel-600 focus:border-ucel-600 block p-2.5"
            >
              <option value="newest">Más recientes primero</option>
              <option value="oldest">Más antiguos primero</option>
              <option value="title">Orden alfabético (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Etiquetas Rápidas (Quick Tags) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Tendencias:
          </span>
          {[
            { label: 'Ecotasa Turística', tag: 'Ecotasa' },
            { label: 'Pago por Generación (PxG)', tag: 'Pago por generación' },
            { label: 'Impuesto al Carbono', tag: 'Carbono' },
            { label: 'Haciendas Locales / Municipios', tag: 'Municipios' },
            { label: 'Energías Renovables', tag: 'Renovables' },
            { label: 'IA y Tributación Verde', tag: 'IA' },
          ].map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => setSearchInput(item.tag)}
              className="text-xs bg-slate-100 hover:bg-ucel-50 hover:text-ucel-700 text-slate-600 px-2.5 py-1 rounded-md transition border border-transparent hover:border-ucel-200"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Estado de Resultados y Exportación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
        <div className="text-sm text-slate-600">
          Mostrando <span className="font-bold text-slate-900">{filteredData.length}</span> novedades y documentos encontrados
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs font-medium text-slate-500 hover:text-ucel-700 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restablecer filtros
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-ucel-600 text-slate-700 hover:text-ucel-700 rounded-lg text-xs font-medium shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5" /> Exportar selección (CSV)
          </button>
        </div>
      </div>

      {/* Grilla de Resultados */}
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => {
            const badgeClass = getCategoryBadgeClass(item.category);
            return (
              <article
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-ucel-300 transition flex flex-col justify-between p-6"
              >
                <div>
                  {/* Meta superior */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${badgeClass}`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatDate(item.date)}
                    </span>
                  </div>

                  {/* Región y Tipo */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <Globe2 className="w-3.5 h-3.5 text-ucel-600" /> {item.region}
                    </span>
                    <span>•</span>
                    <span>{item.type}</span>
                  </div>

                  {/* Título */}
                  <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug hover:text-ucel-700 transition">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </h3>

                  {/* Resumen */}
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-2">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setSearchInput(tag)}
                        className="text-[11px] bg-slate-100 text-slate-600 hover:bg-ucel-50 hover:text-ucel-700 cursor-pointer px-2 py-0.5 rounded transition"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer de tarjeta */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate max-w-[65%]" title={item.source}>
                      <strong>Fuente:</strong> {item.source}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-ucel-600 hover:text-ucel-800 inline-flex items-center gap-1 shrink-0"
                    >
                      Consultar <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Estado Vacío */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No se encontraron resultados</h3>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            No hay documentos que coincidan exactamente con tu búsqueda o combinación de filtros. Intenta con términos más generales.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-4 py-2 bg-ucel-600 hover:bg-ucel-700 text-white text-sm font-medium rounded-lg transition"
          >
            Ver todo el repositorio
          </button>
        </div>
      )}
    </section>
  );
};
