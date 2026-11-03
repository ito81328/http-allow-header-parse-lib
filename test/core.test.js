import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAllowHeader, isKnownMethod } from '../src/index.js';

test('parses a simple list', () => {
  const got = parseAllowHeader('GET, POST');
  assert.deepEqual([...got].sort(), ['GET', 'POST']);
});

test('tolerates arbitrary whitespace around tokens', () => {
  const got = parseAllowHeader('  GET ,\tPOST ,  PUT ');
  assert.deepEqual([...got].sort(), ['GET', 'POST', 'PUT']);
});

test('collapses duplicate methods', () => {
  const got = parseAllowHeader('GET, GET, POST, GET');
  assert.deepEqual([...got].sort(), ['GET', 'POST']);
});

test('empty header yields an empty set', () => {
  assert.deepEqual([...parseAllowHeader('')], []);
  assert.deepEqual([...parseAllowHeader('   ')], []);
});

test('rejects unknown methods', () => {
  assert.throws(() => parseAllowHeader('GET, BREW'), /Unknown HTTP method: BREW/);
});

test('rejects empty tokens between commas', () => {
  assert.throws(() => parseAllowHeader('GET,,POST'), /empty method token/);
  assert.throws(() => parseAllowHeader('GET,'), /empty method token/);
});

test('rejects non-string input', () => {
  assert.throws(() => parseAllowHeader(null), TypeError);
  assert.throws(() => parseAllowHeader(42), TypeError);
});

test('isKnownMethod reports registry membership', () => {
  assert.equal(isKnownMethod('GET'), true);
  assert.equal(isKnownMethod('PATCH'), true);
  assert.equal(isKnownMethod('get'), false);
  assert.equal(isKnownMethod('BREW'), false);
  assert.equal(isKnownMethod(''), false);
  assert.equal(isKnownMethod(null), false);
});

test('result is a Set, not an array', () => {
  const got = parseAllowHeader('GET');
  assert.ok(got instanceof Set);
  assert.equal(got.has('GET'), true);
});
