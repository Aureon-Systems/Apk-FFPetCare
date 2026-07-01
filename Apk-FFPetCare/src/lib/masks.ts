// ─── Máscaras de input (padrão brasileiro) ───────────────────────────────────

export function onlyDigits(value: string): string {
  return (value ?? "").replace(/\D/g, "");
}

/** Aplica máscara de CPF: 000.000.000-00 */
export function maskCPF(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  let out = d;
  if (d.length > 9) out = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  else if (d.length > 6) out = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  else if (d.length > 3) out = `${d.slice(0, 3)}.${d.slice(3)}`;
  return out;
}

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(cpf[10]);
}

/** Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000 */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 0) return `(${d}`;
  return d;
}

/** Aplica máscara de data brasileira: DD/MM/AAAA (apenas para exibição/digitação) */
export function maskDateBR(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

/** Converte DD/MM/AAAA -> AAAA-MM-DD (ISO). Retorna null se inválido/incompleto. */
export function brDateToISO(value: string): string | null {
  const d = onlyDigits(value);
  if (d.length !== 8) return null;
  const day = d.slice(0, 2);
  const month = d.slice(2, 4);
  const year = d.slice(4, 8);
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return `${year}-${month}-${day}`;
}

/** Converte AAAA-MM-DD -> DD/MM/AAAA */
export function isoDateToBR(iso?: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
}

/** Aplica máscara de hora: HH:MM */
export function maskTime(value: string): string {
  const d = onlyDigits(value).slice(0, 4);
  if (d.length > 2) return `${d.slice(0, 2)}:${d.slice(2)}`;
  return d;
}

/** Permite apenas dígitos (e opcionalmente vírgula/ponto decimal) */
export function maskDecimal(value: string): string {
  return value.replace(/[^0-9.,]/g, "");
}