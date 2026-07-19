// TypeScript rewrites `import()` in CommonJS output into
// `Promise.resolve().then(() => require(...))`, which still crashes when the
// target package is ESM-only (e.g. better-auth). Building the Function from a
// string hides the `import()` call from tsc's transform, so it stays a real
// dynamic import at runtime.
const rawDynamicImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string
) => Promise<unknown>

export function dynamicImport<T = unknown>(specifier: string): Promise<T> {
  return rawDynamicImport(specifier) as Promise<T>
}
