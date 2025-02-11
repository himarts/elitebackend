// config/paypal.js
import checkoutSdk from '@paypal/checkout-server-sdk';

// Set up the PayPal environment with your credentials
const clientId = process.env.PAYPAL_CLIENT_ID;  // Your PayPal Client ID
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;  // Your PayPal Client Secret

function environment() {
  return new checkoutSdk.core.SandboxEnvironment(clientId, clientSecret);  // Use 'LiveEnvironment' in production
}

function client() {
  return new checkoutSdk.core.PayPalHttpClient(environment());
}

export { client };
  