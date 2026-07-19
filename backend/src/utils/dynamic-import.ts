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

// Vercel's build bundles a serverless function by statically tracing
// require()/import() calls (@vercel/nft) to decide which node_modules files
// to ship. Because the real import above goes through `new Function(...)`,
// the specifier is invisible to that static trace, so the ESM-only packages
// below would silently get excluded from the deployed bundle. This
// dead branch is never executed, but its literal require() calls give the
// tracer what it needs to include those packages (and their dependencies).
if (process.env.__NEVER_TRUE__) {
  require('better-auth')
  require('better-auth/node')
  require('better-auth/adapters/mongodb')
  require('better-auth/plugins')
}
