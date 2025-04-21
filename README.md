[![npm](https://img.shields.io/npm/v/inkress-sdk.svg?maxAge=2592000)](https://www.npmjs.com/package/inkress-sdk)
[![downloads](https://img.shields.io/npm/dt/inkress-sdk.svg?maxAge=2592000)](https://www.npmjs.com/package/inkress-sdk)

# InkressAPI Wrapper

A simple TypeScript library to interact with the Inkress API and generate payment URLs.

## Installation

```bash
npm install inkress-payments
# or
yarn add inkress-payments
```

## Usage

### ES Modules / TypeScript

```javascript
import InkressPayments from 'inkress-sdk';

// Generate a payment URL
const paymentUrl = InkressPayments.createPaymentUrl({
  username: 'your-merchant-username',
  total: 150.50,
  currency_code: 'JMD',
  title: 'Product Purchase',
  customer: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '8761234567'
  }
});

console.log(paymentUrl);
// https://inkress.com/js/your-merchant-username/order?order_token=...
```

### CommonJS

```javascript
const InkressPayments = require('inkress-sdk').default;

// Generate a payment URL
const paymentUrl = InkressPayments.createPaymentUrl({
  username: 'your-merchant-username',
  total: 150.50
});

console.log(paymentUrl);
```

### Browser

```html
<script src="https://assets.inkress.com/dist/sdk.js"></script>
<!--
You may also specify the version with the suffix
<script src="https://assets.inkress.com/dist/sdk-0.0.5.js"></script>
-->
<script>
  // The library is available as window.InkressPayments
  const paymentUrl = InkressPayments.createPaymentUrl({
    username: 'your-merchant-username',
    total: 150.50
  });
  
  console.log(paymentUrl);
</script>
```


## API Reference

### `createPaymentUrl(options: PaymentURLOptions): string`

Generates a payment URL for the Inkress platform. Returns a string URL that can be shared with customers to complete payment.
#### Example

```typescript
const paymentUrl = api.createPaymentUrl({
  username: 'your-merchant-username', // Required
  total: 199.99,                       // Required
  currency_code: 'JMD',               // Optional (default: 'JMD')
  title: 'Product Purchase',          // Optional
  reference_id: 'order-123',          // Optional
  customer: {                         // Optional
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '8761234567'
  }
});
```

#### Parameters

- `options` (Object) - Configuration options for the payment URL
  - `username` (string, required) - Your merchant username
  - `total` (number, required) - The payment amount
  - `currency_code` (string, optional) - Currency code (default: 'JMD')
  - `title` (string, optional) - A title for the payment
  - `reference_id` (string, optional) - A custom reference ID (generated randomly if not provided)
  - `customer` (Object, optional) - Customer information
    - `first_name` (string, optional) - Customer's first name
    - `last_name` (string, optional) - Customer's last name
    - `email` (string, optional) - Customer's email address
    - `phone` (string, optional) - Customer's phone number

#### Returns

- (string) The generated Inkress payment URL

### `verifyJWT(token: string, secret: string): WebhookPayload | null`
Verifies a JWT from the Webhook using your secret.

#### Example

```js
const jwt = 'jwt_received_from_webhook';
const decoded = api.verifyJWT(jwt, 'your_secret_key_here');
```
#### Parameters
- `token` (string, required) - The JWT string contained in the payload of the webhook
- `secret` (string, required) - Your merchant secret

#### Returns

- (object) WebhookPayload object.


## Integration with RemixJS

Here's an example of how to use this library in a RemixJS application:

```javascript
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import InkressPayments from 'inkress-sdk';

export const loader = async () => {
  const paymentUrl = InkressPayments.createPaymentUrl({
    username: 'your-merchant-username',
    total: 199.99,
    title: 'Product Purchase',
    currency_code: 'JMD'
  });
  
  return json({ paymentUrl });
};

export default function Checkout() {
  const { paymentUrl } = useLoaderData();
  
  return (
    <div>
      <h1>Checkout</h1>
      <a href={paymentUrl} className="button">
        Proceed to Payment
      </a>
    </div>
  );
}
```

## Webhook Handling Example

Here's how to handle Inkress webhooks in an Express application:

```typescript
import express from 'express';
import InkressAPI from 'inkress-sdk';

const app = express();
app.use(express.json());

const INKRESS_WEBHOOK_SECRET = 'your-webhook-secret';
const inkress = new InkressAPI('your-api-token');

// Example: Handling Inkress webhooks
app.post('/webhooks/inkress', (req, res) => {
  try {
    // Get JWT token from request body
    const token = req.body.jwt;
    
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }
    
    // Verify and decode the webhook payload
    const payload = inkress.verifyJWT(token, INKRESS_WEBHOOK_SECRET);
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Process different webhook events
    switch (payload.status) {
      case 'paid':
        console.log('Payment received for order:', payload.reference);
        // Update order status, trigger fulfillment, etc.
        break;
        
      case 'error':
        console.log('Payment failed for order:', payload.reference);
        // Update order status, adjust inventory, etc.
        break;
        
      case 'refunded':
        console.log('Refund processed for order:', payload.reference);
        // Update order status, adjust inventory, etc.
        break;
        
      default:
        console.log('Processing status:', payload.status);
    }
    
    // Acknowledge receipt of webhook
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Types

#### PaymentURLOptions
Options for creating a payment URL:
```typescript
interface PaymentURLOptions {
  username: string;         // Merchant username (required)
  total: number;            // Total amount (required)
  currency_code?: string;   // Currency code (default: 'JMD')
  title?: string;           // Payment title
  reference_id?: string;    // Custom reference ID
  customer?: Customer;      // Customer information
}
```

#### Customer
Represents a customer:
```typescript
interface Customer {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}
```

#### WebhookPayload
Represents the encoded JWT data from the Webhook:
```typescript
interface WebhookPayload {
  provider: string;
  reference: string;
  currency: string;
  amount: number;
  client: Customer;
  status: 'pending | error | paid | refunded';
}
```


## Contributing
Contributions are welcome. Please open an issue or submit a pull request.

## License
MIT