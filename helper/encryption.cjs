const { createCipheriv } = require('crypto');

/**
 * Encrypts data using AES-256-CBC
 * @param {string|Buffer} key - Encryption key
 * @param {string|Buffer} iv - Initialization vector (16 bytes)
 * @param {string} data - Data to encrypt
 * @returns {string} Base64-encoded encrypted data
 */
function encrypt(key, iv, data) {
    const algorithm = 'aes-256-cbc';
    const keyBuffer = normalizeKey(key, 32);
    const ivBuffer = normalizeIV(iv);
    const cipher = createCipheriv(algorithm, keyBuffer, ivBuffer);
    return cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
}

// Helper functions
function normalizeKey(key, length) {
    let keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(key);
    if (keyBuffer.length < length) {
        return Buffer.concat([keyBuffer, Buffer.alloc(length - keyBuffer.length)]);
    }
    return keyBuffer.slice(0, length);
}

function normalizeIV(iv) {
    const ivBuffer = Buffer.isBuffer(iv) ? iv : Buffer.from(iv);
    if (ivBuffer.length !== 16) {
        throw new Error('IV must be exactly 16 bytes');
    }
    return ivBuffer;
}

module.exports = { encrypt };