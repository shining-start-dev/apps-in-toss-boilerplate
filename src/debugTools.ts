const isDebugToolsEnabledByEnv = String(import.meta.env.VITE_ENABLE_DEBUG_TOOLS ?? '').trim()

export const ENABLE_DEBUG_TOOLS =
  import.meta.env.DEV || isDebugToolsEnabledByEnv.toLowerCase() === 'true'
