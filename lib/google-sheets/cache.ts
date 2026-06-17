he · TS
// lib/google-sheets/cache.ts
// Cache em memória com TTL.
// Compatível com o modelo do Render (serviço sempre ativo).
// Em migração futura para serverless, substituir por Redis.
 
interface CacheEntry<T> {
  data: T
  expiresAt: number
}
 
class SheetCache {
  private store = new Map<string, CacheEntry<unknown>>()
 
  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }
 
  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs })
  }
 
  invalidate(keyPrefix: string): void {
    const keys = Array.from(this.store.keys())
    for (const key of keys) {
      if (key.startsWith(keyPrefix)) this.store.delete(key)
    }
  }
 
  clear(): void {
    this.store.clear()
  }
 
  get size(): number {
    return this.store.size
  }
}
 
// Singleton — compartilhado entre requests no mesmo processo Node
export const sheetCache = new SheetCache()
 
// TTLs por tipo de dado
export const CACHE_TTL = {
  ACCOUNTS:         5  * 60 * 1000,
  IOI_SCORES:       5  * 60 * 1000,
  ONBOARDINGS:      2  * 60 * 1000,
  EVENTS:           1  * 60 * 1000,
  MGI_INSIGHTS:     10 * 60 * 1000,
  EXECUTIVE_CENTER: 5  * 60 * 1000,
} as const
 
/** Busca do cache ou executa o fetcher e armazena o resultado */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = sheetCache.get<T>(key)
  if (cached !== null) return cached
 
  const data = await fetcher()
  sheetCache.set(key, data, ttlMs)
  return data
}
 
