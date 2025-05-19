"use strict";
/**
 * JWT Verification Module
 *
 * A universal module for verifying JWTs using HS256 or HS512 algorithms
 * that works in both browser and Node.js environments.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crypto = exports.decodeJWT = exports.verifySignature = exports.jwtVerify = void 0;
// Isomorphic base64url handling and crypto implementation
const crypto = (function () {
    // Detect environment
    const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
    // Return appropriate implementation
    if (isNode) {
        // Node.js implementation
        const nodeCrypto = require('crypto');
        return {
            isNode: true,
            // Sign data with HMAC
            hmacSign(algorithm, key, data) {
                return __awaiter(this, void 0, void 0, function* () {
                    const hashAlg = algorithm === 'HS256' ? 'sha256' : 'sha512';
                    const hmac = nodeCrypto.createHmac(hashAlg, key);
                    hmac.update(data);
                    return hmac.digest();
                });
            },
            // Constant-time buffer comparison
            timingSafeEqual(a, b) {
                if (a.length !== b.length)
                    return false;
                try {
                    return nodeCrypto.timingSafeEqual(a, b);
                }
                catch (e) {
                    // Fallback if buffers are different lengths
                    return false;
                }
            },
            // String to buffer
            textToBuffer(text) {
                return Buffer.from(text);
            },
            // Buffer to string
            bufferToText(buffer) {
                return buffer.toString('utf8');
            },
            // Base64url decode to buffer
            base64UrlToBuffer(base64url) {
                const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
                const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
                return Buffer.from(paddedBase64, 'base64');
            },
            // Base64url decode to string
            base64UrlDecode(base64url) {
                return this.bufferToText(this.base64UrlToBuffer(base64url));
            },
            // Buffer to base64url
            bufferToBase64Url(buffer) {
                return buffer.toString('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=/g, '');
            }
        };
    }
    else {
        // Browser implementation
        return {
            isNode: false,
            // Sign data with HMAC
            hmacSign(algorithm, key, data) {
                return __awaiter(this, void 0, void 0, function* () {
                    const hashAlg = algorithm === 'HS256' ? 'SHA-256' : 'SHA-512';
                    const encoder = new TextEncoder();
                    const keyBuffer = encoder.encode(key);
                    const dataBuffer = encoder.encode(data);
                    const cryptoKey = yield window.crypto.subtle.importKey('raw', keyBuffer, { name: 'HMAC', hash: { name: hashAlg } }, false, ['sign']);
                    return window.crypto.subtle.sign({ name: 'HMAC', hash: { name: hashAlg } }, cryptoKey, dataBuffer);
                });
            },
            // Constant-time buffer comparison
            // Note: Not truly constant-time in browser, but close enough for most use cases
            timingSafeEqual(a, b) {
                if (a.byteLength !== b.byteLength)
                    return false;
                const a8 = new Uint8Array(a);
                const b8 = new Uint8Array(b);
                let result = 0;
                for (let i = 0; i < a8.length; i++) {
                    result |= a8[i] ^ b8[i];
                }
                return result === 0;
            },
            // String to buffer
            textToBuffer(text) {
                return new TextEncoder().encode(text);
            },
            // Buffer to string
            bufferToText(buffer) {
                return new TextDecoder().decode(buffer instanceof Buffer ? new Uint8Array(buffer) : buffer);
            },
            // Base64url decode to buffer
            base64UrlToBuffer(base64url) {
                const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
                const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
                const binary = atob(paddedBase64);
                const buffer = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    buffer[i] = binary.charCodeAt(i);
                }
                return buffer;
            },
            // Base64url decode to string
            base64UrlDecode(base64url) {
                return this.bufferToText(this.base64UrlToBuffer(base64url));
            },
            // Buffer to base64url
            bufferToBase64Url(buffer) {
                const bytes = buffer instanceof Buffer ? new Uint8Array(buffer) : new Uint8Array(buffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return btoa(binary)
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=/g, '');
            }
        };
    }
})();
exports.crypto = crypto;
/**
 * Verifies a JWT token and returns the payload if valid.
 *
 * @param token - The JWT token to verify
 * @param secret - The secret key used to sign the token
 * @param options - Optional verification parameters
 * @returns The decoded payload if verification succeeds
 * @throws Error - If verification fails for any reason
 */
function jwtVerify(token, secret, options = {}) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // Default options
        const opts = Object.assign({ algorithms: ['HS256', 'HS512'] }, options);
        // Split the token into parts
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }
        const [headerB64, payloadB64, signatureB64] = parts;
        // Decode the header
        const header = JSON.parse(crypto.base64UrlDecode(headerB64));
        // Check if the algorithm is supported
        const { alg } = header;
        if (!((_a = opts.algorithms) === null || _a === void 0 ? void 0 : _a.includes(alg))) {
            throw new Error(`Algorithm not supported: ${alg}`);
        }
        // Verify the signature
        const data = `${headerB64}.${payloadB64}`;
        const isValid = yield verifySignature(data, signatureB64, secret, alg);
        if (!isValid) {
            throw new Error('Invalid signature');
        }
        // Decode and verify the payload
        const payload = JSON.parse(crypto.base64UrlDecode(payloadB64));
        // Verify expiration if present
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            throw new Error('Token has expired');
        }
        // Verify not before if present
        if (payload.nbf && Date.now() < payload.nbf * 1000) {
            throw new Error('Token not yet valid');
        }
        return payload;
    });
}
exports.jwtVerify = jwtVerify;
/**
 * Verifies the signature of a JWT
 *
 * @param data - The data that was signed (header.payload)
 * @param signatureB64 - The base64url encoded signature
 * @param secret - The secret key
 * @param algorithm - The algorithm used (HS256 or HS512)
 * @returns True if signature is valid
 */
function verifySignature(data, signatureB64, secret, algorithm) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate the expected signature
        const expectedSignature = yield crypto.hmacSign(algorithm, secret, data);
        // Get the actual signature
        const actualSignature = crypto.base64UrlToBuffer(signatureB64);
        // Compare signatures in constant time
        return crypto.timingSafeEqual(actualSignature, crypto.isNode ? expectedSignature : new Uint8Array(expectedSignature));
    });
}
exports.verifySignature = verifySignature;
/**
 * Decodes a JWT without verifying its signature
 *
 * @param token - The JWT token
 * @returns The decoded parts of the token (header and payload)
 * @throws Error - If the token format is invalid
 */
function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token format');
    }
    const [headerB64, payloadB64] = parts;
    return {
        header: JSON.parse(crypto.base64UrlDecode(headerB64)),
        payload: JSON.parse(crypto.base64UrlDecode(payloadB64))
    };
}
exports.decodeJWT = decodeJWT;
