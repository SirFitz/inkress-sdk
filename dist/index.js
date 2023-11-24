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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class Inkress {
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
    verifyJWT(token, secret) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            return decoded;
        }
        catch (error) {
            console.error('Error while decoding and verifying JWT:', error);
            return null;
        }
    }
    ;
    createOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.baseUrl}/orders`;
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
                // if (!response.ok) {
                //   throw new Error(`HTTP error! status: ${response.status}`);
                // }
                const jsonData = yield response.json();
                return jsonData;
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    ;
}
exports.default = Inkress;
