import { OrderPlacementRequest, WebhookPayload, ApiResponse, PaymentURLOptions, Customer, OrderPlacementResponse, JWTVerifyOptions } from './types';
import { jwtVerify } from './utils/jwt';

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
class Inkress implements InkressInterface {
  private clientKey: string;
  private baseUrl: string;
  private token: string;

  /**
   * Creates a new Inkress instance
   * @param token - Your API token
   * @param clientKey - Your client key (optional)
   * @param mode - Your environment mode (live or test)
   */
  constructor({
    token = '',
    clientKey = '',
    mode = 'live'
  }: { 
    token?: string;
    clientKey?: string;
    mode?: 'live' | 'test';
  } = {}) {
    this.baseUrl = mode === 'live' ? 'https://inkress.com/api/v1' : 'https://dev.inkress.com/api/v1';
    this.token = token;
    this.clientKey = clientKey;
  }

  /**
   * Sets the client key for API requests
   * @param clientKey - Your client key
   */
  setClient(clientKey: string): void {
    this.clientKey = clientKey;
  }

  /**
   * Sets the authentication token for API requests
   * @param token - Your API token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Verifies and decodes a JWT token
   * @param token - JWT token to verify
   * @param secret - Secret key for verification
   * @param options - Optional verification parameters
   * @returns Decoded payload or null if verification fails
   */
  async verifyJWT(token: string, secret: string, options?: JWTVerifyOptions): Promise<WebhookPayload | null> {
    try {
      const decoded = await jwtVerify(token, secret, options);
      return decoded as WebhookPayload;
    } catch (error) {
      console.error('Error while decoding and verifying JWT:', error);
      return null;
    }
  }

  /**
   * Creates an order via the Inkress API
   * @param order - OrderPlacementRequest details
   * @returns API response or null if request fails
   */
  async createOrder(order: OrderPlacementRequest): Promise<OrderPlacementResponse | null> {
    const url = `${this.baseUrl}/api/v1`;
    const headers = {
      'Content-Type': 'application/json',
      'Client-Key': this.clientKey,
      'Authorization': `Bearer ${this.token}`,
    };

    try {
      // Using native fetch which is available in both modern browsers and Node.js v18+
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const jsonData: OrderPlacementResponse = await response.json();
      return jsonData;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  /**
   * Decodes a base64-encoded JSON string
   * @param encoded - Base64-encoded JSON string
   * @returns Decoded JSON object or undefined if decoding fails
   */
  decodeB64JSON(encoded: string): any {
    try {
      // Using TextDecoder for more universal compatibility
      const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
      
      // Handle decoding differently based on environment
      let jsonStr: string;
      if (isNode) {
        // Node.js environment
        const buffer = Buffer.from(encoded, 'base64');
        jsonStr = buffer.toString('utf-8');
      } else {
        // Browser environment
        jsonStr = decodeURIComponent(escape(atob(encoded)));
      }
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error decoding base64 JSON:', error);
      return undefined;
    }
  }

  /**
   * Encodes a JSON object to base64
   * @param data - Object to encode
   * @returns Base64-encoded string
   */
  private encodeJSONToB64(data: any): string {
    try {
      const jsonStr = JSON.stringify(data);
      
      // Handle encoding differently based on environment
      const isNode = typeof window === 'undefined' && typeof process !== 'undefined';
      
      if (isNode) {
        // Node.js environment
        return Buffer.from(jsonStr).toString('base64');
      } else {
        // Browser environment
        return btoa(unescape(encodeURIComponent(jsonStr)));
      }
    } catch (error) {
      console.error('Error encoding JSON to base64:', error);
      throw new Error('Failed to encode payment data');
    }
  }

  /**
   * Generates a random ID for order references
   * @returns Random alphanumeric ID
   */
  generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Validates required fields for payment URL creation
   * @param options - Payment options
   * @throws Error if required fields are missing
   */
  private validatePaymentOptions(options: PaymentURLOptions): void {
    const { username, total } = options;
    
    if (!username) {
      throw new Error('Merchant username is required');
    }
    
    if (total === undefined || total === null || isNaN(Number(total))) {
      throw new Error('Valid total amount is required');
    }
  }

  /**
   * Creates a payment URL for the Inkress platform
   * @param options - Configuration options for the payment URL
   * @returns Generated payment URL
   */
  createPaymentUrl(options: PaymentURLOptions): string {
    this.validatePaymentOptions(options);
    
    const {
      username,
      total,
      currency_code = 'JMD',
      title = `Payment to ${username}`,
      reference_id = this.generateRandomId(),
      customer = {},
      payment_link_id,
    } = options;
    
    const defaultCustomer: Customer = {
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    };
    
    const orderData = {
      total: Number(total),
      currency_code,
      title,
      reference_id,
      customer: {
        ...defaultCustomer,
        ...customer
      }
    };
    
    const orderToken = this.encodeJSONToB64(orderData);
    const baseUrlWithoutApi = this.baseUrl.replace('/api/v1', '');
    return `${baseUrlWithoutApi}/merchants/${encodeURIComponent(username)}/order?link_token=${payment_link_id || ''}&order_token=${orderToken}`;
  }
}

export default Inkress;
export { OrderPlacementRequest, WebhookPayload, ApiResponse, PaymentURLOptions, Customer, OrderPlacementResponse, JWTVerifyOptions };