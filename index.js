"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Inkress {
    clientKey;
    baseUrl;
    token;
    constructor(token, clientKey = '') {
        this.baseUrl = 'https://api.inkress.com/api/v1';
        this.token = token;
        this.clientKey = clientKey;
    }
    ;
    setClient(clientKey) {
        this.clientKey = clientKey;
    }
    ;
    setToken(token) {
        this.token = token;
    }
    ;
    async createOrder(order) {
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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            return jsonData;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    ;
}
exports.default = Inkress;
