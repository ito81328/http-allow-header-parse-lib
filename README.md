# http-allow-header-parse-lib

Parses the HTTP `Allow` header into a `Set` of permitted HTTP methods, validating each method against the standard IANA HTTP Method Registry.

```js
import { parseAllowHeader, isKnownMethod } from './src/index.js';

const allowed = parseAllowHeader('GET, HEAD, OPTIONS');
console.log(allowed.has('GET')); // true
console.log(allowed.has('POST')); // false

console.log(isKnownMethod('PATCH')); // true
console.log(isKnownMethod('BREW')); // false
```

## Why this exists

The `Allow` header is a comma-separated list of methods, but real-world values are inconsistent about whitespace, ordering, and duplicates. A naive `split(',')` leaves padding and repeated entries in place, and it silently accepts tokens that no server should ever advertise. This library normalizes the list into a `Set` and rejects anything outside the standard registry, so callers get a clean, validated view of what a resource actually permits.

The trade-off is strictness: extension methods (WebDAV's `PROPFIND`, custom vendor tokens) are rejected with an `Error` rather than passed through. Callers who need to accept extensions must filter them before calling. That keeps the library small and makes the validation meaningful, at the cost of not being a general-purpose token parser.

## The awkward edge

A trailing comma (`"GET,"`) is not a valid `Allow` value, but it is easy to produce and easy to overlook. This library treats it as an empty method token and throws, rather than quietly returning `{"GET"}`. The same applies to an empty header: `""` and `"   "` both return an empty `Set`, which means "nothing is allowed" and is distinct from a header that failed to parse.
