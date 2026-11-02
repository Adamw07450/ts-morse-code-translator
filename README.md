# ts-morse-code-translator

Encode and decode International Morse Code with explicit dot-dash sequences and separators.

```js
import { encode, decode } from 'ts-morse-code-translator';

encode('SOS');
// '... --- ...'

decode('.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
// 'HELLO WORLD'
```

The package is ESM-only and has no dependencies.

## Why this exists

Most Morse snippets online either concatenate everything without separators, or
invent a private convention for word breaks. This library fixes one convention:
a single space between letters and ` / ` between words. That makes the output
unambiguous and round-trippable, at the cost of being slightly more verbose than
Morse written by hand.

## The awkward edge

Characters outside the International Morse alphabet throw a `MorseError` instead
of being skipped. For example, `encode('HELLOé')` fails rather than quietly
dropping the `é`. Silent loss is harder to notice than an exception, and a
translator that changes its input without saying so is a bug factory.

## API

### `encode(text)`

Returns the Morse representation of `text`. Input is uppercased, so `'sos'` and
`'SOS'` produce the same result. Whitespace runs collapse to a single word break.
Throws `MorseError` for non-string input or unsupported characters.

### `decode(morse)`

Returns uppercase plain text. Tokens are dot-dash sequences; a lone `/` token is
a word boundary. Extra whitespace is ignored. Throws `MorseError` for non-string
input or unknown tokens.

### `MorseError`

Subclass of `Error` thrown by both functions. `name` is `'MorseError'`.
