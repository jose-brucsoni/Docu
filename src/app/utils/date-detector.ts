
const EXPIRY_KEYWORDS = [
  'expira', 'expiración', 'expiracion', 'vence', 'vencimiento', 'caduca', 'caducidad'
];


export interface DetectedDate {
  raw: string;
  iso: string;
}


export function extractExpiryDates(text: string): DetectedDate[] {
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
    if (new Date(iso).getTime() >= Date.now() - 24 * 3600 * 1000) {
      results.push({ raw, iso });
    }
  };

  const t = text.toLowerCase();

  const reDMY = /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/g;
  for (const m of t.matchAll(reDMY)) {
    const dd = +m[1], mm = +m[2], yyyy = fixYear(+m[3]);
    if (validDMY(dd, mm, yyyy)) add(m[0], yyyy, mm, dd);
  }

  const reLong = new RegExp(
    String.raw`\b(\d{1,2})\s*(?:de\s*)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre|ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\s*(?:de\s*)?(\d{2,4})\b`,
    'g'
  );
  for (const m of t.matchAll(reLong)) {
    const dd = +m[1], mm = months[m[2]], yyyy = fixYear(+m[3]);
    if (validDMY(dd, mm, yyyy)) add(m[0], yyyy, mm, dd);
  }

  const reMY = /\b(\d{1,2})[\/\-](\d{2})\b/g;
  for (const m of t.matchAll(reMY)) {
    const mm = +m[1], yyyy = fixYear(+m[2]);
    if (mm >= 1 && mm <= 12) add(m[0], yyyy, mm, 28);
  }

  const uniq = new Map(results.map(r => [r.iso, r]));
  return Array.from(uniq.values()).sort((a,b)=>+new Date(a.iso)-+new Date(b.iso));
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
  if (!dates.length) return null;

  const t = text.toLowerCase();

  // índice de aparición de cada "raw" en el texto (primera coincidencia)
  const withIndex = dates.map(d => {
    const idx = t.indexOf(d.raw.toLowerCase());
    return { ...d, idx };
  });

  // función para calcular score: más alto si está cerca de keywords
  function scoreDate(d: { raw: string; iso: string; idx: number }) {
    let base = 0;
    // ventana de 60 caracteres alrededor de la coincidencia
    const start = Math.max(0, d.idx - 60);
    const end   = Math.min(t.length, d.idx + d.raw.length + 60);
    const window = t.slice(start, end);

    for (const kw of EXPIRY_KEYWORDS) {
      if (window.includes(kw)) base += 5; // cerca de “expiración/vence/caduca…”
    }

    // bonus por ser futura y próxima (cuanto más cerca, mayor score)
    const ms = new Date(d.iso).getTime() - Date.now();
    if (ms >= 0) {
      const days = ms / (1000 * 60 * 60 * 24);
      // mapea proximidad a 0..5 (más cerca ⇒ más puntos)
      const proximity = Math.max(0, 5 - Math.min(5, days / 90));
      base += proximity;
    } else {
      base -= 3; // penaliza fechas en el pasado
    }

    return base;
  }

  // escoge la de mayor score; si empatan, la futura más cercana
  const sorted = withIndex
    .map(d => ({ d, s: scoreDate(d) }))
    .sort((a, b) => {
      if (b.s !== a.s) return b.s - a.s;
      // desempate: futura más cercana
      const da = Math.abs(new Date(a.d.iso).getTime() - Date.now());
      const db = Math.abs(new Date(b.d.iso).getTime() - Date.now());
      return da - db;
    });

  return sorted[0]?.d ?? null;
}