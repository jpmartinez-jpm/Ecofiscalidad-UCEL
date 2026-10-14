export type TipoInstrumento = 'presupuestario' | 'tributario' | 'beneficio' | 'gasto' | 'fondo' | 'mercado' | 'marco';

export type NivelInstrumento = 'nacional' | 'provincial' | 'municipal';

/** Una ficha del relevamiento (ver /relevamiento.json). */
export interface Instrumento {
  id: string;
  jurisdiccion: string; // 'Nación', 'CABA' o el nombre de la provincia
  nivel: NivelInstrumento;
  municipio?: string;
  norma: string;
  titulo: string;
  tipo: TipoInstrumento;
  estado: string;
  verificacion?: 'fuente oficial' | 'fuente secundaria';
  descripcion: string;
  nota?: string;
  fuente?: string;
  lat?: number;
  lng?: number;
}

export interface MunicipioRelevado {
  municipio: string;
  jurisdiccion: string;
  lat: number;
  lng: number;
  instrumentos: number;
}

export interface RelevamientoMeta {
  titulo: string;
  proyecto: string;
  actualizado: string;
  total: number;
  aclaracion: string;
  tipos: Record<TipoInstrumento, string>;
  estados: string[];
}

export interface Locality {
  id: string;
  name: string;
  provinceId: string;
  provinceName: string;
  coordinates: { lat: number; lng: number };
  instrumentCount: number;
}

export interface Province {
  id: string;
  name: string;
  region: 'Centro' | 'Cuyo' | 'NOA' | 'NEA' | 'Patagonia';
  centerCoordinates: { lat: number; lng: number };
  localities: Locality[];
  provincialCount: number;
  municipalCount: number;
}

export interface ContactFormData {
  purpose: 'technical_consultation' | 'project_participation';
  fullName: string;
  email: string;
  organization: string;
  roleOrProfile: string;
  province: string;
  locality: string;
  interestTaxType?: string;
  message: string;
  attachmentsNote?: string;
}
