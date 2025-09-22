;; Highlight YAML frontmatter using the YAML grammar.

(frontmatter
  body: (frontmatter_body) @injection.content
  (#set! injection.language "yaml")
  (#set! injection.combined))
