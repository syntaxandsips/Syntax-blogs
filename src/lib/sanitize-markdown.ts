import sanitizeHtml from 'sanitize-html'

type AllowedAttribute = sanitizeHtml.AllowedAttribute

const allowedSchemes = ['http', 'https', 'mailto']

const baseAllowedTags = sanitizeHtml.defaults.allowedTags ?? []
const extendedAllowedTags = Array.from(
  new Set([...baseAllowedTags, 'div', 'span']),
)

const baseAllowedAttributes = sanitizeHtml.defaults.allowedAttributes ?? {}

const extendAttributes = (tag: string, attributes: AllowedAttribute[]) => {
  const existing = baseAllowedAttributes[tag] ?? []
  const merged = new Set<AllowedAttribute>([...existing, ...attributes])

  return Array.from(merged)
}

export const sanitizeMarkdown = (input: string) =>
  sanitizeHtml(input, {
    allowedTags: extendedAllowedTags,
    allowedSchemes,
    allowedAttributes: {
      ...baseAllowedAttributes,
      a: extendAttributes('a', ['href', 'title', 'target', 'rel']),
      img: extendAttributes('img', ['src', 'alt', 'title', 'width', 'height']),
      code: extendAttributes('code', ['class']),
      span: extendAttributes('span', ['class']),
      div: extendAttributes('div', ['class']),
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  })
