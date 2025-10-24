
const EXPIRY_KEYWORDS = [
  'expira', 'expiración', 'expiracion', 'vence', 'vencimiento', 'caduca', 'caducidad'
];


export interface DetectedDate {
  raw: string;
  iso: string;
}


export function extractExpiryDates(text: string): DetectedDate[] {
  console.log('Extrayendo fechas del texto:', text);
  
  const months: Record<string, number> = {
    enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,
    julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,
    noviembre:11,diciembre:12,ene:1,feb:2,mar:3,abr:4,may:5,
    jun:6,jul:7,ago:8,sep:9,oct:10,nov:11,dic:12
  };

  const results: DetectedDate[] = [];
  const add = (raw: string, y: number, m: number, d: number) => {
    const lastDay = new Date(y, m, 0).getDate();
    const day = Math.min(Math.max(1, d), lastDay);
    const iso = new Date(y, m - 1, day).toISOString();
    // Aceptar fechas desde hace 1 año hasta 10 años en el futuro
    const oneYearAgo = Date.now() - (365 * 24 * 3600 * 1000);
    const tenYearsFromNow = Date.now() + (10 * 365 * 24 * 3600 * 1000);
    const dateTime = new Date(iso).getTime();
    
    if (dateTime >= oneYearAgo && dateTime <= tenYearsFromNow) {
      results.push({ raw, iso });
      console.log('Fecha válida agregada:', { raw, iso });
    }
  };

  // Limpiar texto para mejor detección
  const t = text.toLowerCase()
    .replace(/[^\w\s\/\-\.]/g, ' ') // Remover caracteres especiales excepto separadores de fecha
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();

  console.log('Texto limpio para detección:', t);

  // Patrones de fecha más flexibles
  const patterns = [
    // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/g,
    // MM/DD/YYYY (formato americano)
    /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/g,
    // YYYY/MM/DD
    /\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/g
  ];

  for (const pattern of patterns) {
    for (const m of t.matchAll(pattern)) {
      const parts = [m[1], m[2], m[3]].map(p => +p);
      console.log('Coincidencia de patrón:', m[0], 'partes:', parts);
      
      // Intentar diferentes interpretaciones
      const interpretations = [
        [parts[0], parts[1], parts[2]], // DD/MM/YYYY
        [parts[2], parts[0], parts[1]], // YYYY/MM/DD
        [parts[2], parts[1], parts[0]]  // YYYY/DD/MM
      ];
      
      for (const [dd, mm, yyyy] of interpretations) {
        const year = fixYear(yyyy);
        if (validDMY(dd, mm, year)) {
          add(m[0], year, mm, dd);
        }
      }
    }
  }

  // Fechas con nombres de meses
  const reLong = new RegExp(
    String.raw`\b(\d{1,2})\s*(?:de\s*)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre|ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\s*(?:de\s*)?(\d{2,4})\b`,
    'g'
  );
  for (const m of t.matchAll(reLong)) {
    const dd = +m[1], mm = months[m[2]], yyyy = fixYear(+m[3]);
    console.log('Fecha con mes:', m[0], 'dd:', dd, 'mm:', mm, 'yyyy:', yyyy);
    if (validDMY(dd, mm, yyyy)) add(m[0], yyyy, mm, dd);
  }

  // MM/YY o MM/YYYY
  const reMY = /\b(\d{1,2})[\/\-](\d{2,4})\b/g;
  for (const m of t.matchAll(reMY)) {
    const mm = +m[1], yyyy = fixYear(+m[2]);
    console.log('Mes/Año:', m[0], 'mm:', mm, 'yyyy:', yyyy);
    if (mm >= 1 && mm <= 12) add(m[0], yyyy, mm, 28);
  }

  // Eliminar duplicados y ordenar
  const uniq = new Map(results.map(r => [r.iso, r]));
  const finalResults = Array.from(uniq.values()).sort((a,b)=>+new Date(a.iso)-+new Date(b.iso));
  
  console.log('Fechas finales detectadas:', finalResults);
  return finalResults;
}

function fixYear(y:number):number {
  if (y < 100) return y < 50 ? 2000 + y : 1900 + y;
  return y;
}

function validDMY(d:number,m:number,y:number):boolean {
  if (m < 1 || m > 12) return false;
  const last = new Date(y, m, 0).getDate();
  return d >= 1 && d <= last;
}

export function pickBestExpiryDate(
  text: string,
  dates: DetectedDate[]
): DetectedDate | null {
  if (!dates.length) {
    console.log('No hay fechas para evaluar');
    return null;
  }

  console.log('Evaluando fechas candidatas:', dates);
  const t = text.toLowerCase();

  // índice de aparición de cada "raw" en el texto (primera coincidencia)
  const withIndex = dates.map(d => {
    const idx = t.indexOf(d.raw.toLowerCase());
    return { ...d, idx };
  });

  // función para calcular score: más alto si está cerca de keywords
  function scoreDate(d: { raw: string; iso: string; idx: number }) {
    let base = 0;
    console.log(`Evaluando fecha: ${d.raw} en posición ${d.idx}`);
    
    // ventana de 100 caracteres alrededor de la coincidencia (aumentada para móvil)
    const start = Math.max(0, d.idx - 100);
    const end   = Math.min(t.length, d.idx + d.raw.length + 100);
    const window = t.slice(start, end);
    
    console.log('Ventana de contexto:', window);

    // Buscar palabras clave de expiración
    for (const kw of EXPIRY_KEYWORDS) {
      if (window.includes(kw)) {
        base += 10; // Aumentado el peso de las palabras clave
        console.log(`Palabra clave encontrada: ${kw} (+10 puntos)`);
      }
    }

    // Buscar palabras adicionales que indiquen fechas de vencimiento
    const additionalKeywords = ['fecha', 'hasta', 'valido', 'vigencia', 'expires', 'expiry'];
    for (const kw of additionalKeywords) {
      if (window.includes(kw)) {
        base += 3;
        console.log(`Palabra adicional encontrada: ${kw} (+3 puntos)`);
      }
    }

    // Bonus por ser futura y próxima
    const ms = new Date(d.iso).getTime() - Date.now();
    const days = ms / (1000 * 60 * 60 * 24);
    
    if (ms >= 0) {
      // Fecha futura - bonus por proximidad
      const proximity = Math.max(0, 8 - Math.min(8, days / 30)); // Ajustado para mejor scoring
      base += proximity;
      console.log(`Fecha futura en ${days.toFixed(0)} días (+${proximity.toFixed(1)} puntos)`);
    } else {
      // Fecha pasada - penalización menor si es reciente
      if (days > -30) {
        base -= 1; // Penalización menor para fechas recientes
        console.log(`Fecha pasada reciente (-1 punto)`);
      } else {
        base -= 5; // Penalización mayor para fechas muy antiguas
        console.log(`Fecha pasada antigua (-5 puntos)`);
      }
    }

    // Bonus por formato de fecha (las fechas completas son más confiables)
    if (d.raw.includes('/') || d.raw.includes('-') || d.raw.includes('.')) {
      base += 2;
      console.log('Formato de fecha estructurado (+2 puntos)');
    }

    console.log(`Score final para ${d.raw}: ${base}`);
    return base;
  }

  // Calcular scores y ordenar
  const scored = withIndex.map(d => ({ d, s: scoreDate(d) }));
  console.log('Fechas con scores:', scored);
  
  const sorted = scored.sort((a, b) => {
    if (b.s !== a.s) return b.s - a.s;
    // desempate: futura más cercana
    const da = Math.abs(new Date(a.d.iso).getTime() - Date.now());
    const db = Math.abs(new Date(b.d.iso).getTime() - Date.now());
    return da - db;
  });

  const best = sorted[0]?.d ?? null;
  console.log('Mejor fecha seleccionada:', best);
  return best;
}