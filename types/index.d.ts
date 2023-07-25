import Inkress from "../index";

// Define the structure for the customer
export interface Customer {
  status?: number;
  uid?: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
}

// Define the structure for the order
export interface Order {
  total: number;
  title: string;
  kind: string;
  customer: Customer;
  reference_id: string;
  currency_code: string;
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

// Define the structure for the main API response
export interface ApiResponse {
  state: "ok" | "error";
  result: Result;
}

// Define the structure for the JWT payload
export interface WebhookPayload {
  provider: string;
  reference: string;
  currency: string;
  amount: number;
  client: Customer;
}


export default Inkress;
  