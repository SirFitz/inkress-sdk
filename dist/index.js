"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("./utils/jwt");
/**
 * Inkress payment processing library
 * Provides functions for creating orders, generating payment URLs, and handling webhooks
 */
class Inkress {
    /**
     * Creates a new Inkress instance
     * @param token - Your API token
     * @param clientKey - Your client key (optional)
     * @param mode - Your environment mode (live or test)
     */
    constructor({ token, clientKey = '', mode = 'live' }) {
        this.baseUrl = mode == 'live' ? 'https://inkress.com/api/v1' : 'https://dev.inkress.com/api/v1';
        this.token = token;
        this.clientKey = clientKey;
    }
    /**
     * Sets the client key for API requests
     * @param clientKey - Your client key
     */
    setClient(clientKey) {
        this.clientKey = clientKey;
    }
    /**
     * Sets the authentication token for API requests
     * @param token - Your API token
     */
    setToken(token) {
        this.token = token;
    }
    /**
     * Verifies and decodes a JWT token
     * @param token - JWT token to verify
     * @param secret - Secret key for verification
     * @returns Decoded payload or null if verification fails
     */
    verifyJWT(token, secret) {
        try {
            const decoded = (0, jwt_1.jwtVerify)(token, secret);
            return decoded;
        }
        catch (error) {
            console.error('Error while decoding and verifying JWT:', error);
            return null;
        }
    }
    /**
     * Creates an order via the Inkress API
     * @param order - OrderPlacementRequest details
     * @returns API response or null if request fails
     */
    createOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.baseUrl}/api/v1`;
            const headers = {
                'Content-Type': 'application/json',
                'Client-Key': this.clientKey,
                'Authorization': `Bearer ${this.token}`,
            };
            try {
                const response = yield fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(order)
                });
                const jsonData = yield response.json();
                return jsonData;
            }
            catch (error) {
                console.error('Error creating order:', error);
                return null;
            }
        });
    }
    /**
     * Decodes a base64-encoded JSON string
     * @param encoded - Base64-encoded JSON string
     * @returns Decoded JSON object or undefined if decoding fails
     */
    decodeB64JSON(encoded) {
        try {
            const jsonStr = decodeURIComponent(escape(atob(encoded)));
            return JSON.parse(jsonStr);
        }
        catch (error) {
            console.error('Error decoding base64 JSON:', error);
            return undefined;
        }
    }
    /**
     * Encodes a JSON object to base64
     * @param data - Object to encode
     * @returns Base64-encoded string
     */
    encodeJSONToB64(data) {
        try {
            const jsonStr = JSON.stringify(data);
            return btoa(unescape(encodeURIComponent(jsonStr)));
        }
        catch (error) {
            console.error('Error encoding JSON to base64:', error);
            throw new Error('Failed to encode payment data');
        }
    }
    /**
     * Generates a random ID for order references
     * @returns Random alphanumeric ID
     */
    generateRandomId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    /**
     * Validates required fields for payment URL creation
     * @param options - Payment options
     * @throws Error if required fields are missing
     */
    validatePaymentOptions(options) {
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
    createPaymentUrl(options) {
        var _a;
        this.validatePaymentOptions(options);
        const { username, total, currency_code = 'JMD', title = `Payment to ${username}`, reference_id = this.generateRandomId(), customer = {}, payment_link_id, } = options;
        const defaultCustomer = {
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
            customer: Object.assign(Object.assign({}, defaultCustomer), customer)
        };
        const orderToken = this.encodeJSONToB64(orderData);
        return `${(_a = this.baseUrl) === null || _a === void 0 ? void 0 : _a.replace('/api/v1', '')}/merchants/${encodeURIComponent(username)}/order?link_token=${payment_link_id || ''}&order_token=${orderToken}`;
    }
}
exports.default = Inkress;
