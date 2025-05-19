import { OrderPlacementRequest, WebhookPayload, ApiResponse, PaymentURLOptions, Customer, OrderPlacementResponse, JWTVerifyOptions } from './types';
interface InkressInterface {
    setToken: (token: string) => void;
    setClient: (clientKey: string) => void;
    createOrder: (order: OrderPlacementRequest) => Promise<OrderPlacementResponse | null>;
    verifyJWT: (token: string, secret: string, options?: JWTVerifyOptions) => Promise<WebhookPayload | null>;
    createPaymentUrl: (options: PaymentURLOptions) => string;
    decodeB64JSON: (encoded: string) => any;
    generateRandomId: () => string;
}
/**
 * Inkress payment processing library
 * Provides functions for creating orders, generating payment URLs, and handling webhooks
 */
declare class Inkress implements InkressInterface {
    private clientKey;
    private baseUrl;
    private token;
    /**
     * Creates a new Inkress instance
     * @param token - Your API token
     * @param clientKey - Your client key (optional)
     * @param mode - Your environment mode (live or test)
     */
    constructor({ token, clientKey, mode }?: {
        token?: string;
        clientKey?: string;
        mode?: 'live' | 'test';
    });
    /**
     * Sets the client key for API requests
     * @param clientKey - Your client key
     */
    setClient(clientKey: string): void;
    /**
     * Sets the authentication token for API requests
     * @param token - Your API token
     */
    setToken(token: string): void;
    /**
     * Verifies and decodes a JWT token
     * @param token - JWT token to verify
     * @param secret - Secret key for verification
     * @param options - Optional verification parameters
     * @returns Decoded payload or null if verification fails
     */
    verifyJWT(token: string, secret: string, options?: JWTVerifyOptions): Promise<WebhookPayload | null>;
    /**
     * Creates an order via the Inkress API
     * @param order - OrderPlacementRequest details
     * @returns API response or null if request fails
     */
    createOrder(order: OrderPlacementRequest): Promise<OrderPlacementResponse | null>;
    /**
     * Decodes a base64-encoded JSON string
     * @param encoded - Base64-encoded JSON string
     * @returns Decoded JSON object or undefined if decoding fails
     */
    decodeB64JSON(encoded: string): any;
    /**
     * Encodes a JSON object to base64
     * @param data - Object to encode
     * @returns Base64-encoded string
     */
    private encodeJSONToB64;
    /**
     * Generates a random ID for order references
     * @returns Random alphanumeric ID
     */
    generateRandomId(): string;
    /**
     * Validates required fields for payment URL creation
     * @param options - Payment options
     * @throws Error if required fields are missing
     */
    private validatePaymentOptions;
    /**
     * Creates a payment URL for the Inkress platform
     * @param options - Configuration options for the payment URL
     * @returns Generated payment URL
     */
    createPaymentUrl(options: PaymentURLOptions): string;
}
export default Inkress;
export { OrderPlacementRequest, WebhookPayload, ApiResponse, PaymentURLOptions, Customer, OrderPlacementResponse, JWTVerifyOptions };
