// Public entry point for ts-morse-code-translator.
//
// Keeping the barrel file thin means the core module can be imported directly
// by tests and by consumers who only need the pure functions.
export { encode, decode, MorseError } from './core.js';
