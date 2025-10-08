import sanitizeHtml from 'sanitize-html'

const allowedSchemes = ['http', 'https', 'mailto']

export const sanitizeMarkdown = (input: string) =>
  sanitizeHtml(input, {
    allowedTags: false,
    allowedSchemes,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      code: ['class'],
      span: ['class'],
      div: ['class'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  })
