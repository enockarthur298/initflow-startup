// This file provides polyfills for Node.js built-in modules in Cloudflare Workers

// Polyfill for crypto
export const crypto = {
  // Implement minimal crypto functionality needed by your app
  // For example:
  randomBytes: (size) => {
    const array = new Uint8Array(size);
    crypto.getRandomValues(array);
    return array;
  },
  createHmac: () => {
    throw new Error('crypto.createHmac is not implemented in this environment');
  },
  // Add other methods as needed
};

// Polyfill for stream
export const stream = {
  Transform: class Transform {
    constructor() {
      throw new Error('stream.Transform is not implemented in this environment');
    }
  }
};