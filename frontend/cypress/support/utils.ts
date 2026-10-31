export function generateLogin(prefix = 'u') {
  // Date.now() в base36 дает компактную строку, например: m1z8y2a
  const randomStr = Date.now().toString(36).slice(-6); 
  // Итог: u_m1z8y2a (8 символов) - идеально подходит под regex
  return `${prefix}_${randomStr}`; 
}

export function generateEmail(prefix = 'test') {
  return `${prefix}_${Date.now()}@example.com`;
}