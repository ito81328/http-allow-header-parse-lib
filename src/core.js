// HTTP Allow header parsing, restricted to the IANA HTTP Method Registry.
//
// The registry is encoded as a frozen Set for O(1) lookup and to make it
// impossible for callers to mutate the set of recognized methods at runtime.
// The list below is the set of methods defined in RFC 9110 plus the methods
// registered in the IANA registry as of this writing. Extension methods are
// deliberately rejected: the whole point of this library is to validate
// against the standard registry, so accepting arbitrary tokens would defeat it.
const KNOWN_METHODS = Object.freeze(
  new Set([
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'DELETE',
    'CONNECT',
    'OPTIONS',
    'TRACE',
    'PATCH',
  ]),
);

/**
 * Returns true when `method` is a method defined in the standard registry.
 *
 * @param {string} method
 * @returns {boolean}
 */
export function isKnownMethod(method) {
  return typeof method === 'string' && KNOWN_METHODS.has(method);
}

/**
 * Parse an HTTP Allow header value into a Set of permitted methods.
 *
 * The Allow header is a comma-separated list of methods (RFC 9110 §10.2.1).
 * Whitespace around each entry is insignificant. Duplicate methods collapse
 * into a single set entry. An empty header value yields an empty Set, which
 * matches the semantics of "no methods are allowed".
 *
 * Unknown methods are rejected with an Error rather than silently ignored.
 * This is the central trade-off of the library: callers who want to accept
 * vendor extensions must strip or map them before calling.
 *
 * @param {string} header
 * @returns {Set<string>}
 * @throws {TypeError} when `header` is not a string.
 * @throws {Error} when a token is empty or not in the standard registry.
 */
export function parseAllowHeader(header) {
  if (typeof header !== 'string') {
    throw new TypeError('Allow header must be a string');
  }

  const result = new Set();
  const trimmed = header.trim();
  if (trimmed === '') {
    return result;
  }

  const parts = trimmed.split(',');
  for (const part of parts) {
    const method = part.trim();
    if (method === '') {
      throw new Error('Allow header contains an empty method token');
    }
    if (!KNOWN_METHODS.has(method)) {
      throw new Error(`Unknown HTTP method: ${method}`);
    }
    result.add(method);
  }
  return result;
}
