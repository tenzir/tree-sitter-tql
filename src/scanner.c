// Recognizes format strings that never close.
//
// A format string's replacements are expressions, whose strings, comments,
// and braces may hold quotes of their own, so whether a format string closes
// is beyond the grammar's lexer. This scanner looks ahead from `f"` and, if the
// input ends before the closing quote, returns the rest of the input as one
// token. Editors then see a format string while it is being typed instead of
// an error followed by code. Format strings that close are left to the
// grammar.

#include "tree_sitter/parser.h"

#include <stdbool.h>
#include <stdint.h>

enum TokenType {
  UNTERMINATED_FORMAT_EXPR,
};

// The outcome of skipping a literal.
typedef enum {
  CLOSED,
  UNCLOSED,
  // Nested too deeply to tell, which leaves the literal to the grammar.
  UNKNOWN,
} Outcome;

// Bounds the recursion for format strings nested in replacements.
#define MAX_NESTING 64

// The number of hashes the grammar allows for raw strings.
#define MAX_HASHES 8

static inline void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

static inline bool is_word(int32_t c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
         (c >= '0' && c <= '9') || c == '_' || c == '$';
}

// Skips a plain or byte string from its opening quote, where a backslash
// escapes any character.
static Outcome skip_quoted(TSLexer *lexer) {
  int32_t quote = lexer->lookahead;
  advance(lexer);
  while (!lexer->eof(lexer)) {
    int32_t c = lexer->lookahead;
    advance(lexer);
    if (c == quote) {
      return CLOSED;
    }
    if (c == '\\') {
      if (lexer->eof(lexer)) {
        break;
      }
      advance(lexer);
    }
  }
  return UNCLOSED;
}

// Skips a raw string from its opening quote. It closes at the first quote
// followed by as many hashes as it opened with.
static Outcome skip_raw(TSLexer *lexer, unsigned hashes) {
  advance(lexer);
  while (!lexer->eof(lexer)) {
    if (lexer->lookahead != '"') {
      advance(lexer);
      continue;
    }
    advance(lexer);
    unsigned count = 0;
    while (count < hashes && lexer->lookahead == '#') {
      advance(lexer);
      count++;
    }
    if (count == hashes) {
      return CLOSED;
    }
  }
  return UNCLOSED;
}

// Skips a comment from its opening slash, given that a slash or star follows.
static Outcome skip_comment(TSLexer *lexer) {
  advance(lexer);
  if (lexer->lookahead == '/') {
    while (!lexer->eof(lexer) && lexer->lookahead != '\n') {
      advance(lexer);
    }
    return lexer->eof(lexer) ? UNCLOSED : CLOSED;
  }
  advance(lexer);
  bool star = false;
  while (!lexer->eof(lexer)) {
    int32_t c = lexer->lookahead;
    advance(lexer);
    if (star && c == '/') {
      return CLOSED;
    }
    star = c == '*';
  }
  return UNCLOSED;
}

static Outcome skip_format(TSLexer *lexer, unsigned nesting);

// Skips a word and, if it prefixes a raw or format string, the string after
// it. Returns CLOSED for a word that prefixes neither.
static Outcome skip_word(TSLexer *lexer, unsigned nesting) {
  // Only the words `r`, `br`, and `f` change how a string is read.
  char word[3] = {0};
  unsigned length = 0;
  while (is_word(lexer->lookahead)) {
    if (length < sizeof word) {
      word[length] = (char)lexer->lookahead;
    }
    length++;
    advance(lexer);
  }
  bool raw = (length == 1 && word[0] == 'r') ||
             (length == 2 && word[0] == 'b' && word[1] == 'r');
  if (raw) {
    unsigned hashes = 0;
    while (lexer->lookahead == '#') {
      advance(lexer);
      hashes++;
    }
    if (lexer->lookahead == '"' && hashes <= MAX_HASHES) {
      return skip_raw(lexer, hashes);
    }
    return CLOSED;
  }
  if (length == 1 && word[0] == 'f' && lexer->lookahead == '"') {
    return skip_format(lexer, nesting + 1);
  }
  // Any other quote, like that of a byte string, starts a plain string.
  return CLOSED;
}

// Skips a format string from its opening quote, including the expressions in
// its replacements.
static Outcome skip_format(TSLexer *lexer, unsigned nesting) {
  if (nesting > MAX_NESTING) {
    return UNKNOWN;
  }
  advance(lexer);
  // The depth of braces in the current replacement, 0 outside of one.
  unsigned braces = 0;
  while (!lexer->eof(lexer)) {
    int32_t c = lexer->lookahead;
    if (braces == 0) {
      advance(lexer);
      if (c == '"') {
        return CLOSED;
      }
      if (c == '\\') {
        if (lexer->eof(lexer)) {
          break;
        }
        advance(lexer);
      } else if (c == '{') {
        // `{{` stands for a brace, `{` starts a replacement.
        if (lexer->lookahead == '{') {
          advance(lexer);
        } else {
          braces = 1;
        }
      }
      continue;
    }
    Outcome outcome = CLOSED;
    if (c == '"' || c == '\'') {
      outcome = skip_quoted(lexer);
    } else if (is_word(c)) {
      outcome = skip_word(lexer, nesting);
    } else {
      advance(lexer);
      if (c == '{') {
        braces++;
      } else if (c == '}') {
        braces--;
      } else if (c == '/' &&
                 (lexer->lookahead == '/' || lexer->lookahead == '*')) {
        outcome = skip_comment(lexer);
      }
    }
    if (outcome != CLOSED) {
      return outcome;
    }
  }
  return UNCLOSED;
}

void *tree_sitter_tql_external_scanner_create(void) { return NULL; }

void tree_sitter_tql_external_scanner_destroy(void *payload) { (void)payload; }

unsigned tree_sitter_tql_external_scanner_serialize(void *payload,
                                                    char *buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}

void tree_sitter_tql_external_scanner_deserialize(void *payload,
                                                  const char *buffer,
                                                  unsigned length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

bool tree_sitter_tql_external_scanner_scan(void *payload, TSLexer *lexer,
                                           const bool *valid_symbols) {
  (void)payload;
  if (!valid_symbols[UNTERMINATED_FORMAT_EXPR]) {
    return false;
  }
  // Skip the whitespace and line continuations before the token, like the
  // grammar's extras.
  for (;;) {
    int32_t c = lexer->lookahead;
    if (c == ' ' || c == '\t' || c == '\r') {
      lexer->advance(lexer, true);
    } else if (c == '\\') {
      lexer->advance(lexer, true);
      while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
        lexer->advance(lexer, true);
      }
      if (lexer->lookahead != '\n') {
        return false;
      }
      lexer->advance(lexer, true);
    } else {
      break;
    }
  }
  if (lexer->lookahead != 'f') {
    return false;
  }
  advance(lexer);
  if (lexer->lookahead != '"') {
    return false;
  }
  if (skip_format(lexer, 0) != UNCLOSED) {
    return false;
  }
  lexer->result_symbol = UNTERMINATED_FORMAT_EXPR;
  return true;
}
