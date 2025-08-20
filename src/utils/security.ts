/**
 * Utilitários de segurança centralizados
 */

// Rate limiting para tentativas de autenticação
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function isRateLimited(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const attempts = authAttempts.get(identifier);
  
  if (!attempts) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return false;
  }
  
  // Reset se janela de tempo passou
  if (now - attempts.lastAttempt > windowMs) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return false;
  }
  
  if (attempts.count >= maxAttempts) {
    return true;
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  return false;
}

// Limpeza de dados sensíveis de logs
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitive = ['password', 'token', 'key', 'secret', 'auth', 'credential'];
  const sanitized = { ...data };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

// Detecção de padrões suspeitos
export function detectAnomalousPattern(amount: number, userId: string): boolean {
  // Implementar lógica de detecção de padrões anômalos
  // Por exemplo: transações muito altas, fora do padrão habitual
  
  // Valor muito alto pode ser suspeito
  if (amount > 100000) {
    console.warn(`Transação de valor alto detectada para usuário ${userId}: R$ ${amount}`);
    return true;
  }
  
  return false;
}

// Validação de origem da requisição
export function validateRequestOrigin(origin: string | null): boolean {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://jbbgmcdejwrmvyqmbtse.supabase.co',
    window.location.origin
  ];
  
  return origin ? allowedOrigins.includes(origin) : false;
}

// Geração de hash para audit logs
export function generateAuditHash(data: string): string {
  // Simples hash para auditoria (em produção usar crypto mais robusto)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Log de segurança centralizado
export function securityLog(event: string, details: any, level: 'info' | 'warn' | 'error' = 'info') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details: sanitizeForLogging(details),
    level,
    userAgent: navigator.userAgent,
    origin: window.location.origin
  };
  
  console[level]('[SECURITY]', logEntry);
  
  // Em produção, enviar para serviço de monitoramento
  // await sendToSecurityMonitoring(logEntry);
}

// Verificação de integridade de dados financeiros
export function validateFinancialData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Verificar se valores monetários são válidos
  const monetaryFields = ['amount', 'value', 'balance', 'total'];
  
  for (const field of monetaryFields) {
    if (field in data) {
      const value = data[field];
      if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        securityLog('invalid_financial_data', { field, value }, 'warn');
        return false;
      }
      
      // Verificar valores extremos
      if (value < -1000000 || value > 1000000000) {
        securityLog('extreme_financial_value', { field, value }, 'warn');
        return false;
      }
    }
  }
  
  return true;
}