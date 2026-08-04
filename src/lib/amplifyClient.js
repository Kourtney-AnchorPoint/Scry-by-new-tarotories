import { generateClient } from 'aws-amplify/data';

// Lazy singleton: generateClient() reads Amplify's config at call time, and
// ES module import graphs resolve depth-first — everything this module's
// importers transitively pull in (including this file) evaluates BEFORE
// main.jsx's own body runs, which is where Amplify.configure() happens. A
// top-level `generateClient()` call here would therefore always run before
// configure() and permanently bind to an unconfigured client. Deferring
// creation to first real use (well after module evaluation, during a React
// effect or event handler) guarantees configure() has already run.
let _client = null;
function getClient() {
  if (!_client) _client = generateClient();
  return _client;
}

export const client = new Proxy(
  {},
  {
    get(_target, prop) {
      return getClient()[prop];
    },
  }
);
