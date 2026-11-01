// Core Morse code translation logic.
//
// Design decisions:
//   - Letters are separated by a single space in the wire format.
//   - Words are separated by " / " (space slash space).
//   - Unsupported characters throw MorseError instead of being silently dropped,
//     because silent data loss is worse than a loud failure for a translator.
//   - Decoding is case-insensitive for the Morse alphabet and tolerant of
//     irregular whitespace around tokens, but it still rejects unknown tokens.

const LETTER_TO_MORSE = Object.freeze({
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  0: '-----',
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  '_': '..--.-',
  '"': '.-..-.',
  '$': '...-..-',
  '@': '.--.-.',
});

// Built once at module load so decode is O(1) per token instead of scanning
// the forward map on every character.
const MORSE_TO_LETTER = Object.freeze(
  Object.fromEntries(
    Object.entries(LETTER_TO_MORSE).map(([letter, morse]) => [morse, letter])
  )
);

/**
 * Error thrown when a character cannot be encoded or a Morse token cannot be decoded.
 *
 * A dedicated subclass lets callers distinguish translation failures from
 * programming errors without string matching on the message.
 */
export class MorseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MorseError';
  }
}

/**
 * Encode plain text into International Morse Code.
 *
 * Letters are separated by a single space. Words are separated by " / ".
 * Input is uppercased before lookup, so 'sos' and 'SOS' produce the same output.
 *
 * @param {string} text - Plain text to encode.
 * @returns {string} Morse code with letter and word separators.
 * @throws {MorseError} If text is not a string or contains an unsupported character.
 */
export function encode(text) {
  if (typeof text !== 'string') {
    throw new MorseError(`encode expects a string, received ${typeof text}`);
  }

  const words = text.toUpperCase().split(/\s+/).filter((word) => word.length > 0);

  if (words.length === 0) {
    return '';
  }

  return words
    .map((word) =>
      Array.from(word)
        .map((character) => {
          const morse = LETTER_TO_MORSE[character];
          if (morse === undefined) {
            throw new MorseError(`Cannot encode character: ${JSON.stringify(character)}`);
          }
          return morse;
        })
        .join(' ')
    )
    .join(' / ');
}

/**
 * Decode International Morse Code back into plain text.
 *
 * Accepts the output of {@link encode}. Tokens are the dot-dash sequences;
 * a lone "/" token marks a word boundary. Extra whitespace between tokens is
 * tolerated so hand-written Morse with uneven spacing still decodes.
 *
 * @param {string} morse - Morse code to decode.
 * @returns {string} Decoded uppercase text.
 * @throws {MorseError} If morse is not a string or contains an unknown token.
 */
export function decode(morse) {
  if (typeof morse !== 'string') {
    throw new MorseError(`decode expects a string, received ${typeof morse}`);
  }

  const trimmed = morse.trim();
  if (trimmed === '') {
    return '';
  }

  const tokens = trimmed.split(/\s+/);
  const words = [];
  let currentWord = [];

  for (const token of tokens) {
    if (token === '/') {
      if (currentWord.length > 0) {
        words.push(currentWord.join(''));
        currentWord = [];
      }
      continue;
    }

    const letter = MORSE_TO_LETTER[token];
    if (letter === undefined) {
      throw new MorseError(`Cannot decode token: ${JSON.stringify(token)}`);
    }
    currentWord.push(letter);
  }

  if (currentWord.length > 0) {
    words.push(currentWord.join(''));
  }

  return words.join(' ');
}
