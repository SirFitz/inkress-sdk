/**
 * JWT Verification Module
 * 
 * A universal module for verifying JWTs using HS256 or HS512 algorithms
 * that works in both browser and Node.js environments.
 */

import { JWTVerifyOptions, JWTHeader, JWTPayload, DecodedJWT, JWTCrypto } from '../types';

// Isomorphic base64url handling and crypto implementation
const crypto: JWTCrypto = (function() {
    // Detect environment
    const isNode: boolean = typeof window === 'undefined' && typeof process !== 'undefined';
    
    // Return appropriate implementation
    if (isNode) {
      // Node.js implementation
      const nodeCrypto = require('crypto');
      
      return {
        isNode: true,
        
        // Sign data with HMAC
        async hmacSign(algorithm: string, key: string, data: string): Promise<Buffer> {
          const hashAlg = algorithm === 'HS256' ? 'sha256' : 'sha512';
          const hmac = nodeCrypto.createHmac(hashAlg, key);
          hmac.update(data);
          return hmac.digest();
        },
        
        // Constant-time buffer comparison
        timingSafeEqual(a: Buffer | Uint8Array, b: Buffer | Uint8Array): boolean {
          if (a.length !== b.length) return false;
          try {
            return nodeCrypto.timingSafeEqual(a, b);
          } catch (e) {
            // Fallback if buffers are different lengths
            return false;
          }
        },
        
        // String to buffer
        textToBuffer(text: string): Buffer {
          return Buffer.from(text);
        },
        
        // Buffer to string
        bufferToText(buffer: Buffer | Uint8Array): string {
          return buffer.toString('utf8');
        },
        
        // Base64url decode to buffer
        base64UrlToBuffer(base64url: string): Buffer {
          const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
          const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
          return Buffer.from(paddedBase64, 'base64');
        },
        
        // Base64url decode to string
        base64UrlDecode(base64url: string): string {
          return this.bufferToText(this.base64UrlToBuffer(base64url));
        },
        
        // Buffer to base64url
        bufferToBase64Url(buffer: Buffer | Uint8Array): string {
          return buffer.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        }
      };
    } else {
      // Browser implementation
      return {
        isNode: false,
        
        // Sign data with HMAC
        async hmacSign(algorithm: string, key: string, data: string): Promise<ArrayBuffer> {
          const hashAlg = algorithm === 'HS256' ? 'SHA-256' : 'SHA-512';
          const encoder = new TextEncoder();
          const keyBuffer = encoder.encode(key);
          const dataBuffer = encoder.encode(data);
          
          const cryptoKey = await window.crypto.subtle.importKey(
            'raw', 
            keyBuffer,
            { name: 'HMAC', hash: { name: hashAlg } },
            false,
            ['sign']
          );
          
          return window.crypto.subtle.sign(
            { name: 'HMAC', hash: { name: hashAlg } },
            cryptoKey,
            dataBuffer
          );
        },
        
        // Constant-time buffer comparison
        // Note: Not truly constant-time in browser, but close enough for most use cases
        timingSafeEqual(a: Uint8Array | Buffer, b: Uint8Array | Buffer): boolean {
          if (a.byteLength !== b.byteLength) return false;
          
          const a8 = new Uint8Array(a);
          const b8 = new Uint8Array(b);
          
          let result = 0;
          for (let i = 0; i < a8.length; i++) {
            result |= a8[i] ^ b8[i];
          }
          return result === 0;
        },
        
        // String to buffer
        textToBuffer(text: string): Uint8Array {
          return new TextEncoder().encode(text);
        },
        
        // Buffer to string
        bufferToText(buffer: Uint8Array | Buffer): string {
          return new TextDecoder().decode(buffer instanceof Buffer ? new Uint8Array(buffer) : buffer);
        },
        
        // Base64url decode to buffer
        base64UrlToBuffer(base64url: string): Uint8Array {
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
        base64UrlDecode(base64url: string): string {
          return this.bufferToText(this.base64UrlToBuffer(base64url));
        },
        
        // Buffer to base64url
        bufferToBase64Url(buffer: Uint8Array | Buffer): string {
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
  
  /**
   * Verifies a JWT token and returns the payload if valid.
   * 
   * @param token - The JWT token to verify
   * @param secret - The secret key used to sign the token
   * @param options - Optional verification parameters
   * @returns The decoded payload if verification succeeds
   * @throws Error - If verification fails for any reason
   */
  export async function jwtVerify(token: string, secret: string, options: JWTVerifyOptions = {}): Promise<JWTPayload> {
    // Default options
    const opts: JWTVerifyOptions = {
      algorithms: ['HS256', 'HS512'],
      ...options
    };
  
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
  
    const [headerB64, payloadB64, signatureB64] = parts;
  
    // Decode the header
    const header = JSON.parse(crypto.base64UrlDecode(headerB64)) as JWTHeader;
  
    // Check if the algorithm is supported
    const { alg } = header;
    if (!opts.algorithms?.includes(alg)) {
      throw new Error(`Algorithm not supported: ${alg}`);
    }
  
    // Verify the signature
    const data = `${headerB64}.${payloadB64}`;
    const isValid = await verifySignature(data, signatureB64, secret, alg);
  
    if (!isValid) {
      throw new Error('Invalid signature');
    }
  
    // Decode and verify the payload
    const payload = JSON.parse(crypto.base64UrlDecode(payloadB64)) as JWTPayload;
  
    // Verify expiration if present
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token has expired');
    }
  
    // Verify not before if present
    if (payload.nbf && Date.now() < payload.nbf * 1000) {
      throw new Error('Token not yet valid');
    }
  
    return payload;
  }
  
  /**
   * Verifies the signature of a JWT
   * 
   * @param data - The data that was signed (header.payload)
   * @param signatureB64 - The base64url encoded signature
   * @param secret - The secret key
   * @param algorithm - The algorithm used (HS256 or HS512)
   * @returns True if signature is valid
   */
  export async function verifySignature(
    data: string, 
    signatureB64: string, 
    secret: string, 
    algorithm: string
  ): Promise<boolean> {
    // Generate the expected signature
    const expectedSignature = await crypto.hmacSign(algorithm, secret, data);
    
    // Get the actual signature
    const actualSignature = crypto.base64UrlToBuffer(signatureB64);
    
    // Compare signatures in constant time
    return crypto.timingSafeEqual(
      actualSignature, 
      crypto.isNode ? expectedSignature : new Uint8Array(expectedSignature)
    );
  }
  
  /**
   * Decodes a JWT without verifying its signature
   * 
   * @param token - The JWT token
   * @returns The decoded parts of the token (header and payload)
   * @throws Error - If the token format is invalid
   */
  export function decodeJWT(token: string): DecodedJWT {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
  
    const [headerB64, payloadB64] = parts;
    
    return {
      header: JSON.parse(crypto.base64UrlDecode(headerB64)) as JWTHeader,
      payload: JSON.parse(crypto.base64UrlDecode(payloadB64)) as JWTPayload
    };
  }

export { crypto };