/**
 * EduPulse AI - Paystack Configuration & Utilities
 * Docs: https://paystack.com/docs/api
 *
 * Paystack handles recurring billing via Plans + Subscriptions API.
 * Payments are initiated via the Initialize Transaction endpoint,
 * and recurring charges happen automatically via the Subscription API.
 */

const crypto = require('crypto');

const PAYSTACK_CONFIG = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,       // sk_live_xxx or sk_test_xxx
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,       // pk_live_xxx or pk_test_xxx
  baseUrl: 'https://api.paystack.co',
  webhookSecret: process.env.PAYSTACK_SECRET_KEY,   // same key used to verify webhook HMAC
  callbackUrl: process.env.PAYSTACK_CALLBACK_URL,   // redirect after payment e.g. /billing/success
  currency: 'ZAR',
};

/**
 * Verify a Paystack webhook signature.
 * Paystack signs the raw request body with your secret key using HMAC SHA-512.
 */
const verifyWebhookSignature = (rawBody, signature) => {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_CONFIG.secretKey)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
};

/**
 * Build standard Paystack API request headers.
 */
const paystackHeaders = () => ({
  Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
  'Content-Type': 'application/json',
});

/**
 * Make an authenticated request to the Paystack API.
 */
const paystackRequest = async (method, path, body = null) => {
  const url = `${PAYSTACK_CONFIG.baseUrl}${path}`;
  const options = {
    method,
    headers: paystackHeaders(),
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  const data = await response.json();

  if (!data.status) {
    throw new Error(`Paystack API error: ${data.message}`);
  }
  return data;
};

/**
 * Convert Rands to Kobo (Paystack uses smallest currency unit).
 * R299 → 29900 kobo
 */
const toKobo = (cents) => cents; // our plans.js already stores in cents/kobo

/**
 * Convert kobo back to Rands string for display.
 */
const fromKobo = (kobo) => (kobo / 100).toFixed(2);

module.exports = {
  PAYSTACK_CONFIG,
  verifyWebhookSignature,
  paystackRequest,
  toKobo,
  fromKobo,
};
