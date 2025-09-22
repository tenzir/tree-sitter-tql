;; Highlight YAML frontmatter using the YAML grammar.

(frontmatter
  (frontmatter_delimiter)
  (frontmatter_line)+ @injection.content
  (frontmatter_delimiter))
(#set! injection.language "yaml")
(#set! injection.combined)
