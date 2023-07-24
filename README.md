# InkressAPI Wrapper

A simple TypeScript library to interact with the Inkress API.

## Installation

### Using npm:

```bash
npm install --save inkress-api
```

### Using yarn:

```bash
yarn add inkress-api
```

Usage
Here's a simple example:
```typescript

import InkressAPI, { Order } from 'inkress-api';

const api = new InkressAPI('your_token_here'); // Replace 'your_token_here' with your actual token

api.setClient('your_client_key_here'); // Replace 'your_client_key_here' with your actual client_key

const order: Order = {
    total: 1.20,
    title: 'Package of webbies',
    kind: 'online',
    customer: {
        email: 'firsto_lasto@fleeksite.com',
        first_name: 'Firsto',
        last_name: 'Lasto',
        phone: '+13968419234',
    },
    reference_id: 'x002',
    currency_code: 'USD'
};

api.createOrder(order)
    .then(response => console.log(response))
    .catch(error => console.error(error));
```

### API
#### setToken(token: string)
Sets the authorization token to be used in API requests.

#### setClient(clientKey: string)
Sets the client key to be used in API requests.

#### createOrder(order: Order): Promise<ApiResponse | null>
Creates an order with the given details. Returns a Promise that resolves to an ApiResponse object if successful, or null if an error occurs.


### Types

#### Order
Represents an order. Has the following properties:
```typescript
interface Order {
    total: number
    title: string
    kind: string
    customer: {
        email: string
        first_name: string
        last_name: string
        phone: string
    }
    reference_id: string
    currency_code: string
}
```

#### ApiResponse
Represents the response from the Inkress API. Has the following properties:
```typescript
interface ApiResponse {
    state: string
    result: {
        customer: Customer
        order_details: OrderDetails
        payment_urls: PaymentURLs
    }
}
```

### Contributing
Contributions are welcome. Please open an issue or submit a pull request.

### License
MIT

```csharp
This README provides an overview of the library, explains how to install it, provides an example usage, documents the API and the types used, and invites contributions. You can add, remove, or modify sections based on the specific needs of your project.
```