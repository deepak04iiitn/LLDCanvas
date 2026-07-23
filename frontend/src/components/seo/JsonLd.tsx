// Shared JSON-LD injector. Escapes `<` so a value containing `</script>`
// can't break out of the script tag — the existing pattern on app/page.tsx
// didn't do this; every new page should.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    // eslint-disable-next-line react/no-danger
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  )
}
