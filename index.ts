import { Order, WebhookPayload, ApiResponse } from './types';
import jwt from 'jsonwebtoken';

interface InkressInterface {
  setToken: (token: string) => void;
  setClient: (clientKey: string) => void;
  createOrder: (order: Order) => Promise<ApiResponse | null>;
  verifyJWT: (token: string, secret: string) => WebhookPayload | null;
}

class Inkress implements InkressInterface {
  private clientKey: string;
  private baseUrl: string;
  private token: string;

  constructor(token: string, clientKey: string = '') {
    this.baseUrl = 'https://api.inkress.com/api/v1';
    this.token = token;
    this.clientKey = clientKey;
  };

  setClient(clientKey: string) {
    this.clientKey = clientKey;
  };

  setToken(token: string) {
    this.token = token;
  };

  verifyJWT(token: string, secret: string): WebhookPayload | null {
    try {
      const decoded = jwt.verify(token, secret);
      return decoded as WebhookPayload;
    } catch (error) {
      console.error('Error while decoding and verifying JWT:', error);
      return null;
    }
  };

  async createOrder(order: Order): Promise<ApiResponse | null> {
    const url = `${this.baseUrl}/orders`;
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

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      const jsonData: ApiResponse = await response.json();
      return jsonData;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
}

export default Inkress;

