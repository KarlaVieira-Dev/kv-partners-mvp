// lib/google-sheets/error-handler.ts
// Tratamento padronizado de erros de acesso ao Google Sheets.
// Garante que falhas de rede, cota ou autenticação
// retornem mensagens claras em vez de crashes genéricos.

export class SheetError extends Error {
  constructor(
    message: string,
    public readonly code: 'AUTH' | 'QUOTA' | 'NOT_FOUND' | 'NETWORK' | 'PARSE',
    public readonly sheet?: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'SheetError'
  }
}

export function handleSheetError(error: unknown, sheet: string): never {
  if (error instanceof SheetError) throw error

  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('PERMISSION_DENIED') || message.includes('401')) {
    throw new SheetError(
      `Sem permissão para acessar ${sheet}. Verifique as credenciais.`,
      'AUTH', sheet, error
    )
  }

  if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    throw new SheetError(
      `Cota do Google Sheets excedida ao acessar ${sheet}. Aguarde e tente novamente.`,
      'QUOTA', sheet, error
    )
  }

  if (message.includes('404') || message.includes('NOT_FOUND')) {
    throw new SheetError(
      `Aba não encontrada: ${sheet}. Verifique o nome da aba na planilha.`,
      'NOT_FOUND', sheet, error
    )
  }

  throw new SheetError(
    `Erro ao ler ${sheet}: ${message}`,
    'NETWORK', sheet, error
  )
}

/**
 * Versão segura: retorna fallback em vez de lançar erro.
 * Use para dados não-críticos onde ausência é aceitável.
 */
export async function safeSheetRead<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> {
  try {
    return await fetcher()
  } catch (error) {
    console.error(`[SheetError] ${context}:`, error)
    return fallback
  }
}
