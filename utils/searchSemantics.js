/**
 * searchSemantics.js
 * Utilidades para la interpretación semántica de términos de búsqueda en el buscador.
 * Mapea únicamente hacia los tipos de propiedad y operaciones vigentes en el catálogo.
 */

const TYPE_SYNONYMS = {
  'Terreno': ['lote', 'lotes', 'terreno', 'terrenos', 'parcela', 'parcelas', 'loteo', 'loteos'],
  'Casa': ['casa', 'casas', 'chalet', 'triplex', 'vivienda', 'quinta'],
  'Departamento': ['departamento', 'departamentos', 'depto', 'deptos', 'dpto', 'piso', 'semipiso'],
  'Inmueble Comercial': ['local', 'locales', 'oficina', 'oficinas', 'galpon', 'galpones', 'deposito', 'comercial', 'comercio', 'fondo de comercio'],
  'Campo': ['campo', 'campos', 'chacra', 'chacras', 'finca', 'estancia', 'hectarea', 'hectareas'],
  'Gran Inversión': ['inversion', 'inversiones', 'desarrollo', 'edificio', 'hotel', 'complejo'],
};

const OPERATION_SYNONYMS = {
  'Venta': ['venta', 'vendo', 'comprar', 'compro', 'compra'],
  'Alquiler': ['alquiler', 'alquilo', 'alquilar', 'renta', 'rento', 'arriendo'],
};

const PREPOSITIONS = new Set(['en', 'de', 'para', 'con']);

function normalizeWord(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchType(word) {
  for (const [mappedType, synonyms] of Object.entries(TYPE_SYNONYMS)) {
    if (synonyms.includes(word)) return mappedType;
  }
  return null;
}

function matchOperation(word) {
  for (const [mappedOp, synonyms] of Object.entries(OPERATION_SYNONYMS)) {
    if (synonyms.includes(word)) return mappedOp;
  }
  return null;
}

/**
 * Interpreta un término de búsqueda para extraer la operación, el tipo de propiedad
 * y limpiar las palabras clave clasificadas del término literal restante.
 *
 * @param {string} rawTerm - El texto ingresado en la barra de búsqueda
 * @returns {{ term: string, type: string | null, operation: string | null }}
 */
export function interpretSearchTerm(rawTerm) {
  if (!rawTerm || typeof rawTerm !== 'string') {
    return { term: '', type: null, operation: null };
  }

  const originalWords = rawTerm.trim().split(/\s+/).filter(Boolean);
  if (originalWords.length === 0) {
    return { term: '', type: null, operation: null };
  }

  let detectedType = null;
  let detectedOperation = null;
  const remainingWords = [];

  for (const origWord of originalWords) {
    const norm = normalizeWord(origWord);
    const typeHit = matchType(norm);
    const opHit = matchOperation(norm);

    if (typeHit) {
      if (!detectedType) detectedType = typeHit;
      continue;
    }

    if (opHit) {
      if (!detectedOperation) detectedOperation = opHit;
      continue;
    }

    // Descarta preposiciones sueltas al inicio o justo después de haber extraído una keyword
    if (PREPOSITIONS.has(norm) && remainingWords.length === 0 && (detectedType || detectedOperation)) {
      continue;
    }

    remainingWords.push(origWord);
  }

  const finalTerm = remainingWords
    .join(' ')
    .trim()
    .replace(/^(en|de|para)\s+/i, '')
    .trim();

  return {
    term: finalTerm,
    type: detectedType,
    operation: detectedOperation,
  };
}
