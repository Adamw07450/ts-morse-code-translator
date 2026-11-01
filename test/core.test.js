import test from 'node:test';
import assert from 'node:assert/strict';

import { encode, decode, MorseError } from '../src/index.js';

test('encode converts a single letter', () => {
  assert.equal(encode('S'), '...');
});

test('encode is case-insensitive', () => {
  assert.equal(encode('sos'), '... --- ...');
  assert.equal(encode('SOS'), '... --- ...');
});

test('encode separates words with a slash token', () => {
  assert.equal(encode('HELLO WORLD'), '.... . .-.. .-.. --- / .-- --- .-. .-.. -..');
});

test('encode collapses runs of whitespace between words', () => {
  assert.equal(encode('A   B'), '.- / -...');
});

test('encode returns an empty string for empty or whitespace-only input', () => {
  assert.equal(encode(''), '');
  assert.equal(encode('   '), '');
});

test('encode rejects unsupported characters', () => {
  assert.throws(() => encode('A#B'), MorseError);
});

test('encode rejects non-string input', () => {
  assert.throws(() => encode(42), MorseError);
});

test('decode converts a single token', () => {
  assert.equal(decode('...'), 'S');
});

test('decode handles word boundaries', () => {
  assert.equal(decode('.... . .-.. .-.. --- / .-- --- .-. .-.. -..'), 'HELLO WORLD');
});

test('decode tolerates irregular whitespace', () => {
  assert.equal(decode('  ...   ---   ...  '), 'SOS');
});

test('decode returns an empty string for empty or whitespace-only input', () => {
  assert.equal(decode(''), '');
  assert.equal(decode('   '), '');
});

test('decode rejects unknown tokens', () => {
  assert.throws(() => decode('... ..-..'), MorseError);
});

test('decode rejects non-string input', () => {
  assert.throws(() => decode(null), MorseError);
});

test('round-trips a sentence with punctuation and digits', () => {
  const original = 'THE QUICK BROWN FOX JUMPS OVER 2 LAZY DOGS!';
  assert.equal(decode(encode(original)), original);
});

test('round-trips a single unsupported character by throwing', () => {
  assert.throws(() => encode('HELLO\u00E9'), MorseError);
});
