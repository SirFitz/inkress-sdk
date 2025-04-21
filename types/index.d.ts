import Inkress from "../index";

// Define the structure for the customer
export interface Customer {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone: string;
}

// Define the structure for the order
export interface OrderPlacementRequest {
  total: number
  title: string
  kind: string
  customer: Customer;
  reference_id: string
  currency_code: string
}

// Define the structure for the order details
export interface OrderDetails {
  title: string;
  order_id: number;
  billing_address_frozen: null;
  discount_code_frozen: null;
  discount_total_frozen: number;
  merchant_name_frozen: string;
  shipping_address_frozen: null;
  shipping_method_frozen: null;
  tax_total_frozen: number;
}

// Define the structure for the payment URL response
export interface PaymentURLs {
  qr_url: string;
  short_link: string;
}

// Define the structure for the result
export interface Result {
  customer: Customer;
  order_details: OrderDetails;
  payment_urls: PaymentURLs;
}


export interface OrderPlacementResponse {
  state: string;
  result: {
    id: number;
    status: number;
    total: number;
    currency: string;
    reference_id: string;
    created_at: string;
    customer: {
      email: string;
      first_name: string;
      last_name: string;
    };
    provider: {
      name: string;
    };
    title: string;
    urls: {
      short: string;
      qr: string;
      invoice: string;
      return: string | null;
    };
  };
}

// Define the structure for the main API response
export interface ApiResponse<T> {
  state: "ok" | "error";
  result: Result;
}

// Define the structure for the JWT payload
export interface WebhookPayload {
  facilitator: "Inkress";
  provider: string;
  provider_id: string;
  reference: string;
  currency: string;
  amount: number;
  client: Customer;
  status: 'pending | error | paid | partial | confirmed | cancelled | prepared | shipped | delivered | completed | returned | refunded';
}

/**
 * Options for creating a payment URL
 */
export interface PaymentURLOptions {
  username: string;
  total: number;
  payment_link_id?: string;
  /**
   * Currency code (default: 'JMD')
   */
  currency_code?: string;
  title?: string;
  reference_id?: string;
  customer?: Customer;
}


export default Inkress;