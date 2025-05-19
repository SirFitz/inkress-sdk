import { OrderPlacementRequest, WebhookPayload, ApiResponse, PaymentURLOptions, Customer, OrderPlacementResponse } from './types';
import { jwtVerify } from './utils/jwt';
interface InkressInterface {
  setToken: (token: string) => void;
  setClient: (clientKey: string) => void;
  createOrder: (order: OrderPlacementRequest) => Promise<OrderPlacementResponse | null>;
  verifyJWT: (token: string, secret: string) => WebhookPayload | null;
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
    token,
    clientKey = '',
    mode = 'live'
  }: any) {
    this.baseUrl = mode == 'live' ? 'https://inkress.com/api/v1' : 'https://dev.inkress.com/api/v1';
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
   * @returns Decoded payload or null if verification fails
   */
  verifyJWT(token: string, secret: string): WebhookPayload | null {
    try {
      const decoded = jwtVerify(token, secret);
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
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(order)
      });

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
      const jsonStr = decodeURIComponent(escape(atob(encoded)));
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
      return btoa(unescape(encodeURIComponent(jsonStr)));
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
    return `${this.baseUrl?.replace('/api/v1', '')}/merchants/${encodeURIComponent(username)}/order?link_token=${payment_link_id || ''}&order_token=${orderToken}`;
  }

}

export default Inkress;