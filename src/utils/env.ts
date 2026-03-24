export function getEnvString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}
