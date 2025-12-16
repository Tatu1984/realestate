import { describe, it, expect } from 'vitest'
import { sanitizeHTML, stripHtml } from '@/lib/sanitize'

describe('HTML Sanitization', () => {
  describe('sanitizeHTML', () => {
    it('should allow basic formatting tags', () => {
      const input = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeHTML(input)
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
    })

    it('should allow headings', () => {
      const input = '<h1>Title</h1><h2>Subtitle</h2>'
      const result = sanitizeHTML(input)
      expect(result).toContain('<h1>')
      expect(result).toContain('<h2>')
    })

    it('should allow links with safe attributes', () => {
      const input = '<a href="https://example.com">Link</a>'
      const result = sanitizeHTML(input)
      expect(result).toContain('href="https://example.com"')
      expect(result).toContain('target="_blank"')
      expect(result).toContain('rel="noopener noreferrer"')
    })

    it('should allow images with safe attributes', () => {
      const input = '<img src="https://example.com/image.jpg" alt="Test">'
      const result = sanitizeHTML(input)
      expect(result).toContain('src="https://example.com/image.jpg"')
      expect(result).toContain('alt="Test"')
    })

    it('should remove script tags', () => {
      const input = '<p>Safe</p><script>alert("XSS")</script>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
      expect(result).toContain('<p>Safe</p>')
    })

    it('should remove onclick handlers', () => {
      const input = '<button onclick="alert(1)">Click</button>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('onclick')
    })

    it('should remove onerror handlers', () => {
      const input = '<img src="x" onerror="alert(1)">'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('onerror')
    })

    it('should remove javascript: URLs', () => {
      const input = '<a href="javascript:alert(1)">Click</a>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('javascript:')
    })

    it('should remove data: URLs in links', () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">Click</a>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('data:text/html')
    })

    it('should allow data: URLs in images', () => {
      const input = '<img src="data:image/png;base64,abc123">'
      const result = sanitizeHTML(input)
      expect(result).toContain('data:image/png')
    })

    it('should remove iframe tags', () => {
      const input = '<iframe src="https://evil.com"></iframe>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('<iframe')
    })

    it('should remove form tags', () => {
      const input = '<form action="/steal"><input name="password"></form>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('<form')
      expect(result).not.toContain('<input')
    })

    it('should allow tables', () => {
      const input = '<table><tr><th>Header</th></tr><tr><td>Cell</td></tr></table>'
      const result = sanitizeHTML(input)
      expect(result).toContain('<table>')
      expect(result).toContain('<tr>')
      expect(result).toContain('<th>')
      expect(result).toContain('<td>')
    })

    it('should allow lists', () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>'
      const result = sanitizeHTML(input)
      expect(result).toContain('<ul>')
      expect(result).toContain('<li>')
    })

    it('should allow code blocks', () => {
      const input = '<pre><code>const x = 1;</code></pre>'
      const result = sanitizeHTML(input)
      expect(result).toContain('<pre>')
      expect(result).toContain('<code>')
    })

    it('should remove style tags', () => {
      const input = '<style>body { display: none; }</style><p>Content</p>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('<style>')
      expect(result).toContain('<p>Content</p>')
    })

    it('should remove SVG with embedded scripts', () => {
      const input = '<svg onload="alert(1)"><circle></circle></svg>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('<svg')
      expect(result).not.toContain('onload')
    })

    it('should handle nested XSS attempts', () => {
      const input = '<div><img src=x onerror=alert(1)//></div>'
      const result = sanitizeHTML(input)
      expect(result).not.toContain('onerror')
    })
  })

  describe('stripHtml', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>'
      const result = stripHtml(input)
      expect(result).toBe('Hello World')
    })

    it('should handle complex HTML', () => {
      const input = '<div><h1>Title</h1><p>Paragraph with <a href="#">link</a></p></div>'
      const result = stripHtml(input)
      expect(result).toBe('TitleParagraph with link')
    })

    it('should handle empty input', () => {
      const result = stripHtml('')
      expect(result).toBe('')
    })

    it('should handle plain text', () => {
      const input = 'Just plain text'
      const result = stripHtml(input)
      expect(result).toBe('Just plain text')
    })
  })
})
