const { webcrypto } = require('node:crypto')

// Make Web Crypto API available globally for jose library
global.crypto = webcrypto
