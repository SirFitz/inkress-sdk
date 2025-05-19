/**
 * JWT Verification Module
 *
 * A universal module for verifying JWTs using HS256 or HS512 algorithms
 * that works in both browser and Node.js environments.
 */
import { JWTVerifyOptions, JWTPayload, DecodedJWT, JWTCrypto } from '../types';
declare const crypto: JWTCrypto;
/**
 * Verifies a JWT token and returns the payload if valid.
 *
 * @param token - The JWT token to verify
 * @param secret - The secret key used to sign the token
 * @param options - Optional verification parameters
 * @returns The decoded payload if verification succeeds
 * @throws Error - If verification fails for any reason
 */
export declare function jwtVerify(token: string, secret: string, options?: JWTVerifyOptions): Promise<JWTPayload>;
/**
 * Verifies the signature of a JWT
 *
 * @param data - The data that was signed (header.payload)
 * @param signatureB64 - The base64url encoded signature
 * @param secret - The secret key
 * @param algorithm - The algorithm used (HS256 or HS512)
 * @returns True if signature is valid
 */
export declare function verifySignature(data: string, signatureB64: string, secret: string, algorithm: string): Promise<boolean>;
/**
 * Decodes a JWT without verifying its signature
 *
 * @param token - The JWT token
 * @returns The decoded parts of the token (header and payload)
 * @throws Error - If the token format is invalid
 */
export declare function decodeJWT(token: string): DecodedJWT;
export { crypto };
