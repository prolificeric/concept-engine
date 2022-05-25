let nodeCrypto = null;

try {
  nodeCrypto = require('node:crypto');
} catch (err) {}

export const subtle =
  (globalThis as any).crypto?.subtle || nodeCrypto?.webcrypto.subtle;
