
/**
 * Validações reutilizáveis para formulários com foco em segurança
 */

// Validação de números positivos
export function isPositiveNumber(val: any): boolean {
  return typeof val === "number" && !isNaN(val) && val > 0 && isFinite(val);
}

// Validação de data segura
export function isValidDateString(dateStr: string): boolean {
  if (typeof dateStr !== "string" || dateStr.length > 50) return false;
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100;
}

// Validação de email segura
export function isValidEmail(email: string): boolean {
  if (typeof email !== "string" || email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Validação de texto seguro (previne XSS)
export function sanitizeText(text: string): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/[<>'"&]/g, (char) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .slice(0, 1000); // Limitar tamanho
}

// Validação de valor monetário
export function isValidCurrency(val: any): boolean {
  if (typeof val !== "number") return false;
  return !isNaN(val) && isFinite(val) && val >= 0 && val <= 999999999.99;
}

// Validação de senha forte
export function isStrongPassword(password: string): boolean {
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return false;
  }
  
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasLowerCase && hasUpperCase && hasNumbers && hasSpecialChar;
}

// Validação de ID UUID
export function isValidUUID(id: string): boolean {
  if (typeof id !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
